import { z } from "zod";
import { User } from "../models/User.js";
import { FinanceSettings } from "../models/FinanceSettings.js";
import { MembershipCharge } from "../models/MembershipCharge.js";
import { FinanceTransaction } from "../models/FinanceTransaction.js";

const blank = z.object({}).passthrough();
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "ID inválido");
const referenceMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use o formato AAAA-MM.");
const paymentMethods = ["pix", "card", "cash", "transfer", "other"];

export const updateFinanceSettingsSchema = z.object({
  body: z.object({
    enabled: z.boolean().optional(),
    monthlyFeeCents: z.coerce.number().int().min(0).max(100000000).optional(),
    dueDay: z.coerce.number().int().min(1).max(28).optional()
  }).refine((value) => Object.keys(value).length > 0, "Informe ao menos um campo."),
  params: blank,
  query: blank
});

export const generateChargesSchema = z.object({
  body: z.object({
    referenceMonth,
    amountCents: z.coerce.number().int().min(0).max(100000000).optional(),
    dueDay: z.coerce.number().int().min(1).max(28).optional()
  }),
  params: blank,
  query: blank
});

export const updateChargeSchema = z.object({
  body: z.object({
    status: z.enum(["pending", "paid", "waived"]).optional(),
    paidAt: z.union([z.coerce.date(), z.null()]).optional(),
    paymentMethod: z.union([z.enum(paymentMethods), z.null()]).optional(),
    notes: z.string().trim().max(1000).optional()
  }).refine((value) => Object.keys(value).length > 0, "Informe ao menos um campo."),
  params: z.object({ id: objectId }),
  query: blank
});

export const createFinanceTransactionSchema = z.object({
  body: z.object({
    type: z.enum(["income", "expense"]),
    category: z.enum(["evento", "doacao", "sede", "material", "apoio", "administrativo", "outro"]),
    description: z.string().trim().min(3).max(500),
    amountCents: z.coerce.number().int().min(1).max(100000000),
    occurredAt: z.coerce.date(),
    paymentMethod: z.enum(paymentMethods).default("other"),
    member: z.union([objectId, z.null()]).optional().default(null),
    notes: z.string().trim().max(1000).optional().default("")
  }),
  params: blank,
  query: blank
});

async function getSettings() {
  return FinanceSettings.findOneAndUpdate(
    { key: "club-finance" },
    { $setOnInsert: { key: "club-finance", enabled: false, monthlyFeeCents: 0, dueDay: 10, currency: "BRL" } },
    { upsert: true, new: true, runValidators: true }
  );
}

function computedStatus(charge) {
  if (charge.status === "paid" || charge.status === "waived") return charge.status;
  return new Date(charge.dueDate).getTime() < Date.now() ? "overdue" : "pending";
}

function serializeCharge(charge) {
  return {
    id: charge._id.toString(),
    referenceMonth: charge.referenceMonth,
    dueDate: charge.dueDate,
    amountCents: charge.amountCents,
    status: computedStatus(charge),
    storedStatus: charge.status,
    paidAt: charge.paidAt,
    paymentMethod: charge.paymentMethod,
    notes: charge.notes || "",
    member: charge.user && charge.user._id ? {
      id: charge.user._id.toString(),
      nome: charge.user.nome,
      apelidoEstrada: charge.user.apelidoEstrada,
      patente: charge.user.patente
    } : null
  };
}

function serializeTransaction(item) {
  return {
    id: item._id.toString(),
    type: item.type,
    category: item.category,
    description: item.description,
    amountCents: item.amountCents,
    occurredAt: item.occurredAt,
    paymentMethod: item.paymentMethod,
    notes: item.notes || "",
    member: item.member && item.member._id ? {
      id: item.member._id.toString(),
      apelidoEstrada: item.member.apelidoEstrada,
      nome: item.member.nome
    } : null
  };
}

export async function getMyFinance(req, res) {
  const [settings, charges] = await Promise.all([
    getSettings(),
    MembershipCharge.find({ user: req.user._id }).sort({ dueDate: -1 }).limit(18)
  ]);

  const serialized = charges.map(serializeCharge);
  const open = serialized.filter((item) => item.status === "pending" || item.status === "overdue");
  const current = open.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0] || null;

  return res.json({
    settings: {
      enabled: settings.enabled,
      monthlyFeeCents: settings.monthlyFeeCents,
      dueDay: settings.dueDay,
      currency: settings.currency
    },
    summary: {
      outstandingCount: open.length,
      overdueCount: open.filter((item) => item.status === "overdue").length,
      outstandingCents: open.reduce((sum, item) => sum + item.amountCents, 0),
      nextCharge: current
    },
    charges: serialized
  });
}

