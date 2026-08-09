import jwt from "jsonwebtoken";

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET não configurado.");
  }
  return process.env.JWT_SECRET;
}

export function signPartnerToken(partnerId) {
  return jwt.sign(
    { sub: partnerId, role: "partner" },
    getJwtSecret(),
    {
      expiresIn: process.env.PARTNER_JWT_EXPIRES_IN || "10h",
      issuer: "motoclube-beneficios-api",
      audience: "motoclube-beneficios-partner"
    }
  );
}

export function verifyPartnerToken(token) {
  return jwt.verify(token, getJwtSecret(), {
    issuer: "motoclube-beneficios-api",
    audience: "motoclube-beneficios-partner"
  });
}
