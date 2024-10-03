import { commonValidations } from "@/common/utils/commonValidation";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export type User = z.infer<typeof UserSchema>;
export const UserSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Input Validation for 'GET users/:id' endpoint
export const GetUserSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

export const PostUserSchema = z.object({
  body: UserSchema.omit({
    _id: true,
    createdAt: true,
    updatedAt: true,
  }),
});
