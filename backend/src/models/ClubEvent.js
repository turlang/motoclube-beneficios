import mongoose from "mongoose";

const eventTypes = ["encontro", "rota", "acao", "reuniao"];

const clubEventSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true, maxlength: 160 },
    descricao: { type: String, required: true, trim: true, maxlength: 1200 },
    data: { type: Date, required: true },
    cidade: { type: String, trim: true, maxlength: 100, default: "" },
    local: { type: String, trim: true, maxlength: 160, default: "" },
    tipo: { type: String, enum: eventTypes, default: "encontro" },
    imageUrl: { type: String, trim: true, maxlength: 1000, default: "" },
    destaque: { type: Boolean, default: false },
    ativo: { type: Boolean, default: true }
  },
  { timestamps: true }
);

clubEventSchema.index({ ativo: 1, data: 1 });

export const ClubEvent = mongoose.model("ClubEvent", clubEventSchema);
