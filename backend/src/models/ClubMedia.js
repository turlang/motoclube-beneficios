import mongoose from "mongoose";

const clubMediaSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true, maxlength: 160 },
    legenda: { type: String, trim: true, maxlength: 500, default: "" },
    imageUrl: { type: String, required: true, trim: true, maxlength: 1000 },
    categoria: {
      type: String,
      enum: ["estrada", "encontro", "acao", "irmandade", "oficina"],
      default: "estrada"
    },
    local: { type: String, trim: true, maxlength: 160, default: "" },
    data: { type: Date, default: Date.now },
    destaque: { type: Boolean, default: false },
    ordem: { type: Number, default: 0, min: 0, max: 999 },
    ativo: { type: Boolean, default: true }
  },
  { timestamps: true }
);

clubMediaSchema.index({ ativo: 1, destaque: -1, ordem: 1, data: -1 });

export const ClubMedia = mongoose.model("ClubMedia", clubMediaSchema);
