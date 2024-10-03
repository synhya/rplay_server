import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { GetUserSchema, PostUserSchema, UserSchema } from "@/api/user/userValidation";
import { validateRequest } from "@/common/utils/httpHandlers";
import { userController } from "./userController";

export const userRegistry = new OpenAPIRegistry();
export const userRouter: Router = express.Router();

userRegistry.register("User", UserSchema);

userRegistry.registerPath({
  method: "get",
  path: "/users",
  tags: ["User"],
  responses: createApiResponse(z.array(UserSchema), "Success"),
});

userRouter.get("/", userController.getUsers);

userRegistry.registerPath({
  method: "get",
  path: "/users/{id}",
  tags: ["User"],
  request: { params: GetUserSchema.shape.params },
  responses: createApiResponse(UserSchema, "Success"),
});

userRouter.get("/:id", validateRequest(GetUserSchema), userController.getUser);

userRegistry.registerPath({
  method: "get",
  path: "/users/{id}",
  tags: ["User"],
  request: { params: GetUserSchema.shape.params },
  responses: createApiResponse(UserSchema, "Success"),
});

userRegistry.registerPath({
  method: "get",
  path: "/users/{id}/stream-key",
  tags: ["User"],
  request: { params: GetUserSchema.shape.params },
  responses: createApiResponse(z.string(), "Success"),
});

userRouter.get("/:id/stream-key", userController.getStreamKey);

userRegistry.registerPath({
  method: "post",
  path: "/users",
  tags: ["User"],
  request: {
    body: {
      content: { "application/json": { schema: PostUserSchema.shape.body } },
    },
  },
  responses: createApiResponse(UserSchema, "Success"),
});

userRouter.post("/", validateRequest(PostUserSchema), userController.createUser);
