import type { User } from "@/api/user/userValidation";
import mongoose, { Schema } from "mongoose";

const schema = new Schema(
  {
    user: { ref: "user", required: true, index: true, type: Schema.Types.ObjectId },
    current: {
      streamId: { type: String, required: true },
      startedAt: { type: Date, required: true },
    },
    history: {
      type: [
        {
          streamId: { type: String, required: true },
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
