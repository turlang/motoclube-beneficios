import QRCode from "qrcode";
import { User } from "../models/User.js";
import { QrValidation } from "../models/QrValidation.js";
import {
  createDynamicQrToken,
  parseDynamicQrToken,
  verifyDynamicQrTokenForUser
} from "../services/qrService.js";

export async function getMyQr(req, res) {
  if (req.user.patente === "Candidato") {
    return res.status(403).json({
      message: "Candidato em avaliação. O QR é liberado após a entrada como Próspero e assinatura ativa."
    });
  }

  if (req.user.statusAssinatura !== "ativo") {
    return res.status(403).json({
      message: "Assinatura inativa. QR Code indisponível."
    });
  }

  const userWithSecret = await User.findById(req.user._id).select("+qrCodeToken");
  const { token, expiresAt } = createDynamicQrToken(userWithSecret);
  const qrPayload = JSON.stringify({ type: "motoclube-beneficio", token });

  const imageDataUrl = await QRCode.toDataURL(qrPayload, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320
  });

  return res.json({
    token,
    expiresAt,
    ttlSeconds: Math.max(0, expiresAt - Math.floor(Date.now() / 1000)),
    imageDataUrl
  });
}

export async function validatePartnerQr(req, res) {
  const { token } = req.validated.body;
  let parsed;

  try {
    parsed = parseDynamicQrToken(token);
  } catch {
    await QrValidation.create({
      parceiro: req.partner?._id || null,
      valido: false,
      motivo: "invalid_token"
    });

    return res.status(400).json({ valid: false, reason: "invalid_token" });
  }

  const user = await User.findById(parsed.payload.uid).select("+qrCodeToken");

  if (!user) {
    await QrValidation.create({
      parceiro: req.partner?._id || null,
      valido: false,
      motivo: "member_not_found"
    });

    return res.status(404).json({ valid: false, reason: "member_not_found" });
  }

  const verification = verifyDynamicQrTokenForUser(token, user);

  await QrValidation.create({
    parceiro: req.partner?._id || null,
    membro: user._id,
    valido: verification.valid,
    motivo: verification.valid ? "ok" : verification.reason,
    patenteNoMomento: user.patente
  });

  if (!verification.valid) {
    return res.status(403).json(verification);
  }

  return res.json({
    valid: true,
    expiresAt: verification.expiresAt,
    member: {
      id: user._id.toString(),
      nome: user.nome,
      apelidoEstrada: user.apelidoEstrada,
      patente: user.patente,
      statusAssinatura: user.statusAssinatura,
      moto: {
        modelo: user.moto.modelo,
        placa: user.moto.placa
      }
    },
    partner: req.partner
      ? {
          id: req.partner._id.toString(),
          nome: req.partner.nome
        }
      : null
  });
}
