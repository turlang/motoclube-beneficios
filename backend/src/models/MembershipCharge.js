import mongoose from "mongoose";

const { Schema } = mongoose;

const membershipChargeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    referenceMonth: { type: String, required: true, match: /^\d{4}-\d{2}$/, index: true },
    dueDate: { type: Date, required: true, index: true },
    amountCents: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["pending", "paid", "waived"], default: "pending", index: true },
    paidAt: { type: Date, default: null },
    paymentMethod: { type: String, enum: ["pix", "card", "cash", "transfer", "other", null], default: null },
    notes: { type: String, trim: true, maxlength: 1000, default: "" },
    externalEventId: { type: String, trim: true, maxlength: 120, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null }
  },
  { timestamps: true, versionKey: false }
);

membershipChargeSchema.index({ user: 1, referenceMonth: 1 }, { unique: true });

export const MembershipCharge = mongoose.model("MembershipCharge", membershipChargeSchema);
