import { ClubProfile } from "../models/ClubProfile.js";
import { ClubOfficer } from "../models/ClubOfficer.js";
import { ClubEvent } from "../models/ClubEvent.js";
import { ClubPost } from "../models/ClubPost.js";

export async function getClubHome(req, res) {
  const now = new Date();
  const [profile, officers, events, posts] = await Promise.all([
    ClubProfile.findOne({ slug: "main" }).lean(),
    ClubOfficer.find({ ativo: true }).sort({ ordem: 1, createdAt: 1 }).limit(12).lean(),
    ClubEvent.find({ ativo: true, data: { $gte: now } }).sort({ destaque: -1, data: 1 }).limit(8).lean(),
    ClubPost.find({ ativo: true }).sort({ destaque: -1, publishedAt: -1 }).limit(8).lean()
  ]);

  return res.json({ profile, officers, events, posts });
}
