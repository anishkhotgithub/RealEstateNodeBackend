import { Request, Response, NextFunction } from "express";
import { MongoServerError } from "mongodb";
import { Container } from "typedi";
import { Logger } from "winston";
import { ZodError } from "zod";
import helper from "../helper";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const logger: Logger = Container.get("logger");

  // Zod validation errors
  if (error instanceof ZodError) {
    const formattedErrors = error.issues.map((e) => ({
      path: e.path.join("."),
      message: e.message,
    }));

    logger.warn(`Validation failed on ${req.method} ${req.originalUrl}`);

    return res.status(helper.StatusCode.BadRequest).json({
      message: "Validation failed",
      errors: formattedErrors,
    });
  }

  // MongoDB error
  if (error instanceof MongoServerError) {
    const field = Object.keys(error.keyPattern || {})[0];
    const value = error.keyValue?.[field];

    logger.error(
      `MongoDB error: ${field} = "${value}" on ${req.method} ${req.originalUrl}`,
    );

    return res.status(helper.StatusCode.AlreadyExists).json({
      message: `${field} already exists`,
      error: error.message,
    });
  }

  // Standard errors
  if (error instanceof Error) {
    const statusCode =
      (error as any).statusCode || helper.StatusCode.InternalError;
    logger.error(`${error.message} on ${req.method} ${req.originalUrl}`);
    return res.status(statusCode).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }

  // Unknown errors
  logger.error(`Unknown error on ${req.method} ${req.originalUrl}`, { error });

  return res.status(helper.StatusCode.InternalError).json({
    message: "Internal Server Error",
    error: String(error),
  });
};

export const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
