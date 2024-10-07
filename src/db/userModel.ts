import type { User } from "@/api/user/userValidation";
import mongoose, { Schema } from "mongoose";
import { should } from "vitest";

const userSchemaMongoose = new Schema(
  {
    // user, creator, admin
    role: { type: String, required: true, default: "user" }, // 필수 필드 설정

    // 회원가입을 이메일로 해도 구글로 로그인이 가능한 시스템임.
    googleId: { type: String },
    kakaoId: { type: String },
    nickname: { type: String, required: true, unique: true }, // 필수 필드 설정
    email: { type: String, required: true, unique: true, index: true }, // 필수, 고유, 인덱스 설정
    password: { type: String }, // 비밀번호는 필수가 아님
    profileImage: { type: String }, // 프로필 이미지는 필수가 아님

    //
    isCreator: { type: Boolean, default: false },
    isAdult: { type: Boolean, default: false },

    // 플레이리스트
    // https://api.rplay.live/content/playlist?playlistOid=6703c7a66b63938a82c13af9&lang=ko&requestorOid=66f89cd92cd15aaa0fa41484&loginType=plax&gaClientId=99101663.1727532757
    playlists: {
      type: [{ type: Schema.Types.ObjectId, ref: "playlist" }],
      _id: false,
      required: true,
    },

    // 장바구니
    shoppingCart: {
      type: [{ content: { type: Schema.Types.ObjectId, ref: "content" } }],
      _id: false,
      required: true,
    },

    // 알림
    notifications: {
      type: [
        {
          type: { type: String, required: true },
          user: { type: Schema.Types.ObjectId, ref: "user" },
          content: { type: Schema.Types.ObjectId, ref: "content" },
          read: { type: Boolean, default: false },
        },
      ],
      _id: false,
      required: true,
    },

    // 구독 채널리스트
    subscribingTo: {
      type: [
        {
          channel: { type: Schema.Types.ObjectId, ref: "channel" },
          subscriptionTier: { type: Schema.Types.ObjectId, ref: "subscriptiontier" },
        },
      ],
      _id: false,
      required: true,
    },
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
  }
);

export const UserModel = mongoose.model<User>("user", userSchemaMongoose);
