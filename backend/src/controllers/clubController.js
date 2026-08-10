import { ClubProfile } from "../models/ClubProfile.js";
import { ClubOfficer } from "../models/ClubOfficer.js";
import { ClubEvent } from "../models/ClubEvent.js";
import { ClubPost } from "../models/ClubPost.js";
import { ClubChapter } from "../models/ClubChapter.js";
import { ClubMedia } from "../models/ClubMedia.js";

export async function getClubHome(req, res) {
  const now = new Date();
  const [profile, officers, events, posts, chapters, media] = await Promise.all([
    ClubProfile.findOne({ slug: "main" }).lean(),
    ClubOfficer.find({ ativo: true }).sort({ ordem: 1, createdAt: 1 }).limit(12).lean(),
    ClubEvent.find({ ativo: true, data: { $gte: now } }).sort({ destaque: -1, data: 1 }).limit(8).lean(),
    ClubPost.find({ ativo: true }).sort({ destaque: -1, publishedAt: -1 }).limit(8).lean(),
    ClubChapter.find({ ativo: true }).sort({ destaque: -1, ordem: 1, estado: 1, cidade: 1 }).limit(40).lean(),
    ClubMedia.find({ ativo: true }).sort({ destaque: -1, ordem: 1, data: -1 }).limit(18).lean()
  ]);

  return res.json({ profile, officers, events, posts, chapters, media });
}
