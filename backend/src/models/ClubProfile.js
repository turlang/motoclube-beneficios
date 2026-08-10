import mongoose from "mongoose";

const clubProfileSchema = new mongoose.Schema(
  {
    slug: { type: String, unique: true, index: true, default: "main" },
    nome: { type: String, trim: true, maxlength: 120, default: "Irmãos do Asfalto" },
    sigla: { type: String, trim: true, maxlength: 20, default: "MC" },
    foundedYear: { type: Number, min: 1900, max: 2100, default: 2026 },
    cidade: { type: String, trim: true, maxlength: 100, default: "São Paulo" },
    estado: { type: String, trim: true, maxlength: 60, default: "SP" },
    headline: { type: String, trim: true, maxlength: 180, default: "A estrada nos une. O escudo nos representa." },
    historia: { type: String, trim: true, maxlength: 6000, default: "" },
    manifesto: { type: String, trim: true, maxlength: 1200, default: "Honra, respeito, responsabilidade e irmandade." },
    heroImageUrl: { type: String, trim: true, maxlength: 1000, default: "" }
  },
  { timestamps: true }
);

export const ClubProfile = mongoose.model("ClubProfile", clubProfileSchema);
