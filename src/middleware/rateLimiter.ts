import { Request, Response, NextFunction } from "express";
import { redis } from "../helper/redis";
import helper from "../helper";

/**
 * Leaky Bucket Rate Limiter
 * @param maxRequests Bucket capacity
 * @param windowSeconds Time window in seconds (defines leak rate)
 */
export const leakyBucketRateLimiter = (
  maxRequests: number,
  windowSeconds: number,
) => {
  const leakRate = maxRequests / windowSeconds; // requests per second

  return async (req: Request, res: Response, next: NextFunction) => {
    // try {
    const identifier = req.ip || req.headers["x-forwarded-for"] || "anonymous";

    const key = `leaky:${identifier}:${req.path}`;
    const now = Date.now();

    // Get current bucket state
    const data = await redis.hgetall(key);

    const last = data.last ? Number(data.last) : now;
    const water = data.water ? Number(data.water) : 0;

    // Calculate leaked water
    const elapsedSeconds = (now - last) / 1000;
    const leaked = elapsedSeconds * leakRate;

    // Update water level
    const currentWater = Math.max(0, water - leaked) + 1;

    if (currentWater > maxRequests) {
      return res.status(helper.StatusCode.TooManyRequests).json({
        message: "Too many requests. Please try again later.",
      });
    }

    // Save new state
    await redis.hmset(key, {
      water: currentWater.toString(),
      last: now.toString(),
    });

    // Set TTL slightly larger than window
    await redis.expire(key, windowSeconds * 2);

    next();
    // } catch (err) {
    //   console.error("Leaky bucket error:", err);
    //   next(); // fail-open
    // }
  };
};
