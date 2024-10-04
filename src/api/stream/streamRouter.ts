import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { verifyToken } from "@/common/utils/httpHandlers";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express from "express";
import { z } from "zod";

export const streamRegistry = new OpenAPIRegistry();
export const streamRouter = express.Router();

streamRouter.get("/video/track.m3u8", verifyToken);