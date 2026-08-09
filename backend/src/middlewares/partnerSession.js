import { Partner } from "../models/Partner.js";
import { verifyPartnerToken } from "../services/partnerJwtService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const requirePartnerSession = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.mc_partner_access;

  if (!token) {
    return res.status(401).json({ message: "Parceiro não autenticado." });
  }

  let payload;
  try {
    payload = verifyPartnerToken(token);
  } catch {
    return res.status(401).json({ message: "Sessão do parceiro inválida ou expirada." });
  }

  const partner = await Partner.findById(payload.sub);

  if (!partner || !partner.ativo) {
    return res.status(403).json({ message: "Parceiro inativo ou não encontrado." });
  }

  req.partner = partner;
  next();
});
