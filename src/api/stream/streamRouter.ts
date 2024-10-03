import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express from "express";
import { z } from "zod";

export const streamRegistry = new OpenAPIRegistry();
export const streamRouter = express.Router();
