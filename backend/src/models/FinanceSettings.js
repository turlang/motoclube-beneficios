import mongoose from "mongoose";

const { Schema } = mongoose;

const financeSettingsSchema = new Schema(
  {
    key: { type: String, unique: true, default: "club-finance", index: true },
    enabled: { type: Boolean, default: false },
    monthlyFeeCents: { type: Number, min: 0, default: 0 },
    dueDay: { type: Number, min: 1, max: 28, default: 10 },
    currency: { type: String, enum: ["BRL"], default: "BRL" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null }
  },
  { timestamps: true, versionKey: false }
);

export const FinanceSettings = mongoose.model("FinanceSettings", financeSettingsSchema);
