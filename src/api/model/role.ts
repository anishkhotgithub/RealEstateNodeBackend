import mongoose, { Schema, Document } from "mongoose";

interface IAuth extends Document {
  name?: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
const authSchema = new Schema<IAuth>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export default function (communityName = "role") {
  const model = mongoose.model(`${communityName}_roles`, authSchema);
  return model;
}
