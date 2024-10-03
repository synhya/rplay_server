import type { User } from "@/api/user/userValidation";
import mongoose, { Schema } from "mongoose";

const userSchemaMongoose = new Schema(
  {
    name: { type: String, required: true, unique: true }, // 필수 필드 설정
    email: { type: String, required: true, unique: true, index: true }, // 필수, 고유, 인덱스 설정
    age: { type: String, required: true }, // 필수 필드 설정
  },
  {
    timestamps: true,
    virtuals: {
      idStr: {
        get: function () {
          return this._id.toString();
        },
      },
    },
  },
);

export const UserModel = mongoose.model<User>("user", userSchemaMongoose);
