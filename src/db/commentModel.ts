import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
  {
    // 댓글이 달린 콘텐츠
    content: { type: Schema.Types.ObjectId, ref: "Post", required: true }, // 'Post'는 댓글이 달린 콘텐츠 모델 (예: 커뮤니티 포스트, 비디오 등)

    // 댓글 인덱스 (대댓글 등 용도)
    commentIdx: { type: Number, default: -1 },

    // 댓글 모드 (커뮤니티, 비디오 등 구분)
    mode: { type: String, enum: ["communityComment", "videoComment", "other"], default: "communityComment" },

    // 댓글 내용
    commentContent: {
      text: { type: String, required: true },
      donationAmount: { type: Number, default: 0 }, // 기부 금액
      commenter: { type: Schema.Types.ObjectId, ref: "User", required: true }, // 댓글 작성자
      commentReceiver: { type: Schema.Types.ObjectId, ref: "User", required: true }, // 댓글 수신자
    },

    // 추가적인 정보
    isWeb: { type: Boolean, default: true },
    lang: { type: String, default: "ko" },

    // 요청자 (주로 API 요청을 보낸 유저)
    requestor: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // 로그인 타입
    loginType: { type: String, default: "plax" },

    // Google Analytics ID
    gaClientId: { type: String },

    // 관리자가 확인했는지 여부
    checkAdmin: { type: Boolean, default: null },
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 생성
  }
);

export const CommentModel = mongoose.model("Comment", commentSchema);
