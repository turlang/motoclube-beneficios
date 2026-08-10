import { z } from "zod";
import { User } from "../models/User.js";
import { Partner } from "../models/Partner.js";
import { MotorcycleProfile } from "../models/MotorcycleProfile.js";
import { MotorcycleService } from "../models/MotorcycleService.js";
import {
  REMINDER_LABELS,
  ensureMotorcycleProfile,
  serializeMotorcycleProfile
} from "../services/motorcycleHealthService.js";

const blank = z.object({}).passthrough();
const nullableDate = z.preprocess(
  (value) => value === "" || value === null ? null : value,
  z.union([z.coerce.date(), z.null()])
).optional();
const nullableNumber = z.preprocess(
  (value) => value === "" || value === null ? null : value,
  z.union([z.coerce.number().min(0), z.null()])
).optional();
const reminderKeys = Object.keys(REMINDER_LABELS);
const serviceCategories = ["oleo", "pneus", "freios", "corrente", "revisao", "eletrica", "motor", "outro"];

export const updateMotorcycleProfileSchema = z.object({
  body: z.object({
    apelidoMoto: z.string().trim().max(60).optional(),
    ano: z.preprocess(
      (value) => value === "" || value === null ? null : value,
      z.union([z.coerce.number().int().min(1900).max(2100), z.null()])
    ).optional(),
    cor: z.string().trim().max(50).optional(),
    odometroKm: z.coerce.number().min(0).optional(),
    observacoes: z.string().trim().max(1500).optional()
  }).refine((value) => Object.keys(value).length > 0, "Informe ao menos um campo."),
  params: blank,
  query: blank
});

export const updateReminderSchema = z.object({
  body: z.object({
    label: z.string().trim().min(2).max(80).optional(),
    nextDate: nullableDate,
    nextKm: nullableNumber,
    notes: z.string().trim().max(500).optional(),
    active: z.boolean().optional()
  }).refine((value) => Object.keys(value).length > 0, "Informe ao menos um campo."),
  params: z.object({ key: z.enum(reminderKeys) }),
  query: blank
});

export const createServiceSchema = z.object({
  body: z.object({
    category: z.enum(serviceCategories),
    date: z.coerce.date(),
    odometerKm: nullableNumber,
    providerName: z.string().trim().max(120).optional().default(""),
    partner: z.union([z.string().regex(/^[a-f\d]{24}$/i), z.null()]).optional().default(null),
    description: z.string().trim().min(3).max(1200),
    cost: nullableNumber,
    nextDate: nullableDate,
    nextKm: nullableNumber
  }),
  params: blank,
  query: blank
});

function serializeService(item) {
  return {
    id: item._id.toString(),
    category: item.category,
    date: item.date,
    odometerKm: item.odometerKm,
    providerName: item.providerName,
    partner: item.partner ? {
      id: item.partner._id?.toString?.() || String(item.partner),
      nome: item.partner.nome || "Parceiro"
    } : null,
    description: item.description,
    cost: item.cost,
    nextDate: item.nextDate,
    nextKm: item.nextKm
  };
}

async function loadUser(userId) {
  return User.findById(userId).select("nome apelidoEstrada email patente statusAssinatura moto nucleo createdAt");
}

export async function listMaintenancePartners(req, res) {
  const partners = await Partner.find({
    ativo: true,
    categoria: { $in: ["oficina", "pecas", "lavagem", "outros"] }
  })
    .select("nome categoria telefone endereco")
    .sort({ nome: 1 })
    .lean();

  return res.json({
    partners: partners.map((item) => ({
      id: item._id.toString(),
      nome: item.nome,
      categoria: item.categoria,
      telefone: item.telefone || "",
      endereco: item.endereco || null
    }))
  });
}

