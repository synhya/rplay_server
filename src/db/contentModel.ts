import mongoose, { Schema } from "mongoose";

const contentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "user", required: true },

    // 비디오 메타 정보
    thumbnail: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    tags: { type: [String], default: [] },

    // 콘텐츠 관람등급
    adult: { type: Boolean, default: false },
    blurThumbnail: { type: Boolean, default: false },

    // 구독제/코인제 여부
    isSubscriptionBased: { type: Boolean, default: false },
    isCoinBased: { type: Boolean, default: false },

    // 구독 티어별 접근 가능 여부 (구독제일 경우)
    tierAccess: [{ subscriptionTier: { type: Schema.Types.ObjectId, ref: "subscriptiontier" } }],
    // 코인제일 경우 가격
    priceCoin: { type: Number, default: 0 },

    // 영상파일
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true },
    preview: { type: String },

    // 공동제작 수익배분
    share: {
      type: [
        {
          user: { type: Schema.Types.ObjectId, ref: "user" },
          share: { type: Number, required: true }, // 수익 비율
        },
      ],
      _id: false,
    },

    // 플레이 메타 정보
    viewCount: { type: Number, default: 0 },
    playTime: { type: Number, required: true },
    likeCount: { type: Number, default: 0 },
    dislikeCount: { type: Number, default: 0 },
    comments: { type: [String], default: [] },
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

export const ContentModel = mongoose.model("content", contentSchema);
