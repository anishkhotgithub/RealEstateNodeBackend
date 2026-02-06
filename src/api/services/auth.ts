import { Service, Inject } from "typedi";
import { Logger } from "winston";
import {
  CreateAuthSchema,
  GetAuthSchema,
  LoginSchema,
  UpdateAuthSchema,
} from "../types/auth";
import Helper from "../../helper";
import mongoose from "mongoose";
import * as z from "zod";
import { redis } from "../../helper/redis";
import config from "../config/config";
import bcrypt from "bcrypt";
import { generateToken } from "../../helper/jwt";

@Service()
export default class AuthService {
  constructor(
    @Inject("throwError")
    private throwError: (message: string, statusCode: number) => never,
    @Inject("logger") private logger: Logger,
    @Inject("authModel") private authModel: mongoose.Model<any>,
    @Inject("roleModel") private roleModel: mongoose.Model<any>,
  ) {}

  async createAuth(req: any): Promise<{ user: any }> {
    let doc = {};
    const zod = CreateAuthSchema.parse(req);
    let roles = await this.roleModel.findOne({ _id: req.role });

    if (!roles) {
      this.throwError(
        "Default role not found",
        Helper.StatusCode.InternalError,
      );
    }
    const hashedPassword = await bcrypt.hash(zod.password, 10);

    doc = await this.authModel.create({
      ...zod,
      password: hashedPassword,
      roles: roles._id,
    });

    return { user: doc };
  }

  async getUsers(req: any): Promise<{ user: any }> {
    let doc = {};
    const zod = GetAuthSchema.parse(req);
    const cacheKey = `auth:user:email:${zod.email}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return { user: JSON.parse(cached) };
    }
    doc = await this.authModel.aggregate([
      {
        $lookup: {
          from: `${config.communityName}_roles`,
          localField: "roles",
          foreignField: "_id",
          as: "rolesDetails",
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          roles: "$rolesDetails.name",
          isActive: 1,
        },
      },
    ]);
    if (doc) {
      await redis.setex(cacheKey, 60, JSON.stringify(doc));
    }

    return { user: doc };
  }
  async updateUsers(req: any): Promise<{ user: any }> {
    const updateOps = {};
    const zod = UpdateAuthSchema.parse(req);
    if (zod.email) Object.assign(updateOps, { email: zod.email });
    if (zod.name) Object.assign(updateOps, { name: zod.name });
    if (zod.password) {
      const hashedPassword = await bcrypt.hash(zod.password, 10);
      Object.assign(updateOps, { password: hashedPassword });
    }
    if (zod.roles) {
      Object.assign(updateOps, {
        roles: zod.roles,
      });
    }
    const doc = await this.authModel
      .findByIdAndUpdate(zod._id, updateOps, { new: true, runValidators: true })
      .select("-password");
    if (!doc) {
      this.throwError(
        "User not found Can't Update",
        Helper.StatusCode.InternalError,
      );
    }
    return { user: doc };
  }
  async deleteUsers(req: any): Promise<{ user: any }> {
    const user = await this.authModel.aggregate([
      {
        $lookup: {
          from: `${config.communityName}_roles`,
          localField: "roles",
          foreignField: "_id",
          as: "rolesDetails",
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          roles: "$rolesDetails.name",
          isActive: 1,
        },
      },
    ]);
    if (!user) {
      this.throwError(
        "User not found Can't Delete",
        Helper.StatusCode.InternalError,
      );
    }
    if (user.length === 0 || !user[0].roles("admin")) {
      this.throwError(
        "You are not authorized to delete user",
        Helper.StatusCode.InternalError,
      );
    }
    const doc = await this.authModel.findByIdAndDelete({ _id: req._id });
    return { user: doc };
  }

  async login(req: any): Promise<{ user: any; token: string }> {
    const zod = LoginSchema.parse(req);
    const { email, password } = zod;
    const user = await this.authModel.findOne({ email, isDeleted: false });
    if (!user) {
      this.throwError(
        "Invalid email or password",
        Helper.StatusCode.Unauthorized,
      );
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      this.throwError(
        "Invalid email or password",
        Helper.StatusCode.Unauthorized,
      );
    }
    const token = generateToken({
      id: user._id,
      email: user.email,
      roles: user.roles,
    });
    const userObj = user.toObject();
    delete userObj.password;
    return {
      user: userObj,
      token,
    };
  }

  async Logout(req: any): Promise<{ message: string }> {
    const user = await this.authModel.findByIdAndUpdate(
      req.user._id,
      { token: null },
      { new: true },
    );
    if (!user) {
      this.throwError("User not found Can't Logout", 500);
    }
    return { message: "Logged out successfully" };
  }
}
