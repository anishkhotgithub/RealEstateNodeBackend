import { Service, Inject } from "typedi";
import { Logger } from "winston";
import { CreateSellerSchema, GetSellerSchema } from "../types/seller";
import Helper from "../../helper";
import mongoose from "mongoose";
import { redis } from "../../helper/redis";
import config from "../config/config";

@Service()
export default class SellerService {
  constructor(
    @Inject("throwError")
    private throwError: (message: string, statusCode: number) => never,
    @Inject("sellerModel") private sellerModel: mongoose.Model<any>,
    @Inject("roleModel") private roleModel: mongoose.Model<any>,
  ) {}

  async createSeller(req: any): Promise<{ seller: any }> {
    let doc = {};
    const zod = CreateSellerSchema.parse(req);
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

    doc = await this.sellerModel.create({
      ...zod,
    });

    return { seller: doc };
  }

  async getSellers(req: any): Promise<{ seller: any }> {
    let doc = {};
    const zod = GetSellerSchema.parse(req);
    const cacheKey = `seller:user:userId:${zod.userId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return { seller: JSON.parse(cached) };
    }
    doc = await this.sellerModel.aggregate([
      {
        $lookup: {
          from: `${config.communityName}_auths`,
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $project: {
          name: 1,
          userName: "$userDetails.name",
          isActive: 1,
          businessName: 1,
          city: 1,
          state: 1,
          country: 1,
          pincode: 1,
          isApproved: 1,
          isPaid: 1,
          kycStatus: 1,
          subscriptionPlan: 1,
          subscriptionExpiry: 1,
          totalListings: 1,
          activeListings: 1,
        },
      },
    ]);
    if (doc) {
      await redis.setex(cacheKey, 60, JSON.stringify(doc));
    }

    return { seller: doc };
  }
}
