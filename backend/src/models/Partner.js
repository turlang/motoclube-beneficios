import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema } = mongoose;

const partnerSchema = new Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true
    },
    senha: {
      type: String,
      required: true,
      select: false,
      minlength: 8
    },
    categoria: {
      type: String,
      enum: ["oficina", "posto", "lavagem", "pecas", "alimentacao", "saude", "outros"],
      default: "outros",
      index: true
    },
    telefone: {
      type: String,
      trim: true,
      maxlength: 30,
      default: ""
    },
    endereco: {
      cidade: { type: String, trim: true, default: "" },
      bairro: { type: String, trim: true, default: "" },
      logradouro: { type: String, trim: true, default: "" }
    },
    ativo: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  { timestamps: true, versionKey: false }
);

partnerSchema.pre("save", async function hashPassword() {
  if (!this.isModified("senha")) return;
  this.senha = await bcrypt.hash(this.senha, 12);
});

partnerSchema.methods.comparePassword = function comparePassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.senha);
};

export const Partner = mongoose.model("Partner", partnerSchema);
