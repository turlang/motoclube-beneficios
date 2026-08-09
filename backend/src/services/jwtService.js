import jwt from "jsonwebtoken";

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET não configurado.");
  }

  return process.env.JWT_SECRET;
}

export function signAccessToken(userId) {
  return jwt.sign(
    { sub: userId },
    getJwtSecret(),
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "8h",
      issuer: "motoclube-beneficios-api",
      audience: "motoclube-beneficios-web"
    }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, getJwtSecret(), {
    issuer: "motoclube-beneficios-api",
    audience: "motoclube-beneficios-web"
  });
}
