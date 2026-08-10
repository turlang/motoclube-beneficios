import mongoose from "mongoose";

const postCategories = ["noticia", "rota", "manutencao", "comunidade"];

const clubPostSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true, maxlength: 180 },
    categoria: { type: String, enum: postCategories, default: "noticia" },
    resumo: { type: String, required: true, trim: true, maxlength: 600 },
    conteudo: { type: String, trim: true, maxlength: 6000, default: "" },
    imageUrl: { type: String, trim: true, maxlength: 1000, default: "" },
    publishedAt: { type: Date, default: Date.now },
    destaque: { type: Boolean, default: false },
    ativo: { type: Boolean, default: true }
  },
  { timestamps: true }
);

clubPostSchema.index({ ativo: 1, publishedAt: -1 });

export const ClubPost = mongoose.model("ClubPost", clubPostSchema);
