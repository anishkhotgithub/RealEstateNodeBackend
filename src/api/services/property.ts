import { Service, Inject } from "typedi";
import { CreatePropertySchema, GetPropertySchema } from "../types/property";
import Helper from "../../helper";
import mongoose from "mongoose";
import { redis } from "../../helper/redis";
import config from "../config/config";

@Service()
export default class SellerService {
  constructor(
    @Inject("throwError")
    private throwError: (message: string, statusCode: number) => never,
    @Inject("propertyModel") private propertyModel: mongoose.Model<any>,
    @Inject("roleModel") private roleModel: mongoose.Model<any>,
  ) {}

  async createProperty(req: any): Promise<{ property: any }> {
    let doc = {};
    const zod = CreatePropertySchema.parse(req);
    let roles = await this.roleModel.findOne({ _id: req.role });

    if (!roles) {
      this.throwError(
        "Default role not found",
        Helper.StatusCode.InternalError,
      );
    }
    if (!["admin", "seller"].includes(roles.name)) {
      this.throwError("Unauthorized role", Helper.StatusCode.InternalError);
    }

    doc = await this.propertyModel.create({
      ...zod,
    });

    return { property: doc };
  }

  async getProperties(req: any): Promise<{ property: any }> {
    let doc = {};
    const zod = GetPropertySchema.parse(req);
    const cacheKey = `property:sellerId:${zod.sellerId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return { property: JSON.parse(cached) };
    }
    doc = await this.propertyModel.aggregate([
      {
        $match: {
          price: { $gte: zod.minPrice, $lte: zod.maxPrice },
          location: zod.location ? zod.location : { $exists: true },
          type: zod.type ? zod.type : { $exists: true },
        },
      },
      {
        $lookup: {
          from: `${config.communityName}_auths`,
          localField: "sellerId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $project: {
          sellerName: "$userDetails.name",
          title: 1,
          description: 1,
          price: 1,
          location: 1,
          type: 1,
          status: 1,
          createdAt: 1,
        },
      },
    ]);
    if (doc) {
      await redis.setex(cacheKey, 60, JSON.stringify(doc));
    }

    return { property: doc };
  }
}
