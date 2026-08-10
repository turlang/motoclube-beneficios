import mongoose from "mongoose";

const patents = ["Próspero", "Meio-Escudo", "Escudado", "Diretoria"];

const clubOfficerSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true, maxlength: 120 },
    apelidoEstrada: { type: String, trim: true, maxlength: 80, default: "" },
    cargo: { type: String, required: true, trim: true, maxlength: 100 },
    patente: { type: String, enum: patents, default: "Diretoria" },
    photoUrl: { type: String, trim: true, maxlength: 1000, default: "" },
    bio: { type: String, trim: true, maxlength: 800, default: "" },
    ordem: { type: Number, min: 0, max: 999, default: 0 },
    ativo: { type: Boolean, default: true }
  },
  { timestamps: true }
);

clubOfficerSchema.index({ ativo: 1, ordem: 1 });

export const ClubOfficer = mongoose.model("ClubOfficer", clubOfficerSchema);
