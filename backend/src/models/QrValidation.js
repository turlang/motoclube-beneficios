import mongoose from "mongoose";

const { Schema } = mongoose;

const qrValidationSchema = new Schema(
  {
    parceiro: {
      type: Schema.Types.ObjectId,
      ref: "Partner",
      default: null,
      index: true
    },
    membro: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },
    valido: {
      type: Boolean,
      required: true,
      index: true
    },
    motivo: {
      type: String,
      trim: true,
      maxlength: 80,
      default: ""
    },
    patenteNoMomento: {
      type: String,
      trim: true,
      default: ""
    }
  },
  { timestamps: true, versionKey: false }
);

export const QrValidation = mongoose.model("QrValidation", qrValidationSchema);
