import { env } from "@/common/utils/envConfig";
import { app, logger } from "@/server";
import { connect as connectdb } from "./db";

// DB 연결 후 서버 시작
const startServer = async () => {
  try {
    await connectdb(); // 데이터베이스 연결 대기

    const apiServer = app.listen(env.PORT, () => {
      const { NODE_ENV, HOST, PORT } = env;
      logger.info(`Server (${NODE_ENV}) running on port http://${HOST}:${PORT}`);
    });

    // Graceful shutdown 처리
    const onCloseSignal = () => {
      logger.info("SIGINT/SIGTERM received, shutting down");
      apiServer.close(() => {
        logger.info("Server closed");
        process.exit();
      });
      // setTimeout(() => process.exit(1), 10000).unref(); // Force shutdown after 10s
    };

    process.on("SIGINT", onCloseSignal);
    process.on("SIGTERM", onCloseSignal);
  } catch (error) {
    logger.error("Failed to connect to the database", error);
    process.exit(1); // 데이터베이스 연결 실패 시 프로세스 종료
  }
};

// 서버 시작
startServer();
