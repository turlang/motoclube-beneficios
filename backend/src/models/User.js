import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "node:crypto";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    apelidoEstrada: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60
    },
    cpf: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true
    },
    senha: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },
    moto: {
      modelo: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
      },
      placa: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        maxlength: 10
      }
    },
    patente: {
      type: String,
      enum: ["Candidato", "Próspero", "Meio-Escudo", "Escudado", "Diretoria"],
      default: "Candidato",
      index: true
    },
    statusAssinatura: {
      type: String,
      enum: ["ativo", "inativo"],
      default: "inativo",
      index: true
    },
    nucleo: {
      type: Schema.Types.ObjectId,
      ref: "ClubChapter",
      default: null,
      index: true
    },
    qrCodeToken: {
      type: String,
      required: true,
      unique: true,
      select: false,
      default: () => crypto.randomBytes(32).toString("hex")
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("senha")) return;

  const saltRounds = 12;
  this.senha = await bcrypt.hash(this.senha, saltRounds);
});

userSchema.methods.comparePassword = function comparePassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.senha);
};

export const User = mongoose.model("User", userSchema);
