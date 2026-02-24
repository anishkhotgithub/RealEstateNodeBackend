import { Service, Inject } from "typedi";
import { Logger } from "winston";
import mongoose from "mongoose";
import { redis } from "../../helper/redis";
import {
  CreateAppointmentSchema,
  GetAppointmentSchema,
} from "../types/appointment";
import config from "../config/config";

@Service()
export default class RoleService {
  constructor(
    @Inject("throwError")
    private throwError: (code?: number, message?: string) => never,
    @Inject("logger") private logger: Logger,
    @Inject("appointmentModel") private appointmentModel: mongoose.Model<any>,
    @Inject("roleModel") private roleModel: mongoose.Model<any>,
    @Inject("authModel") private authModel: mongoose.Model<any>,
  ) {}

  async createAppointment(req: any): Promise<{ appointment: any }> {
    let doc = {};
    const zod = CreateAppointmentSchema.parse(req);
    doc = await this.appointmentModel.create(zod);
    return { appointment: doc };
  }

  async getAppointments(req: any): Promise<{ appointments: any }> {
    const zod = GetAppointmentSchema.parse(req);

    const cacheKey = `appointments:property:${zod.propertyId}:user:${zod.buyerId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }
    console.log("Cache miss for appointments");
    const buyer = await this.authModel.aggregate([
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

    const matchStage: any =
      buyer.length > 0 && buyer[0]?.roles?.includes("admin")
        ? {}
        : { propertyId: zod.propertyId, buyerId: zod.buyerId };

    const appointments = await this.appointmentModel.aggregate([
      {
        $match: {
          ...matchStage,
        },
      },
      {
        $lookup: {
          from: `${config.communityName}_properties`,
          localField: "propertyId",
          foreignField: "_id",
          as: "property",
        },
      },
      { $unwind: { path: "$property", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: `${config.communityName}_auths`,
          localField: "buyerId",
          foreignField: "_id",
          as: "buyer",
        },
      },
      { $unwind: { path: "$buyer", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: `${config.communityName}_auths`,
          localField: "sellerId",
          foreignField: "_id",
          as: "seller",
        },
      },
      { $unwind: { path: "$seller", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: `${config.communityName}_roles`,
          localField: "buyer.roleId",
          foreignField: "_id",
          as: "buyerRole",
        },
      },
      { $unwind: { path: "$buyerRole", preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          date: 1,
          status: 1,
          createdAt: 1,

          property: {
            _id: "$property._id",
            title: "$property.title",
            city: "$property.city",
          },

          buyer: {
            _id: "$buyer._id",
            name: "$buyer.name",
            email: "$buyer.email",
            role: "$buyerRole.name",
          },

          seller: {
            _id: "$seller._id",
            name: "$seller.name",
            email: "$seller.email",
          },
        },
      },
    ]);
    if (appointments) {
      await redis.setex(cacheKey, 60, JSON.stringify(appointments));
    }

    return { appointments: appointments };
  }
}
