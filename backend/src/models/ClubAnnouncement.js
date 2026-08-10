import mongoose from "mongoose";

const patents = ["Candidato", "Próspero", "Meio-Escudo", "Escudado", "Diretoria"];

const clubAnnouncementSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true, maxlength: 180 },
    mensagem: { type: String, required: true, trim: true, maxlength: 5000 },
    tipo: { type: String, enum: ["aviso", "comunicado", "convocacao"], default: "comunicado" },
    prioridade: { type: String, enum: ["normal", "importante", "urgente"], default: "normal" },
    targetAll: { type: Boolean, default: true },
    patentes: [{ type: String, enum: patents }],
    chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: "ClubChapter" }],
    publishedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: null },
    requiresAck: { type: Boolean, default: false },
    ativo: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
  },
  { timestamps: true }
);

clubAnnouncementSchema.index({ ativo: 1, publishedAt: -1, expiresAt: 1 });
clubAnnouncementSchema.index({ targetAll: 1 });
clubAnnouncementSchema.index({ patentes: 1 });
clubAnnouncementSchema.index({ chapters: 1 });

export const ClubAnnouncement = mongoose.model("ClubAnnouncement", clubAnnouncementSchema);
