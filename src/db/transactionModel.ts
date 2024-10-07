import mongoose, { Schema } from "mongoose";

const transactionSchema = new Schema(
  {
    // 결제된 유저
    user: { type: Schema.Types.ObjectId, ref: "user", required: true },

    // 결제가 연결된 비디오나 상품
    content: { type: Schema.Types.ObjectId, ref: "content", required: false }, 
    // 결제가 적용된 구독 티어
    subscriptionTier: { type: Schema.Types.ObjectId, ref: "subscriptiontier", required: false },

    // 결제 유형 (구독 또는 코인 결제)
    type: {
      type: String,
      enum: ["subscription", "coin", "iap"],
      required: true,
    },

    // 결제된 금액
    amount: { type: Number, required: true },
    // 결제 통화 (KRW, USD, JPY 등)
    currency: { type: String, default: "KRW" },

    // 결제 상태 (정상, 환불됨)
    status: { type: String, enum: ["success", "refunded"], default: "success" },

    // 환불 관련 정보
    refund: {
      refundedAmount: { type: Number, default: 0 },
      refundedAt: { type: Date },
    },

    // 수수료 및 실수익
    platformFee: { type: Number, default: 0 }, // 플랫폼이 가져가는 수수료
    netRevenue: { type: Number, required: true }, // 실제 수익 (amount - platformFee)
  },
  {
    timestamps: true,
  }
);

export const TransactionModel = mongoose.model("Transaction", transactionSchema);
