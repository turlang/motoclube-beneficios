import mongoose from "mongoose";

const { Schema } = mongoose;

const benefitSchema = new Schema(
  {
    parceiro: {
      type: Schema.Types.ObjectId,
      ref: "Partner",
      required: true,
      index: true
    },
    titulo: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    descricao: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    descontoLabel: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40
    },
    categoria: {
      type: String,
      enum: ["oficina", "posto", "lavagem", "pecas", "alimentacao", "saude", "outros"],
      default: "outros",
      index: true
    },
    regras: {
      type: [String],
      default: []
    },
    destaque: {
      type: Boolean,
      default: false,
      index: true
    },
    ativo: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  { timestamps: true, versionKey: false }
);

export const Benefit = mongoose.model("Benefit", benefitSchema);
