
import mongoose, { Schema } from "mongoose";

const channelInfoSchema = new Schema(
  {
    // 유저랑 1대1 관계기는 한데 일단 이게 필요 없는 경우가 많으니까 (내채널 페이지 안들어가면 안씀)
    user: { type: Schema.Types.ObjectId, ref: "user", required: true },
    description: { type: String, default: "" },
    subscriptionTiers: {
      type: [

      ]
    },
    socialLinks: {
      type: [
        {
          platform: { type: String, default: "N/A" },
          link: { type: String, required: true },
        }
      ]
    },
    // 구독자, 비구독자용 안내 문구가 다를 수 있음.
    // 당연히 관람등급도 나눠야함.
    // api/content/like
    // api/content/comment
    posts: {
      type: [
        {
          user: { type: Schema.Types.ObjectId, ref: "user", required: true },
          content: { type: String, required: true },
          images: { type: [String], default: [] },
          video: { type: String, default: "" },
          likes: { type: [Schema.Types.ObjectId], default: [] },
          comments: {
            type: [
              {
                user: { type: Schema.Types.ObjectId, ref: "user", required: true },
                content: { type: String, required: true },
                likes: { type: [Schema.Types.ObjectId], default: [] },
              }
            ]
          }
        }
      ]
    }
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

export const ChannelInfoModel = mongoose.model("channelinfo", channelInfoSchema);
