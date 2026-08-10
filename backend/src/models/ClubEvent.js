import mongoose from "mongoose";

const eventTypes = ["encontro", "rota", "acao", "reuniao"];
const routeLevels = ["livre", "leve", "moderado", "experiente"];
const eventStatuses = ["agendado", "realizado", "cancelado"];

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
    ativo: { type: Boolean, default: true },
    pontoEncontro: { type: String, trim: true, maxlength: 220, default: "" },
    briefing: { type: String, trim: true, maxlength: 3000, default: "" },
    rotaResumo: { type: String, trim: true, maxlength: 1200, default: "" },
    distanciaKm: { type: Number, min: 0, max: 5000, default: 0 },
    nivelRota: { type: String, enum: routeLevels, default: "livre" },
    capacidade: { type: Number, min: 0, max: 2000, default: 0 },
    confirmacaoAte: { type: Date, default: null },
    status: { type: String, enum: eventStatuses, default: "agendado" },
    resumoPosEvento: { type: String, trim: true, maxlength: 3000, default: "" },
    albumUrl: { type: String, trim: true, maxlength: 1000, default: "" }
  },
  { timestamps: true }
);

clubEventSchema.index({ ativo: 1, status: 1, data: 1 });

export const ClubEvent = mongoose.model("ClubEvent", clubEventSchema);
