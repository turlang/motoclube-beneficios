import { z } from "zod";
import { ClubAnnouncement } from "../models/ClubAnnouncement.js";
import { AnnouncementReceipt } from "../models/AnnouncementReceipt.js";

const patents = ["Próspero", "Meio-Escudo", "Escudado", "Diretoria"];
const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "ID inválido");
const blank = z.object({}).passthrough();

const announcementBase = z.object({
  titulo: z.string().trim().min(3).max(180),
  mensagem: z.string().trim().min(3).max(5000),
  tipo: z.enum(["aviso", "comunicado", "convocacao"]),
  prioridade: z.enum(["normal", "importante", "urgente"]),
  targetAll: z.boolean(),
  patentes: z.array(z.enum(patents)).max(4),
  chapters: z.array(objectIdSchema).max(100),
  publishedAt: z.coerce.date(),
  expiresAt: z.union([z.coerce.date(), z.null()]),
  requiresAck: z.boolean(),
  ativo: z.boolean()
});

export const createAnnouncementSchema = z.object({
  body: announcementBase.refine(
    (value) => value.targetAll || value.patentes.length > 0 || value.chapters.length > 0,
    "Selecione ao menos um público para o comunicado."
  ),
  params: blank,
  query: blank
});

export const updateAnnouncementSchema = z.object({
  body: announcementBase.partial().refine((value) => Object.keys(value).length > 0, "Informe ao menos um campo."),
  params: z.object({ id: objectIdSchema }),
  query: blank
});

export const announcementIdSchema = z.object({
  body: blank,
  params: z.object({ id: objectIdSchema }),
  query: blank
});

function audienceFilter(user) {
  const targets = [{ targetAll: true }, { patentes: user.patente }];
  if (user.nucleo) targets.push({ chapters: user.nucleo._id || user.nucleo });
  return targets;
}

function visibleQuery(user, extra = {}) {
  const now = new Date();
  return {
    ...extra,
    ativo: true,
    publishedAt: { $lte: now },
    $and: [
      { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
      { $or: audienceFilter(user) }
    ]
  };
}

async function ensureVisibleAnnouncement(id, user) {
  return ClubAnnouncement.findOne(visibleQuery(user, { _id: id }));
}

function sortByPriority(items) {
  const rank = { urgente: 3, importante: 2, normal: 1 };
  return items.sort((a, b) => {
    const priority = (rank[b.prioridade] || 0) - (rank[a.prioridade] || 0);
    if (priority !== 0) return priority;
    return new Date(b.publishedAt) - new Date(a.publishedAt);
  });
}

export async function listMemberCommunications(req, res) {
  const announcements = await ClubAnnouncement.find(visibleQuery(req.user))
    .sort({ publishedAt: -1 })
    .limit(80)
    .lean();

  const ids = announcements.map((item) => item._id);
  const receipts = await AnnouncementReceipt.find({ announcement: { $in: ids }, user: req.user._id }).lean();
  const receiptByAnnouncement = new Map(receipts.map((item) => [String(item.announcement), item]));

  const items = sortByPriority(announcements).map((item) => {
    const receipt = receiptByAnnouncement.get(String(item._id));
    return {
      ...item,
      readAt: receipt?.readAt || null,
      acknowledgedAt: receipt?.acknowledgedAt || null
    };
  });

  return res.json({
    announcements: items,
    unreadCount: items.filter((item) => !item.readAt).length,
    pendingAckCount: items.filter((item) => item.requiresAck && !item.acknowledgedAt).length
  });
}

export async function markAnnouncementRead(req, res) {
  const announcement = await ensureVisibleAnnouncement(req.validated.params.id, req.user);
  if (!announcement) return res.status(404).json({ message: "Comunicado não encontrado." });

  const receipt = await AnnouncementReceipt.findOneAndUpdate(
    { announcement: announcement._id, user: req.user._id },
    { $set: { readAt: new Date() } },
    { upsert: true, new: true }
  );

  return res.json({ message: "Comunicado marcado como lido.", receipt });
}

export async function acknowledgeAnnouncement(req, res) {
  const announcement = await ensureVisibleAnnouncement(req.validated.params.id, req.user);
  if (!announcement) return res.status(404).json({ message: "Comunicado não encontrado." });

  const now = new Date();
  const receipt = await AnnouncementReceipt.findOneAndUpdate(
    { announcement: announcement._id, user: req.user._id },
    { $set: { readAt: now, acknowledgedAt: now } },
    { upsert: true, new: true }
  );

  return res.json({ message: "Ciência registrada.", receipt });
}

export async function listAdminCommunications(req, res) {
  const announcements = await ClubAnnouncement.find({})
    .populate("chapters", "nome cidade estado")
    .populate("createdBy", "nome apelidoEstrada")
    .sort({ publishedAt: -1 })
    .limit(120)
    .lean();

  const ids = announcements.map((item) => item._id);
  const stats = await AnnouncementReceipt.aggregate([
    { $match: { announcement: { $in: ids } } },
    {
      $group: {
        _id: "$announcement",
        readCount: { $sum: { $cond: [{ $ne: ["$readAt", null] }, 1, 0] } },
        ackCount: { $sum: { $cond: [{ $ne: ["$acknowledgedAt", null] }, 1, 0] } }
      }
    }
  ]);
  const statMap = new Map(stats.map((item) => [String(item._id), item]));

  return res.json({
    announcements: announcements.map((item) => ({
      ...item,
      readCount: statMap.get(String(item._id))?.readCount || 0,
      ackCount: statMap.get(String(item._id))?.ackCount || 0
    }))
  });
}

export async function createAnnouncement(req, res) {
  const announcement = await ClubAnnouncement.create({ ...req.validated.body, createdBy: req.user._id });
  return res.status(201).json({ message: "Comunicado publicado.", announcement });
}

export async function updateAnnouncement(req, res) {
  const announcement = await ClubAnnouncement.findById(req.validated.params.id);
  if (!announcement) return res.status(404).json({ message: "Comunicado não encontrado." });

  const merged = { ...announcement.toObject(), ...req.validated.body };
  if (!merged.targetAll && (!merged.patentes || merged.patentes.length === 0) && (!merged.chapters || merged.chapters.length === 0)) {
    return res.status(400).json({ message: "Selecione ao menos um público para o comunicado." });
  }

  Object.assign(announcement, req.validated.body);
  await announcement.save();
  return res.json({ message: "Comunicado atualizado.", announcement });
}

export async function deleteAnnouncement(req, res) {
  const announcement = await ClubAnnouncement.findByIdAndDelete(req.validated.params.id);
  if (!announcement) return res.status(404).json({ message: "Comunicado não encontrado." });
  await AnnouncementReceipt.deleteMany({ announcement: announcement._id });
  return res.status(204).end();
}
