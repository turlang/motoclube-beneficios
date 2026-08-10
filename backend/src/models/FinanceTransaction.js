import mongoose from "mongoose";

const { Schema } = mongoose;

const financeTransactionSchema = new Schema(
  {
    type: { type: String, enum: ["income", "expense"], required: true, index: true },
    category: {
      type: String,
      enum: ["evento", "doacao", "sede", "material", "apoio", "administrativo", "outro"],
      default: "outro",
      index: true
    },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    amountCents: { type: Number, required: true, min: 1 },
    occurredAt: { type: Date, required: true, default: Date.now, index: true },
    paymentMethod: { type: String, enum: ["pix", "card", "cash", "transfer", "other"], default: "other" },
    member: { type: Schema.Types.ObjectId, ref: "User", default: null },
    notes: { type: String, trim: true, maxlength: 1000, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true, versionKey: false }
);

export const FinanceTransaction = mongoose.model("FinanceTransaction", financeTransactionSchema);
