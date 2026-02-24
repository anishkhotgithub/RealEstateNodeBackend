import mongoose, { Document, Schema } from "mongoose";

interface IAppointment extends Document {
  propertyId: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;

  date: Date;
  status: "scheduled" | "completed" | "cancelled";
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    buyerId: { type: Schema.Types.ObjectId, required: true },
    sellerId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    date: { type: Date, required: true },

    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
  },
  { timestamps: true },
);
export default function (communityName = "appointment") {
  const model = mongoose.model(
    `${communityName}_appointments`,
    AppointmentSchema,
  );
  return model;
}
