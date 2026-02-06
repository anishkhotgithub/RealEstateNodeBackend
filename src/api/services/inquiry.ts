import { Service, Inject } from "typedi";
import { Logger } from "winston";
import { CreateInquirySchema, GetInquirySchema } from "../types/inquiry";
import Helper from "../../helper";
import mongoose from "mongoose";
import { redis } from "../../helper/redis";
import config from "../config/config";

@Service()
export default class SellerService {
  constructor(
    @Inject("throwError")
    private throwError: (message: string, statusCode: number) => never,
    @Inject("inquiryModel") private inquiryModel: mongoose.Model<any>,
    @Inject("roleModel") private roleModel: mongoose.Model<any>,
  ) {}

  async createInquiry(req: any): Promise<{ inquiry: any }> {
    let doc = {};
    const zod = CreateInquirySchema.parse(req);
    let roles = await this.roleModel.findOne({ _id: req.role });

    if (!roles) {
      this.throwError(
        "Default role not found",
        Helper.StatusCode.InternalError,
      );
    }
    if (!["admin", "buyer"].includes(roles.name)) {
      this.throwError("Unauthorized role", Helper.StatusCode.InternalError);
    }

    doc = await this.inquiryModel.create({
      ...zod,
    });

    return { inquiry: doc };
  }

  async getInquiries(req: any): Promise<{ inquiry: any }> {
    let doc = {};
    const zod = GetInquirySchema.parse(req);
    const cacheKey = `inquiry:propertyId:${zod.propertyId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return { inquiry: JSON.parse(cached) };
    }
    doc = await this.inquiryModel.aggregate([
      {
        $match: {
          propertyId: new mongoose.Types.ObjectId(zod.propertyId),
        },
      },
      {
        $lookup: {
          from: `${config.communityName}_auths`,
          localField: "buyerId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $lookup: {
          from: `${config.communityName}_properties`,
          localField: "propertyId",
          foreignField: "_id",
          as: "propertyDetails",
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          totalCount: [{ $count: "count" }],
          result: [{ $skip: zod.offset * zod.limit }, { $limit: zod.limit }],
        },
      },
      {
        $project: {
          totalCount: { $first: "$totalCount.count" },
          totalPages: {
            $ceil: { $divide: [{ $first: "$totalCount.count" }, zod.limit] },
          },
          result: 1,
        },
      },
    ]);
    if (doc) {
      await redis.setex(cacheKey, 60, JSON.stringify(doc));
    }

    return { inquiry: doc };
  }
}
