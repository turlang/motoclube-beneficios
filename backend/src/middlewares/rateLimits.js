import { rateLimit } from "express-rate-limit";

const commonOptions = {
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Muitas tentativas. Tente novamente mais tarde."
  }
};

export const loginLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000,
  limit: 10
});

export const registerLimiter = rateLimit({
  ...commonOptions,
  windowMs: 60 * 60 * 1000,
  limit: 5
});

export const qrValidationLimiter = rateLimit({
  ...commonOptions,
  windowMs: 60 * 1000,
  limit: 120
});
