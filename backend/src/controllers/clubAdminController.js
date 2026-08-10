import { z } from "zod";
import { ClubProfile } from "../models/ClubProfile.js";
import { ClubOfficer } from "../models/ClubOfficer.js";
import { ClubEvent } from "../models/ClubEvent.js";
import { ClubPost } from "../models/ClubPost.js";
import { ClubChapter } from "../models/ClubChapter.js";
import { ClubMedia } from "../models/ClubMedia.js";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "ID inválido");
const patents = ["Próspero", "Meio-Escudo", "Escudado", "Diretoria"];
const eventTypes = ["encontro", "rota", "acao", "reuniao"];
const postCategories = ["noticia", "rota", "manutencao", "comunidade"];
const mediaCategories = ["estrada", "encontro", "acao", "irmandade", "oficina"];
const blankParams = z.object({}).passthrough();
const blankQuery = z.object({}).passthrough();
const idParams = z.object({ id: objectIdSchema });
const nonEmptyPatch = (schema) => schema.partial().refine((value) => Object.keys(value).length > 0, "Informe ao menos um campo.");

const profileBody = z.object({
  nome: z.string().trim().min(2).max(120),
  sigla: z.string().trim().min(1).max(20),
  foundedYear: z.coerce.number().int().min(1900).max(2100),
  cidade: z.string().trim().max(100),
  estado: z.string().trim().max(60),
  headline: z.string().trim().min(5).max(180),
  historia: z.string().trim().min(20).max(6000),
  manifesto: z.string().trim().min(10).max(1200),
  heroImageUrl: z.string().trim().max(1000).optional().default("")
});

const officerBody = z.object({
  nome: z.string().trim().min(2).max(120),
  apelidoEstrada: z.string().trim().max(80).optional().default(""),
  cargo: z.string().trim().min(2).max(100),
  patente: z.enum(patents).optional().default("Diretoria"),
  photoUrl: z.string().trim().max(1000).optional().default(""),
  bio: z.string().trim().max(800).optional().default(""),
  ordem: z.coerce.number().int().min(0).max(999).optional().default(0),
  ativo: z.boolean().optional().default(true)
});

const eventBody = z.object({
  titulo: z.string().trim().min(2).max(160),
  descricao: z.string().trim().min(5).max(1200),
  data: z.coerce.date(),
  cidade: z.string().trim().max(100).optional().default(""),
  local: z.string().trim().max(160).optional().default(""),
  tipo: z.enum(eventTypes).optional().default("encontro"),
  imageUrl: z.string().trim().max(1000).optional().default(""),
  destaque: z.boolean().optional().default(false),
  ativo: z.boolean().optional().default(true)
});

const postBody = z.object({
  titulo: z.string().trim().min(2).max(180),
  categoria: z.enum(postCategories).optional().default("noticia"),
  resumo: z.string().trim().min(5).max(600),
  conteudo: z.string().trim().max(6000).optional().default(""),
  imageUrl: z.string().trim().max(1000).optional().default(""),
  publishedAt: z.coerce.date().optional(),
  destaque: z.boolean().optional().default(false),
  ativo: z.boolean().optional().default(true)
});

const chapterBody = z.object({
  nome: z.string().trim().min(2).max(120),
  cidade: z.string().trim().min(2).max(100),
  estado: z.string().trim().length(2).transform((value) => value.toUpperCase()),
  regiao: z.string().trim().max(80).optional().default(""),
  responsavel: z.string().trim().max(120).optional().default(""),
  contato: z.string().trim().max(120).optional().default(""),
  descricao: z.string().trim().max(900).optional().default(""),
  destaque: z.boolean().optional().default(false),
  ordem: z.coerce.number().int().min(0).max(999).optional().default(0),
  ativo: z.boolean().optional().default(true)
});

const mediaBody = z.object({
  titulo: z.string().trim().min(2).max(160),
  legenda: z.string().trim().max(500).optional().default(""),
  imageUrl: z.string().trim().min(8).max(1000),
  categoria: z.enum(mediaCategories).optional().default("estrada"),
  local: z.string().trim().max(160).optional().default(""),
  data: z.coerce.date().optional(),
  destaque: z.boolean().optional().default(false),
  ordem: z.coerce.number().int().min(0).max(999).optional().default(0),
  ativo: z.boolean().optional().default(true)
});

export const updateClubProfileSchema = z.object({ body: profileBody, params: blankParams, query: blankQuery });
export const createOfficerSchema = z.object({ body: officerBody, params: blankParams, query: blankQuery });
export const updateOfficerSchema = z.object({ body: nonEmptyPatch(officerBody), params: idParams, query: blankQuery });
export const deleteOfficerSchema = z.object({ body: z.object({}).passthrough(), params: idParams, query: blankQuery });
export const createEventSchema = z.object({ body: eventBody, params: blankParams, query: blankQuery });
export const updateEventSchema = z.object({ body: nonEmptyPatch(eventBody), params: idParams, query: blankQuery });
export const deleteEventSchema = z.object({ body: z.object({}).passthrough(), params: idParams, query: blankQuery });
export const createPostSchema = z.object({ body: postBody, params: blankParams, query: blankQuery });
export const updatePostSchema = z.object({ body: nonEmptyPatch(postBody), params: idParams, query: blankQuery });
export const deletePostSchema = z.object({ body: z.object({}).passthrough(), params: idParams, query: blankQuery });
export const createChapterSchema = z.object({ body: chapterBody, params: blankParams, query: blankQuery });
export const updateChapterSchema = z.object({ body: nonEmptyPatch(chapterBody), params: idParams, query: blankQuery });
export const deleteChapterSchema = z.object({ body: z.object({}).passthrough(), params: idParams, query: blankQuery });
export const createMediaSchema = z.object({ body: mediaBody, params: blankParams, query: blankQuery });
export const updateMediaSchema = z.object({ body: nonEmptyPatch(mediaBody), params: idParams, query: blankQuery });
export const deleteMediaSchema = z.object({ body: z.object({}).passthrough(), params: idParams, query: blankQuery });

