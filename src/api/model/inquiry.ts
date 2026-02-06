import mongoose, { Schema, Document } from "mongoose";

interface IInquiry extends Document {
  propertyId: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;
  message?: string;
  status: "pending" | "contacted" | "closed";
}

const InquirySchema = new Schema<IInquiry>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    buyerId: { type: Schema.Types.ObjectId, required: true },
    message: String,

    status: {
      type: String,
      enum: ["pending", "contacted", "closed"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export default function (communityName = "inquiry") {
  const model = mongoose.model(`${communityName}_inquiries`, InquirySchema);
  return model;
}
