// authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import helper from "../helper";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export interface AuthRequest extends Request {
  user?: any;
}

export class AuthMiddleware {
  private throwError(message: string, statusCode: number): never {
    const err: any = new Error(message);
    err.statusCode = statusCode;
    throw err;
  }

  verifyToken = (req: AuthRequest, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      this.throwError("No token provided", helper.StatusCode.Unauthorized);
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch {
      this.throwError(
        "Invalid or expired token",
        helper.StatusCode.Unauthorized,
      );
    }
  };
}
