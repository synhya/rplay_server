import type { Request, RequestHandler, Response } from "express";

import { userService } from "@/api/user/userService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";

class UserController {
  public getUsers: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await userService.findAll();
    return handleServiceResponse(serviceResponse, res);
  };

  public getUser: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await userService.findById(req.params.id);
    return handleServiceResponse(serviceResponse, res);
  };

  public getStreamKey: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await userService.findStreamKeyById(req.params.id);
    return handleServiceResponse(serviceResponse, res);
  };

  public createUser: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await userService.createUser(req.body);
    return handleServiceResponse(serviceResponse, res);
  };
}

export const userController = new UserController();
