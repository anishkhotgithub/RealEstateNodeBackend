import mongoose, { Schema, Document } from "mongoose";

interface IProperty extends Document {
  sellerId: mongoose.Types.ObjectId;

  title: string;
  description?: string;
  price: number;
  location: string;
  type: "apartment" | "villa" | "plot";

  status: "active" | "sold" | "inactive";

  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    location: { type: String, required: true },

    type: {
      type: String,
      enum: ["apartment", "villa", "plot"],
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "sold", "inactive"],
      default: "active",
    },
  },
  { timestamps: true },
);

export default function (communityName = "property") {
  const model = mongoose.model(`${communityName}_properties`, PropertySchema);
  return model;
}
