import mongoose from "mongoose";

const clubChapterSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true, maxlength: 120 },
    cidade: { type: String, required: true, trim: true, maxlength: 100 },
    estado: { type: String, required: true, trim: true, uppercase: true, minlength: 2, maxlength: 2 },
    regiao: { type: String, trim: true, maxlength: 80, default: "" },
    responsavel: { type: String, trim: true, maxlength: 120, default: "" },
    contato: { type: String, trim: true, maxlength: 120, default: "" },
    descricao: { type: String, trim: true, maxlength: 900, default: "" },
    destaque: { type: Boolean, default: false },
    ordem: { type: Number, default: 0, min: 0, max: 999 },
    ativo: { type: Boolean, default: true }
  },
  { timestamps: true }
);

clubChapterSchema.index({ ativo: 1, estado: 1, ordem: 1 });

export const ClubChapter = mongoose.model("ClubChapter", clubChapterSchema);
