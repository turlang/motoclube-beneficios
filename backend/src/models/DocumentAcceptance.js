import mongoose from "mongoose";

const { Schema } = mongoose;

const documentAcceptanceSchema = new Schema(
  {
    document: { type: Schema.Types.ObjectId, ref: "ClubDocument", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    documentVersion: { type: String, required: true, trim: true, maxlength: 40 },
    contentHash: { type: String, required: true, trim: true, maxlength: 128 },
    acceptedAt: { type: Date, default: Date.now, required: true, index: true },
    userAgent: { type: String, trim: true, maxlength: 500, default: "" }
  },
  { timestamps: true, versionKey: false }
);

documentAcceptanceSchema.index({ document: 1, user: 1 }, { unique: true });
documentAcceptanceSchema.index({ user: 1, acceptedAt: -1 });

export const DocumentAcceptance = mongoose.model("DocumentAcceptance", documentAcceptanceSchema);
