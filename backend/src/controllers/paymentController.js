import { z } from "zod";
import mongoose from "mongoose";
import { PaymentEvent } from "../models/PaymentEvent.js";
import { MembershipCharge } from "../models/MembershipCharge.js";
import { User } from "../models/User.js";

export const paymentWebhookSchema = z.object({
  body: z.object({
    eventId: z.string().trim().min(3).max(120),
    userId: z.string().trim().min(24).max(24),
    paymentMethod: z.enum(["pix", "card"]),
    status: z.enum(["paid", "failed", "pending"]),
    referenceMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(),
    amountCents: z.coerce.number().int().min(0).optional()
  }),
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough()
});

export async function paymentWebhook(req, res) {
  const {
    eventId,
    userId,
    paymentMethod,
    status,
    referenceMonth,
    amountCents
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
        status,
        referenceMonth: referenceMonth || null,
        amountCents: amountCents ?? null
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

  let reconciledChargeId = null;

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

    const filter = referenceMonth
      ? { user: userId, referenceMonth, status: "pending" }
      : { user: userId, status: "pending" };

    const charge = await MembershipCharge.findOne(filter).sort({ dueDate: 1 });
    if (charge) {
      charge.status = "paid";
      charge.paidAt = new Date();
      charge.paymentMethod = paymentMethod;
      charge.externalEventId = eventId;
      if (amountCents !== undefined && amountCents !== charge.amountCents) {
        charge.notes = `${charge.notes ? `${charge.notes}\n` : ""}Webhook registrou ${amountCents} centavos; cobrança prevista em ${charge.amountCents} centavos.`;
      }
      await charge.save();
      reconciledChargeId = charge._id.toString();
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
    subscriptionActivated: status === "paid",
    reconciledChargeId
  });
}
