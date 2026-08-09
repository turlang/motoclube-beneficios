import { z } from "zod";
import { Partner } from "../models/Partner.js";
import { QrValidation } from "../models/QrValidation.js";
import { signPartnerToken } from "../services/partnerJwtService.js";
import { getAuthCookieOptions } from "../utils/cookieOptions.js";

export const partnerLoginSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
    senha: z.string().min(1).max(128)
  }),
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough()
});

export async function partnerLogin(req, res) {
  const { email, senha } = req.validated.body;

  const partner = await Partner.findOne({ email: email.toLowerCase() }).select("+senha");

  if (!partner || !partner.ativo) {
    return res.status(401).json({ message: "Credenciais inválidas." });
  }

  const matches = await partner.comparePassword(senha);

  if (!matches) {
    return res.status(401).json({ message: "Credenciais inválidas." });
  }

  const token = signPartnerToken(partner._id.toString());
  const options = getAuthCookieOptions();

  res.cookie("mc_partner_access", token, {
    ...options,
    maxAge: 10 * 60 * 60 * 1000
  });

  return res.json({
    partner: {
      id: partner._id.toString(),
      nome: partner.nome,
      email: partner.email,
      categoria: partner.categoria
    }
  });
}

export async function partnerLogout(req, res) {
  const options = getAuthCookieOptions();
  res.clearCookie("mc_partner_access", {
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite,
    path: options.path
  });
  return res.status(204).send();
}

export async function partnerMe(req, res) {
  return res.json({
    partner: {
      id: req.partner._id.toString(),
      nome: req.partner.nome,
      email: req.partner.email,
      categoria: req.partner.categoria
    }
  });
}

export async function partnerRecentValidations(req, res) {
  const validations = await QrValidation.find({ parceiro: req.partner._id })
    .populate("membro", "nome apelidoEstrada patente moto")
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return res.json({ validations });
}
