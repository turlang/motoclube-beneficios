import { z } from "zod";
import mongoose from "mongoose";
import { PaymentEvent } from "../models/PaymentEvent.js";
import { User } from "../models/User.js";

export const paymentWebhookSchema = z.object({
  body: z.object({
    eventId: z.string().trim().min(3).max(120),
    userId: z.string().trim().min(24).max(24),
    paymentMethod: z.enum(["pix", "card"]),
    status: z.enum(["paid", "failed", "pending"])
  }),
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough()
});

export async function paymentWebhook(req, res) {
  const {
    eventId,
    userId,
    paymentMethod,
    status
  } = req.validated.body;

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({
      message: "userId inválido."
    });
  }

  const event = await PaymentEvent.findOneAndUpdate(
    { eventId },
    {
      $setOnInsert: {
        eventId,
        userId,
        paymentMethod,
        status
      }
    },
    {
      new: true,
      upsert: true,
      runValidators: true
    }
  );

  if (event.processedAt) {
    return res.status(200).json({
      received: true,
      idempotent: true
    });
  }

  if (status === "paid") {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { statusAssinatura: "ativo" } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        message: "Membro não encontrado."
      });
    }
  }

  await PaymentEvent.updateOne(
    { _id: event._id },
    {
      $set: {
        processedAt: new Date(),
        status
      }
    }
  );

  return res.status(200).json({
    received: true,
    idempotent: false,
    subscriptionActivated: status === "paid"
  });
}
