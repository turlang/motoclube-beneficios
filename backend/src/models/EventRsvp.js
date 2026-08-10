import mongoose from "mongoose";

const eventRsvpSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "ClubEvent", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: { type: String, enum: ["confirmada", "cancelada"], default: "confirmada" }
  },
  { timestamps: true }
);

eventRsvpSchema.index({ event: 1, user: 1 }, { unique: true });
eventRsvpSchema.index({ event: 1, status: 1 });

export const EventRsvp = mongoose.model("EventRsvp", eventRsvpSchema);
