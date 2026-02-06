import mongoose, { Schema, Document } from "mongoose";

interface ISeller extends Document {
  userId: mongoose.Types.ObjectId;

  businessName?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;

  isApproved: boolean;
  isPaid: boolean;
  kycStatus: "pending" | "verified" | "rejected";

  subscriptionPlan?: "free" | "basic" | "premium";
  subscriptionExpiry?: Date;

  totalListings: number;
  activeListings: number;

  createdAt: Date;
  updatedAt: Date;
}
const sellerSchema = new Schema<ISeller>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    businessName: { type: String, trim: true },

    phone: { type: String, required: true },

    address: String,
    city: String,
    state: String,
    country: String,
    pincode: String,

    isApproved: { type: Boolean, default: false },
    isPaid: { type: Boolean, default: false },

    kycStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    subscriptionPlan: {
      type: String,
      enum: ["free", "basic", "premium"],
      default: "free",
    },

    subscriptionExpiry: Date,

    totalListings: { type: Number, default: 0 },
    activeListings: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default function (communityName = "seller") {
  const model = mongoose.model(`${communityName}_sellers`, sellerSchema);
  return model;
}
