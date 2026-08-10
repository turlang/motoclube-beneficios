import mongoose from "mongoose";

const { Schema } = mongoose;

const reminderSchema = new Schema(
  {
    key: {
      type: String,
      enum: ["oleo", "pneus", "freios", "corrente", "revisao", "licenciamento", "seguro"],
      required: true
    },
    label: { type: String, required: true, trim: true, maxlength: 80 },
    nextDate: { type: Date, default: null },
    nextKm: { type: Number, min: 0, default: null },
    notes: { type: String, trim: true, maxlength: 500, default: "" },
    active: { type: Boolean, default: false }
  },
  { _id: false }
);

const motorcycleProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    apelidoMoto: { type: String, trim: true, maxlength: 60, default: "" },
    ano: { type: Number, min: 1900, max: 2100, default: null },
    cor: { type: String, trim: true, maxlength: 50, default: "" },
    odometroKm: { type: Number, min: 0, default: 0 },
    odometroAtualizadoEm: { type: Date, default: null },
    observacoes: { type: String, trim: true, maxlength: 1500, default: "" },
    reminders: { type: [reminderSchema], default: [] }
  },
  { timestamps: true, versionKey: false }
);

export const MotorcycleProfile = mongoose.model("MotorcycleProfile", motorcycleProfileSchema);
