import { Service, Inject } from "typedi";
import { Logger } from "winston";
import mongoose from "mongoose";
import { redis } from "../../helper/redis";
import { CreateRoleSchema } from "../types/role";

@Service()
export default class RoleService {
  constructor(
    @Inject("throwError")
    private throwError: (code?: number, message?: string) => never,
    @Inject("logger") private logger: Logger,
    @Inject("roleModel") private roleModel: mongoose.Model<any>,
  ) {}

  async createRole(req: any): Promise<{ user: any }> {
    let doc = {};
    const zod = CreateRoleSchema.parse(req);
    doc = await this.roleModel.create(zod);
    return { user: doc };
  }

  async getRoles(req: any): Promise<{ user: any }> {
    let doc = {};

    const cacheKey = `role:user:email:${req.email}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    doc = await this.roleModel.find({});
    if (doc) {
      await redis.setex(cacheKey, 60, JSON.stringify(doc));
    }

    return { user: doc };
  }
}
