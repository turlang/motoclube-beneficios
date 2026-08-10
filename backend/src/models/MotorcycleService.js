import mongoose from "mongoose";

const { Schema } = mongoose;

const motorcycleServiceSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: {
      type: String,
      enum: ["oleo", "pneus", "freios", "corrente", "revisao", "eletrica", "motor", "outro"],
      required: true,
      index: true
    },
    date: { type: Date, required: true, default: Date.now, index: true },
    odometerKm: { type: Number, min: 0, default: null },
    providerName: { type: String, trim: true, maxlength: 120, default: "" },
    partner: { type: Schema.Types.ObjectId, ref: "Partner", default: null },
    description: { type: String, required: true, trim: true, maxlength: 1200 },
    cost: { type: Number, min: 0, default: null },
    nextDate: { type: Date, default: null },
    nextKm: { type: Number, min: 0, default: null }
  },
  { timestamps: true, versionKey: false }
);

motorcycleServiceSchema.index({ user: 1, date: -1 });

export const MotorcycleService = mongoose.model("MotorcycleService", motorcycleServiceSchema);
