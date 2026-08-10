import { z } from "zod";
import { User } from "../models/User.js";
import { ensureMemberJourney } from "../services/journeyService.js";
import { signAccessToken } from "../services/jwtService.js";
import { getAuthCookieOptions } from "../utils/cookieOptions.js";
import { isValidCpf, normalizeCpf } from "../utils/cpf.js";
import { publicUser } from "../utils/publicUser.js";

export const registerSchema = z.object({
  body: z.object({
    nome: z.string().trim().min(2).max(120),
    apelidoEstrada: z.string().trim().min(2).max(60),
    cpf: z.string().trim().min(11).max(14),
    email: z.string().trim().email().max(160),
    senha: z.string().min(8).max(128),
    moto: z.object({
      modelo: z.string().trim().min(2).max(100),
      placa: z.string().trim().min(7).max(10)
    })
  }),
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough()
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
    senha: z.string().min(1).max(128)
  }),
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough()
});

export async function register(req, res) {
  const { nome, apelidoEstrada, cpf, email, senha, moto } = req.validated.body;
  const normalizedCpf = normalizeCpf(cpf);

  if (!isValidCpf(normalizedCpf)) {
    return res.status(400).json({ message: "CPF inválido." });
  }

  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { cpf: normalizedCpf }]
  });

  if (existingUser) {
    return res.status(409).json({ message: "E-mail ou CPF já cadastrado." });
  }

  const user = await User.create({
    nome,
    apelidoEstrada,
    cpf: normalizedCpf,
    email: email.toLowerCase(),
    senha,
    moto: {
      modelo: moto.modelo,
      placa: moto.placa.toUpperCase()
    }
  });

  await ensureMemberJourney(user);

  const accessToken = signAccessToken(user._id.toString());
  const cookieName = process.env.COOKIE_NAME || "mc_access";
  res.cookie(cookieName, accessToken, getAuthCookieOptions());

  return res.status(201).json({
    message: "Cadastro realizado. Sua jornada começa como Candidato e segue para avaliação da Diretoria.",
    user: publicUser(user)
  });
}

export async function login(req, res) {
  const { email, senha } = req.validated.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select("+senha");

  if (!user) {
    return res.status(401).json({ message: "Credenciais inválidas." });
  }

  const passwordMatches = await user.comparePassword(senha);
  if (!passwordMatches) {
    return res.status(401).json({ message: "Credenciais inválidas." });
  }

  const accessToken = signAccessToken(user._id.toString());
  const cookieName = process.env.COOKIE_NAME || "mc_access";
  res.cookie(cookieName, accessToken, getAuthCookieOptions());

  return res.json({ message: "Login realizado.", user: publicUser(user) });
}

export async function logout(req, res) {
  const cookieName = process.env.COOKIE_NAME || "mc_access";
  const options = getAuthCookieOptions();

  res.clearCookie(cookieName, {
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite,
    path: options.path
  });

  return res.status(204).send();
}

export async function me(req, res) {
  return res.json({ user: publicUser(req.user) });
}
