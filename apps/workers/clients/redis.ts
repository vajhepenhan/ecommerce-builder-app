import { createClient } from "redis";
import { logger } from "../utils/logger";
import { config } from "../config";

export const redis = createClient({
  url: config.REDIS_URL,
});

redis.on("connect", () => logger.info("Redis: Connected"));
redis.on("error", err => logger.error("Redis Error:", err));

await redis.connect();
