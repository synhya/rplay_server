import type { User } from "@/api/user/userValidation";
import mongoose, { Schema } from "mongoose";

const schema = new Schema(
  {
    user: { ref: "user", required: true, index: true, type: Schema.Types.ObjectId },
    // 스트림 키를 바꿀때는 항상 스트리밍 중인지 확인 필요하다.
    streamKey: {
      value: { type: String, required: true },
      expiresAt: { type: Date, required: true },
    },
    current: {
      streamId: { type: String, required: true },
      startedAt: { type: Date, required: true },
    },
    history: {
      type: [
        {
          startedAt: { type: Date, required: true },
          endedAt: { type: Date, required: true },
        },
      ],
      required: true,
    },
  },
  {
    timestamps: true,
    virtuals: {
      totalStreamTimeInMs: {
        get: function () {
          return this.history.reduce((acc, curr) => {
            return acc + curr.endedAt.getTime() - curr.startedAt.getTime();
          }, 0);
        },
      },
    },
  },
);

export const StreamModel = mongoose.model("user", schema);
