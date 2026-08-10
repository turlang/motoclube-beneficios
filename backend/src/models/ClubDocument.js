import crypto from "node:crypto";
import mongoose from "mongoose";

const PATENTS = ["Candidato", "Próspero", "Meio-Escudo", "Escudado", "Diretoria"];
const { Schema } = mongoose;

const clubDocumentSchema = new Schema(
  {
    titulo: { type: String, required: true, trim: true, maxlength: 180 },
    codigo: { type: String, required: true, trim: true, lowercase: true, maxlength: 80 },
    tipo: {
      type: String,
      enum: ["regulamento", "estatuto", "termo", "politica", "codigo_conduta", "outro"],
      default: "regulamento"
    },
    versao: { type: String, required: true, trim: true, maxlength: 40 },
    resumo: { type: String, trim: true, maxlength: 700, default: "" },
    conteudo: { type: String, required: true, trim: true, maxlength: 80000 },
    contentHash: { type: String, required: true, index: true },
    obrigatorio: { type: Boolean, default: false, index: true },
    patentes: [{ type: String, enum: PATENTS }],
    publishedAt: { type: Date, default: Date.now, index: true },
    effectiveAt: { type: Date, default: Date.now, index: true },
    ativo: { type: Boolean, default: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null }
  },
  { timestamps: true, versionKey: false }
);

clubDocumentSchema.index({ codigo: 1, versao: 1 }, { unique: true });
clubDocumentSchema.index({ ativo: 1, obrigatorio: 1, effectiveAt: -1 });
clubDocumentSchema.index({ patentes: 1 });

clubDocumentSchema.pre("validate", function ensureContentHash() {
  if (!this.contentHash || this.isModified("conteudo") || this.isModified("versao")) {
    this.contentHash = crypto
      .createHash("sha256")
      .update(`${this.versao}\n${this.conteudo}`)
      .digest("hex");
  }
});

export const ClubDocument = mongoose.model("ClubDocument", clubDocumentSchema);
