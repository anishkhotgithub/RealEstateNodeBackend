import Redis from "ioredis";

let retryCount = 0;
let hasLoggedError = false;

export const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,

  retryStrategy: (times) => {
    retryCount = times;

    // Stop retrying after 3 attempts
    if (times > 3) {
      console.error("❌ Redis retry limit reached. Stopping reconnect.");
      return null; // returning null stops retrying
    }

    return Math.min(times * 1000, 3000); // retry delay
  },
});

redis.on("connect", () => {
  console.log("🟢 Redis connected");
  hasLoggedError = false;
  retryCount = 0;
});

redis.on("error", (err: any) => {
  if (!hasLoggedError) {
    console.error("🔴 Redis error:", err.message);
    hasLoggedError = true;
  }
});

redis.on("end", () => {
  if (retryCount > 3) {
    console.error("❌ Redis connection closed after max retries.");
  }
});