export async function getMyMotorcycle(req, res) {
  const user = await loadUser(req.user._id);
  if (!user) return res.status(404).json({ message: "Integrante não encontrado." });

  const profile = await ensureMotorcycleProfile(user);
  const services = await MotorcycleService.find({ user: user._id })
    .populate("partner", "nome")
    .sort({ date: -1, createdAt: -1 })
    .limit(30);

  return res.json({
    profile: serializeMotorcycleProfile(profile, user),
    services: services.map(serializeService)
  });
}

export async function updateMyMotorcycle(req, res) {
  const user = await loadUser(req.user._id);
  if (!user) return res.status(404).json({ message: "Integrante não encontrado." });

  const profile = await ensureMotorcycleProfile(user);
  const payload = { ...req.validated.body };
  if (Object.prototype.hasOwnProperty.call(payload, "odometroKm")) {
    profile.odometroAtualizadoEm = new Date();
  }
  Object.assign(profile, payload);
  await profile.save();

  return res.json({
    message: "Ficha da moto atualizada.",
    profile: serializeMotorcycleProfile(profile, user)
  });
}

export async function updateMyReminder(req, res) {
  const user = await loadUser(req.user._id);
  if (!user) return res.status(404).json({ message: "Integrante não encontrado." });

  const profile = await ensureMotorcycleProfile(user);
  const reminder = profile.reminders.find((item) => item.key === req.validated.params.key);
  if (!reminder) return res.status(404).json({ message: "Lembrete não encontrado." });

  Object.assign(reminder, req.validated.body);
  await profile.save();

  return res.json({
    message: "Lembrete atualizado.",
    profile: serializeMotorcycleProfile(profile, user)
  });
}

export async function createMyService(req, res) {
  const user = await loadUser(req.user._id);
  if (!user) return res.status(404).json({ message: "Integrante não encontrado." });

  const payload = { ...req.validated.body };
  if (payload.partner) {
    const partner = await Partner.findOne({ _id: payload.partner, ativo: true });
    if (!partner) return res.status(404).json({ message: "Parceiro credenciado não encontrado." });
  }

  const service = await MotorcycleService.create({ user: user._id, ...payload });
  const profile = await ensureMotorcycleProfile(user);

  if (Number.isFinite(payload.odometerKm) && payload.odometerKm >= profile.odometroKm) {
    profile.odometroKm = payload.odometerKm;
    profile.odometroAtualizadoEm = new Date();
  }

  const reminder = profile.reminders.find((item) => item.key === payload.category);
  if (reminder && (payload.nextDate || Number.isFinite(payload.nextKm))) {
    reminder.nextDate = payload.nextDate ?? reminder.nextDate;
    reminder.nextKm = Number.isFinite(payload.nextKm) ? payload.nextKm : reminder.nextKm;
    reminder.active = true;
  }
  await profile.save();

  await service.populate("partner", "nome");
  return res.status(201).json({
    message: "Serviço registrado no histórico da moto.",
    service: serializeService(service),
    profile: serializeMotorcycleProfile(profile, user)
  });
}

export async function getFleetOverview(req, res) {
  const profiles = await MotorcycleProfile.find({})
    .populate("user", "nome apelidoEstrada patente moto nucleo")
    .sort({ updatedAt: -1 })
    .limit(500);

  const entries = profiles
    .filter((profile) => profile.user)
    .map((profile) => ({
      member: {
        id: profile.user._id.toString(),
        nome: profile.user.nome,
        apelidoEstrada: profile.user.apelidoEstrada,
        patente: profile.user.patente,
        moto: profile.user.moto
      },
      ...serializeMotorcycleProfile(profile, profile.user)
    }));

  const overdue = entries.filter((entry) => entry.summary.overdue > 0);
  const attention = entries.filter((entry) => entry.summary.overdue === 0 && entry.summary.attention > 0);

  return res.json({
    overview: {
      motorcyclesTracked: entries.length,
      overdue: overdue.length,
      attention: attention.length,
      healthy: entries.filter((entry) => entry.summary.healthy).length
    },
    attentionList: [...overdue, ...attention].slice(0, 40)
  });
}