export async function getClubContent(req, res) {
  const [profile, officers, events, posts, chapters, media] = await Promise.all([
    ClubProfile.findOne({ slug: "main" }).lean(),
    ClubOfficer.find({}).sort({ ordem: 1, createdAt: 1 }).lean(),
    ClubEvent.find({}).sort({ data: 1 }).lean(),
    ClubPost.find({}).sort({ publishedAt: -1 }).lean(),
    ClubChapter.find({}).sort({ destaque: -1, ordem: 1, estado: 1, cidade: 1 }).lean(),
    ClubMedia.find({}).sort({ destaque: -1, ordem: 1, data: -1 }).lean()
  ]);

  return res.json({ profile, officers, events, posts, chapters, media });
}

export async function updateClubProfile(req, res) {
  const profile = await ClubProfile.findOneAndUpdate(
    { slug: "main" },
    { $set: req.validated.body, $setOnInsert: { slug: "main" } },
    { upsert: true, new: true, runValidators: true }
  );
  return res.json({ profile });
}

export async function createOfficer(req, res) {
  const officer = await ClubOfficer.create(req.validated.body);
  return res.status(201).json({ officer });
}

export async function updateOfficer(req, res) {
  const officer = await ClubOfficer.findByIdAndUpdate(req.validated.params.id, { $set: req.validated.body }, { new: true, runValidators: true });
  if (!officer) return res.status(404).json({ message: "Integrante do comando não encontrado." });
  return res.json({ officer });
}

export async function deleteOfficer(req, res) {
  const officer = await ClubOfficer.findByIdAndDelete(req.validated.params.id);
  if (!officer) return res.status(404).json({ message: "Integrante do comando não encontrado." });
  return res.status(204).end();
}

export async function createEvent(req, res) {
  const event = await ClubEvent.create(req.validated.body);
  return res.status(201).json({ event });
}

export async function updateEvent(req, res) {
  const event = await ClubEvent.findByIdAndUpdate(req.validated.params.id, { $set: req.validated.body }, { new: true, runValidators: true });
  if (!event) return res.status(404).json({ message: "Evento não encontrado." });
  return res.json({ event });
}

export async function deleteEvent(req, res) {
  const event = await ClubEvent.findByIdAndDelete(req.validated.params.id);
  if (!event) return res.status(404).json({ message: "Evento não encontrado." });
  return res.status(204).end();
}

export async function createPost(req, res) {
  const payload = { ...req.validated.body, publishedAt: req.validated.body.publishedAt || new Date() };
  const post = await ClubPost.create(payload);
  return res.status(201).json({ post });
}

export async function updatePost(req, res) {
  const post = await ClubPost.findByIdAndUpdate(req.validated.params.id, { $set: req.validated.body }, { new: true, runValidators: true });
  if (!post) return res.status(404).json({ message: "Publicação não encontrada." });
  return res.json({ post });
}

export async function deletePost(req, res) {
  const post = await ClubPost.findByIdAndDelete(req.validated.params.id);
  if (!post) return res.status(404).json({ message: "Publicação não encontrada." });
  return res.status(204).end();
}

export async function createChapter(req, res) {
  const chapter = await ClubChapter.create(req.validated.body);
  return res.status(201).json({ chapter });
}

export async function updateChapter(req, res) {
  const chapter = await ClubChapter.findByIdAndUpdate(req.validated.params.id, { $set: req.validated.body }, { new: true, runValidators: true });
  if (!chapter) return res.status(404).json({ message: "Núcleo não encontrado." });
  return res.json({ chapter });
}

export async function deleteChapter(req, res) {
  const chapter = await ClubChapter.findByIdAndDelete(req.validated.params.id);
  if (!chapter) return res.status(404).json({ message: "Núcleo não encontrado." });
  return res.status(204).end();
}

export async function createMedia(req, res) {
  const payload = { ...req.validated.body, data: req.validated.body.data || new Date() };
  const mediaItem = await ClubMedia.create(payload);
  return res.status(201).json({ media: mediaItem });
}

export async function updateMedia(req, res) {
  const mediaItem = await ClubMedia.findByIdAndUpdate(req.validated.params.id, { $set: req.validated.body }, { new: true, runValidators: true });
  if (!mediaItem) return res.status(404).json({ message: "Mídia não encontrada." });
  return res.json({ media: mediaItem });
}

export async function deleteMedia(req, res) {
  const mediaItem = await ClubMedia.findByIdAndDelete(req.validated.params.id);
  if (!mediaItem) return res.status(404).json({ message: "Mídia não encontrada." });
  return res.status(204).end();
}
