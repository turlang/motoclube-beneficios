import { z } from "zod";
import { User } from "../models/User.js";
import { Partner } from "../models/Partner.js";
import { Benefit } from "../models/Benefit.js";
import { QrValidation } from "../models/QrValidation.js";
import { publicUser } from "../utils/publicUser.js";

const patents = ["Próspero", "Meio-Escudo", "Escudado", "Diretoria"];
const categories = ["oficina", "posto", "lavagem", "pecas", "alimentacao", "saude", "outros"];
const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "ID inválido");

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const changePatentSchema = z.object({
  body: z.object({ patente: z.enum(patents) }),
  params: z.object({ id: objectIdSchema }),
  query: z.object({}).passthrough()
});

export const changeStatusSchema = z.object({
  body: z.object({ statusAssinatura: z.enum(["ativo", "inativo"]) }),
  params: z.object({ id: objectIdSchema }),
  query: z.object({}).passthrough()
});

export const createPartnerSchema = z.object({
  body: z.object({
    nome: z.string().trim().min(2).max(120),
    email: z.string().trim().email(),
    senha: z.string().min(8).max(128),
    categoria: z.enum(categories),
    telefone: z.string().trim().max(30).optional().default(""),
    endereco: z.object({
      cidade: z.string().trim().max(100).optional().default(""),
      bairro: z.string().trim().max(100).optional().default(""),
      logradouro: z.string().trim().max(160).optional().default("")
    }).optional().default({})
  }),
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough()
});

export const createBenefitSchema = z.object({
  body: z.object({
    parceiro: objectIdSchema,
    titulo: z.string().trim().min(2).max(120),
    descricao: z.string().trim().min(2).max(500),
    descontoLabel: z.string().trim().min(1).max(40),
    categoria: z.enum(categories),
    regras: z.array(z.string().trim().max(160)).max(12).optional().default([]),
    destaque: z.boolean().optional().default(false)
  }),
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough()
});

export async function changeMemberPatent(req, res) {
  const { id } = req.validated.params;
  const { patente } = req.validated.body;

  const user = await User.findByIdAndUpdate(id, { $set: { patente } }, { new: true, runValidators: true });

  if (!user) return res.status(404).json({ message: "Membro não encontrado." });

  return res.json({ message: "Patente atualizada.", user: publicUser(user) });
}

export async function changeMemberStatus(req, res) {
  const { id } = req.validated.params;
  const { statusAssinatura } = req.validated.body;

  const user = await User.findByIdAndUpdate(
    id,
    { $set: { statusAssinatura } },
    { new: true, runValidators: true }
  );

  if (!user) return res.status(404).json({ message: "Membro não encontrado." });

  return res.json({ message: "Status atualizado.", user: publicUser(user) });
}

export async function listMembers(req, res) {
  const search = String(req.query.search || "").trim();
  const safeSearch = escapeRegex(search);
  const query = safeSearch
    ? {
        $or: [
          { nome: { $regex: safeSearch, $options: "i" } },
          { apelidoEstrada: { $regex: safeSearch, $options: "i" } },
          { email: { $regex: safeSearch, $options: "i" } }
        ]
      }
    : {};

  const members = await User.find(query).sort({ createdAt: -1 }).limit(100);
  return res.json({ members: members.map(publicUser) });
}


export async function listPartners(req, res) {
  const partners = await Partner.find({})
    .select("nome email categoria telefone endereco ativo createdAt")
    .sort({ nome: 1 })
    .limit(200)
    .lean();

  return res.json({ partners });
}

export async function adminOverview(req, res) {
  const [totalMembers, activeMembers, partners, benefits, validationsToday] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ statusAssinatura: "ativo" }),
    Partner.countDocuments({ ativo: true }),
    Benefit.countDocuments({ ativo: true }),
    QrValidation.countDocuments({
      valido: true,
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    })
  ]);

  return res.json({
    overview: { totalMembers, activeMembers, partners, benefits, validationsToday }
  });
}

export async function createPartner(req, res) {
  const partner = await Partner.create(req.validated.body);

  return res.status(201).json({
    partner: {
      id: partner._id.toString(),
      nome: partner.nome,
      email: partner.email,
      categoria: partner.categoria,
      ativo: partner.ativo
    }
  });
}

export async function createBenefit(req, res) {
  const partner = await Partner.findById(req.validated.body.parceiro);
  if (!partner) return res.status(404).json({ message: "Parceiro não encontrado." });

  const benefit = await Benefit.create(req.validated.body);
  await benefit.populate("parceiro", "nome categoria");

  return res.status(201).json({ benefit });
}
