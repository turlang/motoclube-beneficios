import { z } from "zod";
import { ClubEvent } from "../models/ClubEvent.js";
import { EventRsvp } from "../models/EventRsvp.js";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "ID inválido");
const blankBody = z.object({}).passthrough();

export const eventIdSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: blankBody,
  query: z.object({}).passthrough()
});

export const rsvpSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({ status: z.enum(["confirmada", "cancelada"]) }),
  query: z.object({}).passthrough()
});

const operationBody = z.object({
  pontoEncontro: z.string().trim().max(220).optional(),
  briefing: z.string().trim().max(3000).optional(),
  rotaResumo: z.string().trim().max(1200).optional(),
  distanciaKm: z.coerce.number().min(0).max(5000).optional(),
  nivelRota: z.enum(["livre", "leve", "moderado", "experiente"]).optional(),
  capacidade: z.coerce.number().int().min(0).max(2000).optional(),
  confirmacaoAte: z.union([z.coerce.date(), z.null()]).optional(),
  status: z.enum(["agendado", "realizado", "cancelado"]).optional(),
  resumoPosEvento: z.string().trim().max(3000).optional(),
  albumUrl: z.string().trim().max(1000).optional()
}).refine((value) => Object.keys(value).length > 0, "Informe ao menos um campo.");

export const updateEventOperationSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: operationBody,
  query: z.object({}).passthrough()
});

function countMap(rows) {
  return new Map(rows.map((row) => [String(row._id), row.count]));
}

export async function listMemberEvents(req, res) {
  const oldest = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);
  const events = await ClubEvent.find({ ativo: true, data: { $gte: oldest } })
    .sort({ data: 1 })
    .limit(60)
    .lean();

  const eventIds = events.map((event) => event._id);
  const [counts, mine] = await Promise.all([
    EventRsvp.aggregate([
      { $match: { event: { $in: eventIds }, status: "confirmada" } },
      { $group: { _id: "$event", count: { $sum: 1 } } }
    ]),
    EventRsvp.find({ event: { $in: eventIds }, user: req.user._id }).lean()
  ]);

  const confirmedByEvent = countMap(counts);
  const mineByEvent = new Map(mine.map((item) => [String(item.event), item.status]));
  const now = Date.now();

  return res.json({
    events: events.map((event) => {
      const confirmedCount = confirmedByEvent.get(String(event._id)) || 0;
      const capacity = Number(event.capacidade || 0);
      const deadline = event.confirmacaoAte ? new Date(event.confirmacaoAte).getTime() : null;
      return {
        ...event,
        confirmedCount,
        myStatus: mineByEvent.get(String(event._id)) || null,
        availableSpots: capacity > 0 ? Math.max(0, capacity - confirmedCount) : null,
        confirmationOpen:
          event.status !== "realizado" &&
          event.status !== "cancelado" &&
          new Date(event.data).getTime() > now &&
          (!deadline || deadline >= now)
      };
    })
  });
}

export async function updateRsvp(req, res) {
  const event = await ClubEvent.findById(req.validated.params.id);
  if (!event || !event.ativo) return res.status(404).json({ message: "Evento não encontrado." });

  const status = req.validated.body.status;
  const now = new Date();

  if (status === "confirmada") {
    if (event.status === "cancelado") return res.status(409).json({ message: "Este evento foi cancelado." });
    if (event.status === "realizado" || event.data <= now) return res.status(409).json({ message: "Este evento já foi encerrado." });
    if (event.confirmacaoAte && event.confirmacaoAte < now) return res.status(409).json({ message: "O prazo de confirmação terminou." });

    const current = await EventRsvp.findOne({ event: event._id, user: req.user._id });
    if (event.capacidade > 0 && current?.status !== "confirmada") {
      const confirmed = await EventRsvp.countDocuments({ event: event._id, status: "confirmada" });
      if (confirmed >= event.capacidade) return res.status(409).json({ message: "As vagas deste evento foram preenchidas." });
    }
  }

  const rsvp = await EventRsvp.findOneAndUpdate(
    { event: event._id, user: req.user._id },
    { $set: { status } },
    { upsert: true, new: true, runValidators: true }
  );

  const confirmedCount = await EventRsvp.countDocuments({ event: event._id, status: "confirmada" });
  return res.json({ message: status === "confirmada" ? "Presença confirmada." : "Confirmação cancelada.", rsvp, confirmedCount });
}

export async function listAdminEventOperations(req, res) {
  const events = await ClubEvent.find({}).sort({ data: -1 }).limit(100).lean();
  const eventIds = events.map((event) => event._id);
  const counts = await EventRsvp.aggregate([
    { $match: { event: { $in: eventIds }, status: "confirmada" } },
    { $group: { _id: "$event", count: { $sum: 1 } } }
  ]);
  const confirmedByEvent = countMap(counts);

  return res.json({ events: events.map((event) => ({ ...event, confirmedCount: confirmedByEvent.get(String(event._id)) || 0 })) });
}

export async function updateEventOperation(req, res) {
  const event = await ClubEvent.findByIdAndUpdate(
    req.validated.params.id,
    { $set: req.validated.body },
    { new: true, runValidators: true }
  );
  if (!event) return res.status(404).json({ message: "Evento não encontrado." });
  return res.json({ message: "Operação do evento atualizada.", event });
}

export async function listEventParticipants(req, res) {
  const event = await ClubEvent.findById(req.validated.params.id).select("titulo data capacidade status").lean();
  if (!event) return res.status(404).json({ message: "Evento não encontrado." });

  const registrations = await EventRsvp.find({ event: event._id, status: "confirmada" })
    .sort({ updatedAt: 1 })
    .populate("user", "nome apelidoEstrada patente moto")
    .lean();

  const participants = registrations
    .filter((item) => item.user)
    .map((item) => ({
      id: item.user._id.toString(),
      nome: item.user.nome,
      apelidoEstrada: item.user.apelidoEstrada,
      patente: item.user.patente,
      moto: item.user.moto,
      confirmedAt: item.updatedAt
    }));

  return res.json({ event, participants, confirmedCount: participants.length });
}
