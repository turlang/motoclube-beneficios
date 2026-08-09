import mongoose from "mongoose";

const { Schema } = mongoose;

const paymentEventSchema = new Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    paymentMethod: {
      type: String,
      enum: ["pix", "card"],
      required: true
    },
    status: {
      type: String,
      enum: ["paid", "failed", "pending"],
      required: true
    },
    processedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const PaymentEvent = mongoose.model("PaymentEvent", paymentEventSchema);
