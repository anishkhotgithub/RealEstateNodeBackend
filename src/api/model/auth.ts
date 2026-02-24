import mongoose, { Document, Schema } from "mongoose";

interface IAuth extends Document {
  name: string;
  email: string;
  roles: mongoose.Types.ObjectId;
  password?: string;
  isActive: boolean;
  isDeleted: boolean;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const authSchema = new Schema<IAuth>(
  {
    name: { type: String },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    roles: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    password: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

authSchema.index({ email: 1 }, { unique: true });

export default function (communityName = "user") {
  const model = mongoose.model(`${communityName}_auth`, authSchema);
  return model;
}
