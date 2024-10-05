import type { User } from "@/api/user/userValidation";
import mongoose, { Schema } from "mongoose";

const userSchemaMongoose = new Schema(
  {
    // 회원가입을 이메일로 해도 구글로 로그인이 가능한 시스템임.
    
    googleId: { type: String },
    kakaoId: { type: String },
    name: { type: String, required: true, unique: true }, // 필수 필드 설정
    email: { type: String, required: true, unique: true, index: true }, // 필수, 고유, 인덱스 설정
    password: { type: String }, // 비밀번호는 필수가 아님
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
