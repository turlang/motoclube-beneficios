import { User } from "../models/User.js";
import { verifyAccessToken } from "../services/jwtService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const requireAuth = asyncHandler(async (req, res, next) => {
  const cookieName = process.env.COOKIE_NAME || "mc_access";
  const token = req.cookies?.[cookieName];

  if (!token) {
    return res.status(401).json({ message: "Não autenticado." });
  }

  let payload;

  try {
    payload = verifyAccessToken(token);
  } catch {
    return res.status(401).json({ message: "Sessão inválida ou expirada." });
  }

  const user = await User.findById(payload.sub);

  if (!user) {
    return res.status(401).json({ message: "Usuário não encontrado." });
  }

  req.user = user;
  next();
});