export async function getFinanceOverview(req, res) {
  const [settings, charges, transactions] = await Promise.all([
    getSettings(),
    MembershipCharge.find({}).populate("user", "nome apelidoEstrada patente").sort({ dueDate: -1 }).limit(1000),
    FinanceTransaction.find({}).populate("member", "nome apelidoEstrada").sort({ occurredAt: -1, createdAt: -1 }).limit(300)
  ]);

  const serializedCharges = charges.map(serializeCharge);
  const paidRevenue = serializedCharges.filter((item) => item.status === "paid").reduce((sum, item) => sum + item.amountCents, 0);
  const manualIncome = transactions.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amountCents, 0);
  const expenses = transactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amountCents, 0);
  const open = serializedCharges.filter((item) => item.status === "pending" || item.status === "overdue");

  return res.json({
    settings: { enabled: settings.enabled, monthlyFeeCents: settings.monthlyFeeCents, dueDay: settings.dueDay, currency: settings.currency },
    overview: {
      membershipRevenueCents: paidRevenue,
      otherIncomeCents: manualIncome,
      expensesCents: expenses,
      balanceCents: paidRevenue + manualIncome - expenses,
      openCharges: open.length,
      overdueCharges: open.filter((item) => item.status === "overdue").length,
      outstandingCents: open.reduce((sum, item) => sum + item.amountCents, 0)
    },
    charges: serializedCharges.slice(0, 120),
    transactions: transactions.slice(0, 100).map(serializeTransaction)
  });
}

export async function updateFinanceSettings(req, res) {
  const settings = await getSettings();
  Object.assign(settings, req.validated.body, { updatedBy: req.user._id });
  await settings.save();
  return res.json({ message: "Configuração financeira atualizada.", settings });
}

export async function generateMonthlyCharges(req, res) {
  const settings = await getSettings();
  const { referenceMonth: ref } = req.validated.body;
  const amountCents = req.validated.body.amountCents ?? settings.monthlyFeeCents;
  const dueDay = req.validated.body.dueDay ?? settings.dueDay;

  if (!settings.enabled) return res.status(409).json({ message: "Ative o financeiro antes de gerar mensalidades." });
  if (!amountCents || amountCents < 1) return res.status(409).json({ message: "Configure um valor de mensalidade maior que zero." });

  const [year, month] = ref.split("-").map(Number);
  const dueDate = new Date(Date.UTC(year, month - 1, dueDay, 12, 0, 0));
  const users = await User.find({ patente: { $ne: "Candidato" } }).select("_id");

  if (!users.length) return res.json({ message: "Nenhum integrante elegível para cobrança.", created: 0 });

  const operations = users.map((user) => ({
    updateOne: {
      filter: { user: user._id, referenceMonth: ref },
      update: { $setOnInsert: { user: user._id, referenceMonth: ref, dueDate, amountCents, status: "pending", createdBy: req.user._id } },
      upsert: true
    }
  }));
  const result = await MembershipCharge.bulkWrite(operations, { ordered: false });

  return res.status(201).json({
    message: `Mensalidades de ${ref} processadas.`,
    created: result.upsertedCount || 0,
    eligibleMembers: users.length
  });
}

export async function updateMembershipCharge(req, res) {
  const charge = await MembershipCharge.findById(req.validated.params.id).populate("user", "nome apelidoEstrada patente");
  if (!charge) return res.status(404).json({ message: "Cobrança não encontrada." });

  const payload = { ...req.validated.body };
  if (payload.status === "paid") {
    payload.paidAt = payload.paidAt || new Date();
    if (!payload.paymentMethod) payload.paymentMethod = charge.paymentMethod || "other";
  }
  if (payload.status === "pending") payload.paidAt = null;
  Object.assign(charge, payload);
  await charge.save();

  if (charge.status === "paid") {
    await User.updateOne({ _id: charge.user._id }, { $set: { statusAssinatura: "ativo" } });
  }

  return res.json({ message: "Cobrança atualizada.", charge: serializeCharge(charge) });
}

export async function createFinanceTransaction(req, res) {
  const payload = { ...req.validated.body };
  if (payload.member) {
    const member = await User.findById(payload.member).select("_id");
    if (!member) return res.status(404).json({ message: "Integrante vinculado não encontrado." });
  }

  const transaction = await FinanceTransaction.create({ ...payload, createdBy: req.user._id });
  await transaction.populate("member", "nome apelidoEstrada");
  return res.status(201).json({ message: "Lançamento registrado no caixa institucional.", transaction: serializeTransaction(transaction) });
}
