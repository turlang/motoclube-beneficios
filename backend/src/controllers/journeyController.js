import { z } from "zod";
import { User } from "../models/User.js";
import { ClubEvent } from "../models/ClubEvent.js";
import { EventRsvp } from "../models/EventRsvp.js";
import { MemberJourney } from "../models/MemberJourney.js";
import { hasPendingRequiredDocuments } from "../services/documentService.js";
import {
  ensureMemberJourney,
  journeyProgress,
  nextPatentFor,
  requirementsFor
} from "../services/journeyService.js";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "ID inválido");
const blank = z.object({}).passthrough();

export const journeyMemberSchema = z.object({
  body: blank,
  params: z.object({ id: objectIdSchema }),
  query: blank
});

export const updateJourneySchema = z.object({
  body: z.object({
    padrinho: z.union([objectIdSchema, z.null()]).optional(),
    dataEntrada: z.coerce.date().optional(),
    status: z.enum(["ativo", "pausado", "em_analise"]).optional(),
    observacoes: z.string().trim().max(3000).optional()
  }).refine((value) => Object.keys(value).length > 0, "Informe ao menos um campo."),
  params: z.object({ id: objectIdSchema }),
  query: blank
});

export const updateRequirementSchema = z.object({
  body: z.object({
    completed: z.boolean(),
    notes: z.string().trim().max(500).optional().default("")
  }),
  params: z.object({ id: objectIdSchema, key: z.string().trim().min(1).max(80) }),
  query: blank
});

export const promoteMemberSchema = z.object({
  body: z.object({
    notes: z.string().trim().max(1000).optional().default(""),
    force: z.boolean().optional().default(false)
  }),
  params: z.object({ id: objectIdSchema }),
  query: blank
});

async function participationCount(userId) {
  const completedEventIds = await ClubEvent.find({ status: "realizado", ativo: true }).distinct("_id");
  if (!completedEventIds.length) return 0;
  return EventRsvp.countDocuments({
    user: userId,
    event: { $in: completedEventIds },
    status: "confirmada"
  });
}

async function syncAutomaticRequirements(journey, user) {
  const [participations, documentCompliance] = await Promise.all([
    participationCount(user._id),
    hasPendingRequiredDocuments(user)
  ]);

  const automatic = {
    padrinho: Boolean(journey.padrinho),
    documentos: !documentCompliance.pending,
    primeiro_encontro: participations >= 1,
    participacao: participations >= 3,
    presenca: participations >= 6
  };

  let changed = false;
  journey.requisitos.forEach((requirement) => {
    if (!Object.prototype.hasOwnProperty.call(automatic, requirement.key)) return;
    const shouldBeCompleted = automatic[requirement.key];
    if (requirement.completed === shouldBeCompleted) return;

    requirement.completed = shouldBeCompleted;
    requirement.completedAt = shouldBeCompleted ? new Date() : null;
    if (requirement.key === "documentos") {
      requirement.notes = shouldBeCompleted
        ? "Todos os documentos obrigatórios vigentes foram aceitos."
        : `${documentCompliance.count} documento(s) obrigatório(s) aguardando aceite.`;
    } else if (shouldBeCompleted && !requirement.notes) {
      requirement.notes = "Concluído automaticamente pelo histórico registrado na sede digital.";
    }
    changed = true;
  });

  if (changed) await journey.save();
  return { participations, documentCompliance };
}

async function populatedJourney(journey) {
  await journey.populate([
    { path: "padrinho", select: "nome apelidoEstrada patente" },
    { path: "ultimaRevisaoPor", select: "nome apelidoEstrada" },
    { path: "historico.approvedBy", select: "nome apelidoEstrada" }
  ]);
  return journey;
}

function serialize(journey, user, participations, documentCompliance) {
  const progress = journeyProgress(journey);
  const entryDate = new Date(journey.dataEntrada || user.createdAt || Date.now());
  const tenureDays = Math.max(0, Math.floor((Date.now() - entryDate.getTime()) / 86400000));

  return {
    id: journey._id.toString(),
    member: {
      id: user._id.toString(),
      nome: user.nome,
      apelidoEstrada: user.apelidoEstrada,
      patente: user.patente,
      statusAssinatura: user.statusAssinatura,
      nucleo: user.nucleo || null
    },
    padrinho: journey.padrinho
      ? {
          id: journey.padrinho._id.toString(),
          nome: journey.padrinho.nome,
          apelidoEstrada: journey.padrinho.apelidoEstrada,
          patente: journey.padrinho.patente
        }
      : null,
    dataEntrada: journey.dataEntrada,
    status: journey.status,
    requisitos: journey.requisitos,
    historico: journey.historico,
    observacoes: journey.observacoes,
    ultimaRevisaoEm: journey.ultimaRevisaoEm,
    ultimaRevisaoPor: journey.ultimaRevisaoPor,
    nextPatent: nextPatentFor(user.patente),
    progress,
    metrics: {
      tenureDays,
      participacoesRegistradas: participations,
      documentosObrigatoriosPendentes: documentCompliance.count
    }
  };
}

async function loadSnapshot(user) {
  const journey = await ensureMemberJourney(user);
  const { participations, documentCompliance } = await syncAutomaticRequirements(journey, user);
  await populatedJourney(journey);
  return serialize(journey, user, participations, documentCompliance);
}

