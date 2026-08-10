import mongoose from "mongoose";

const { Schema } = mongoose;

const requirementSchema = new Schema(
  {
    key: { type: String, required: true, trim: true, maxlength: 80 },
    label: { type: String, required: true, trim: true, maxlength: 180 },
    required: { type: Boolean, default: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    notes: { type: String, trim: true, maxlength: 500, default: "" }
  },
  { _id: false }
);

const promotionSchema = new Schema(
  {
    fromPatent: { type: String, required: true },
    toPatent: { type: String, required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    approvedAt: { type: Date, default: Date.now },
    notes: { type: String, trim: true, maxlength: 1000, default: "" }
  },
  { _id: true }
);

const memberJourneySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    padrinho: { type: Schema.Types.ObjectId, ref: "User", default: null },
    dataEntrada: { type: Date, default: Date.now },
    status: { type: String, enum: ["ativo", "pausado", "em_analise"], default: "em_analise", index: true },
    requisitos: { type: [requirementSchema], default: [] },
    historico: { type: [promotionSchema], default: [] },
    observacoes: { type: String, trim: true, maxlength: 3000, default: "" },
    ultimaRevisaoEm: { type: Date, default: null },
    ultimaRevisaoPor: { type: Schema.Types.ObjectId, ref: "User", default: null }
  },
  { timestamps: true, versionKey: false }
);

memberJourneySchema.index({ padrinho: 1, status: 1 });
memberJourneySchema.index({ dataEntrada: 1 });

export const MemberJourney = mongoose.model("MemberJourney", memberJourneySchema);
