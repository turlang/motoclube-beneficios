import { z } from "zod";
import { ClubDocument } from "../models/ClubDocument.js";
import { DocumentAcceptance } from "../models/DocumentAcceptance.js";
import { applicableDocumentsQuery, getDocumentCompliance } from "../services/documentService.js";

const PATENTS = ["Candidato", "Próspero", "Meio-Escudo", "Escudado", "Diretoria"];
const TYPES = ["regulamento", "estatuto", "termo", "politica", "codigo_conduta", "outro"];
const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "ID inválido");
const blank = z.object({}).passthrough();
const blankBody = z.object({}).passthrough().optional().default({});

const documentBase = z.object({
  titulo: z.string().trim().min(3).max(180),
  codigo: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen no código.").max(80),
  tipo: z.enum(TYPES),
  versao: z.string().trim().min(1).max(40),
  resumo: z.string().trim().max(700).optional().default(""),
  conteudo: z.string().trim().min(20).max(80000),
  obrigatorio: z.boolean(),
  patentes: z.array(z.enum(PATENTS)).max(PATENTS.length),
  publishedAt: z.coerce.date(),
  effectiveAt: z.coerce.date(),
  ativo: z.boolean()
});

export const documentIdSchema = z.object({
  body: blankBody,
  params: z.object({ id: objectIdSchema }),
  query: blank
});

export const createDocumentSchema = z.object({ body: documentBase, params: blank, query: blank });
export const updateDocumentSchema = z.object({
  body: documentBase.partial().refine((value) => Object.keys(value).length > 0, "Informe ao menos um campo."),
  params: z.object({ id: objectIdSchema }),
  query: blank
});

function serializeDocument(document, acceptance = null) {
  const accepted = Boolean(acceptance && acceptance.contentHash === document.contentHash);
  return {
    ...document,
    accepted,
    acceptedAt: accepted ? acceptance.acceptedAt : null
  };
}

export async function listMemberDocuments(req, res) {
  const compliance = await getDocumentCompliance(req.user);
  return res.json(compliance);
}

export async function getMemberDocument(req, res) {
  const document = await ClubDocument.findOne(applicableDocumentsQuery(req.user, { _id: req.validated.params.id })).lean();
  if (!document) return res.status(404).json({ message: "Documento não encontrado ou indisponível para seu perfil." });

  const acceptance = await DocumentAcceptance.findOne({ document: document._id, user: req.user._id }).lean();
  return res.json({ document: serializeDocument(document, acceptance) });
}

export async function acceptDocument(req, res) {
  const document = await ClubDocument.findOne(applicableDocumentsQuery(req.user, { _id: req.validated.params.id }));
  if (!document) return res.status(404).json({ message: "Documento não encontrado ou indisponível para aceite." });

  const acceptance = await DocumentAcceptance.findOneAndUpdate(
    { document: document._id, user: req.user._id },
    {
      $set: {
        documentVersion: document.versao,
        contentHash: document.contentHash,
        acceptedAt: new Date(),
        userAgent: String(req.get("user-agent") || "").slice(0, 500)
      }
    },
    { upsert: true, new: true, runValidators: true }
  );

  return res.json({
    message: "Aceite registrado para esta versão do documento.",
    acceptance: {
      id: acceptance._id.toString(),
      documentId: document._id.toString(),
      version: acceptance.documentVersion,
      acceptedAt: acceptance.acceptedAt,
      contentHash: acceptance.contentHash
    }
  });
}

export async function listAdminDocuments(req, res) {
  const documents = await ClubDocument.find({})
    .populate("createdBy", "nome apelidoEstrada")
    .sort({ codigo: 1, effectiveAt: -1, createdAt: -1 })
    .lean();

  const ids = documents.map((item) => item._id);
  const stats = ids.length
    ? await DocumentAcceptance.aggregate([
        { $match: { document: { $in: ids } } },
        { $group: { _id: "$document", acceptanceCount: { $sum: 1 }, lastAcceptedAt: { $max: "$acceptedAt" } } }
      ])
    : [];
  const statMap = new Map(stats.map((item) => [String(item._id), item]));

  return res.json({
    documents: documents.map((item) => ({
      ...item,
      acceptanceCount: statMap.get(String(item._id))?.acceptanceCount || 0,
      lastAcceptedAt: statMap.get(String(item._id))?.lastAcceptedAt || null
    }))
  });
}

export async function listDocumentAcceptances(req, res) {
  const document = await ClubDocument.findById(req.validated.params.id).lean();
  if (!document) return res.status(404).json({ message: "Documento não encontrado." });

  const acceptances = await DocumentAcceptance.find({ document: document._id })
    .populate("user", "nome apelidoEstrada email patente")
    .sort({ acceptedAt: -1 })
    .limit(500)
    .lean();

  return res.json({ document, acceptances });
}

export async function createDocument(req, res) {
  const payload = req.validated.body;
  if (payload.ativo) {
    await ClubDocument.updateMany({ codigo: payload.codigo, ativo: true }, { $set: { ativo: false } });
  }

  try {
    const document = await ClubDocument.create({ ...payload, createdBy: req.user._id });
    return res.status(201).json({ message: "Documento publicado.", document });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: "Já existe esta versão para o código informado." });
    throw error;
  }
}

export async function updateDocument(req, res) {
  const document = await ClubDocument.findById(req.validated.params.id);
  if (!document) return res.status(404).json({ message: "Documento não encontrado." });

  const payload = req.validated.body;
  const targetCode = payload.codigo || document.codigo;
  if (payload.ativo === true) {
    await ClubDocument.updateMany({ _id: { $ne: document._id }, codigo: targetCode, ativo: true }, { $set: { ativo: false } });
  }

  Object.assign(document, payload);
  try {
    await document.save();
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: "Já existe esta versão para o código informado." });
    throw error;
  }

  return res.json({ message: "Documento atualizado. Alterações no conteúdo exigem novo aceite devido ao hash da versão.", document });
}

export async function deleteDocument(req, res) {
  const document = await ClubDocument.findById(req.validated.params.id);
  if (!document) return res.status(404).json({ message: "Documento não encontrado." });

  const acceptanceCount = await DocumentAcceptance.countDocuments({ document: document._id });
  if (acceptanceCount > 0) {
    return res.status(409).json({ message: "Este documento possui aceites registrados. Desative-o para preservar o histórico de auditoria." });
  }

  await document.deleteOne();
  return res.status(204).end();
}