export async function getMyJourney(req, res) {
  const user = await User.findById(req.user._id).populate("nucleo", "nome cidade estado");
  if (!user) return res.status(404).json({ message: "Membro não encontrado." });
  return res.json({ journey: await loadSnapshot(user) });
}

export async function getAdminJourney(req, res) {
  const user = await User.findById(req.validated.params.id).populate("nucleo", "nome cidade estado");
  if (!user) return res.status(404).json({ message: "Membro não encontrado." });
  return res.json({ journey: await loadSnapshot(user) });
}

export async function updateAdminJourney(req, res) {
  const user = await User.findById(req.validated.params.id).populate("nucleo", "nome cidade estado");
  if (!user) return res.status(404).json({ message: "Membro não encontrado." });

  const journey = await ensureMemberJourney(user);
  const payload = { ...req.validated.body };

  if (Object.prototype.hasOwnProperty.call(payload, "padrinho") && payload.padrinho) {
    if (payload.padrinho === user._id.toString()) return res.status(400).json({ message: "O membro não pode ser padrinho de si mesmo." });
    const sponsor = await User.findById(payload.padrinho);
    if (!sponsor || sponsor.patente === "Candidato") return res.status(404).json({ message: "Padrinho não encontrado ou ainda candidato." });
  }

  Object.assign(journey, payload, {
    ultimaRevisaoEm: new Date(),
    ultimaRevisaoPor: req.user._id
  });
  await journey.save();

  return res.json({ message: "Jornada atualizada.", journey: await loadSnapshot(user) });
}

export async function updateRequirement(req, res) {
  const user = await User.findById(req.validated.params.id).populate("nucleo", "nome cidade estado");
  if (!user) return res.status(404).json({ message: "Membro não encontrado." });

  const journey = await ensureMemberJourney(user);
  const requirement = journey.requisitos.find((item) => item.key === req.validated.params.key);
  if (!requirement) return res.status(404).json({ message: "Requisito não encontrado para a etapa atual." });
  if (requirement.key === "documentos") {
    return res.status(409).json({ message: "O requisito documental é controlado automaticamente pelos aceites das versões vigentes." });
  }

  requirement.completed = req.validated.body.completed;
  requirement.completedAt = requirement.completed ? new Date() : null;
  requirement.notes = req.validated.body.notes || "";
  journey.ultimaRevisaoEm = new Date();
  journey.ultimaRevisaoPor = req.user._id;
  await journey.save();

  return res.json({ message: "Requisito atualizado.", journey: await loadSnapshot(user) });
}

export async function promoteMember(req, res) {
  const user = await User.findById(req.validated.params.id).populate("nucleo", "nome cidade estado");
  if (!user) return res.status(404).json({ message: "Membro não encontrado." });

  const nextPatent = nextPatentFor(user.patente);
  if (!nextPatent) return res.status(409).json({ message: "Não existe próxima patente automática para este membro." });

  const journey = await ensureMemberJourney(user);
  const { participations, documentCompliance } = await syncAutomaticRequirements(journey, user);
  if (documentCompliance.pending) {
    return res.status(409).json({ message: `Existem ${documentCompliance.count} documento(s) obrigatório(s) aguardando aceite. A promoção não pode ser concluída.` });
  }

  const progress = journeyProgress(journey);
  if (!progress.ready && !req.validated.body.force) {
    return res.status(409).json({ message: "Ainda existem requisitos obrigatórios pendentes para esta promoção." });
  }
  if (user.patente === "Candidato" && !journey.padrinho && !req.validated.body.force) {
    return res.status(409).json({ message: "Defina um padrinho antes da entrada como Próspero." });
  }

  const previousPatent = user.patente;
  user.patente = nextPatent;
  await user.save();

  journey.historico.push({
    fromPatent: previousPatent,
    toPatent: nextPatent,
    approvedBy: req.user._id,
    approvedAt: new Date(),
    notes: req.validated.body.notes || (req.validated.body.force ? "Promoção excepcional aprovada pela Diretoria." : "Etapa concluída e aprovada pela Diretoria.")
  });
  journey.status = "ativo";
  journey.requisitos = requirementsFor(nextPatent);
  journey.ultimaRevisaoEm = new Date();
  journey.ultimaRevisaoPor = req.user._id;
  await journey.save();
  await populatedJourney(journey);

  return res.json({
    message: `${user.apelidoEstrada} avançou para ${nextPatent}.`,
    journey: serialize(journey, user, participations, documentCompliance)
  });
}

export async function resetJourneyRequirementsForPatent(userId, approvedBy = null, previousPatent = null, notes = "") {
  const user = await User.findById(userId);
  if (!user) return null;
  const journey = await ensureMemberJourney(user);

  if (previousPatent && previousPatent !== user.patente) {
    journey.historico.push({
      fromPatent: previousPatent,
      toPatent: user.patente,
      approvedBy,
      approvedAt: new Date(),
      notes: notes || "Patente ajustada manualmente pela Diretoria."
    });
  }

  journey.requisitos = requirementsFor(user.patente);
  journey.status = user.patente === "Candidato" ? "em_analise" : "ativo";
  journey.ultimaRevisaoEm = new Date();
  journey.ultimaRevisaoPor = approvedBy;
  await journey.save();
  return journey;
}
