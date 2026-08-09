import crypto from "node:crypto";

function safeEqual(a, b) {
  const first = Buffer.from(String(a || ""));
  const second = Buffer.from(String(b || ""));

  if (first.length !== second.length) return false;

  return crypto.timingSafeEqual(first, second);
}

export function requireWebhookSecret(req, res, next) {
  const received = req.get("x-webhook-secret");
  const expected = process.env.PAYMENT_WEBHOOK_SECRET;

  if (!expected) {
    return res.status(500).json({
      message: "PAYMENT_WEBHOOK_SECRET não configurado."
    });
  }

  if (!safeEqual(received, expected)) {
    return res.status(401).json({ message: "Webhook não autorizado." });
  }

  next();
}
