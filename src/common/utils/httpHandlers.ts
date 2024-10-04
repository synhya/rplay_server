import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { ZodError, ZodSchema } from "zod";
import jwt from "jsonwebtoken";

import { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "./envConfig";

export const handleServiceResponse = (serviceResponse: ServiceResponse<any>, response: Response) => {
  return response.status(serviceResponse.statusCode).send(serviceResponse);
};

export const validateRequest = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({ body: req.body, query: req.query, params: req.params });
    next();
  } catch (err) {
    const errorMessage = `Invalid input: ${(err as ZodError).errors.map((e) => e.message).join(", ")}`;
    const statusCode = StatusCodes.BAD_REQUEST;
    const serviceResponse = ServiceResponse.failure(errorMessage, null, statusCode);
    return handleServiceResponse(serviceResponse, res);
  }
};

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // 토큰이 없을 경우 처리
  if (!authHeader) {
    const errorMessage = "Token not provided";
    const statusCode = StatusCodes.UNAUTHORIZED;
    const serviceResponse = ServiceResponse.failure(errorMessage, null, statusCode);
    return handleServiceResponse(serviceResponse, res);
  }

  // "Bearer <token>"에서 "Bearer " 부분 제거하고 토큰만 추출
  const token = authHeader.split(' ')[1];
  if (!token) {
    const errorMessage = "Token not provided";
    const statusCode = StatusCodes.UNAUTHORIZED;
    const serviceResponse = ServiceResponse.failure(errorMessage, null, statusCode);
    return handleServiceResponse(serviceResponse, res);
  }

  // Verify token
  jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
    if (err) {
      const errorMessage = "Token is invalid";
      const statusCode = StatusCodes.UNAUTHORIZED;
      const serviceResponse = ServiceResponse.failure(errorMessage, null, statusCode);
      return handleServiceResponse(serviceResponse, res);
    }

    req.body.decoded = decoded; // 토큰에서 추출한 사용자 정보 저장
    next();
  });
};
