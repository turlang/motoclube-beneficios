import mongoose from "mongoose";

const announcementReceiptSchema = new mongoose.Schema(
  {
    announcement: { type: mongoose.Schema.Types.ObjectId, ref: "ClubAnnouncement", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    readAt: { type: Date, default: null },
    acknowledgedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

announcementReceiptSchema.index({ announcement: 1, user: 1 }, { unique: true });

export const AnnouncementReceipt = mongoose.model("AnnouncementReceipt", announcementReceiptSchema);
