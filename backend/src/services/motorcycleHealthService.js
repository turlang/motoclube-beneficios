import { MotorcycleProfile } from "../models/MotorcycleProfile.js";

export const REMINDER_LABELS = {
  oleo: "Óleo",
  pneus: "Pneus",
  freios: "Freios",
  corrente: "Corrente / transmissão",
  revisao: "Revisão",
  licenciamento: "Licenciamento",
  seguro: "Seguro / proteção"
};

export function defaultReminders() {
  return Object.entries(REMINDER_LABELS).map(([key, label]) => ({
    key,
    label,
    nextDate: null,
    nextKm: null,
    notes: "",
    active: false
  }));
}

export async function ensureMotorcycleProfile(user) {
  let profile = await MotorcycleProfile.findOne({ user: user._id });
  if (profile) {
    const existing = new Set(profile.reminders.map((item) => item.key));
    let changed = false;
    for (const reminder of defaultReminders()) {
      if (!existing.has(reminder.key)) {
        profile.reminders.push(reminder);
        changed = true;
      }
    }
    if (changed) await profile.save();
    return profile;
  }

  return MotorcycleProfile.create({
    user: user._id,
    reminders: defaultReminders()
  });
}

export function reminderStatus(reminder, odometroKm = 0, now = new Date()) {
  if (!reminder.active) return { status: "inativo", reason: "Lembrete desativado" };

  const date = reminder.nextDate ? new Date(reminder.nextDate) : null;
  const km = Number.isFinite(reminder.nextKm) ? reminder.nextKm : null;
  if (!date && km === null) return { status: "configurar", reason: "Defina data ou quilometragem" };

  const dueByDate = date && date.getTime() <= now.getTime();
  const dueByKm = km !== null && odometroKm >= km;
  if (dueByDate || dueByKm) {
    return {
      status: "vencido",
      reason: dueByDate && dueByKm ? "Data e quilometragem atingidas" : dueByDate ? "Data atingida" : "Quilometragem atingida"
    };
  }

  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  const nearDate = date && date.getTime() - now.getTime() <= thirtyDays;
  const nearKm = km !== null && km - odometroKm <= 500;
  if (nearDate || nearKm) {
    return {
      status: "atencao",
      reason: nearDate && nearKm ? "Data e quilometragem próximas" : nearDate ? "Data próxima" : "Quilometragem próxima"
    };
  }

  return { status: "em_dia", reason: "Dentro do lembrete configurado" };
}

export function serializeMotorcycleProfile(profile, user) {
  const reminders = profile.reminders.map((item) => ({
    ...item.toObject(),
    ...reminderStatus(item, profile.odometroKm)
  }));

  const active = reminders.filter((item) => item.active);
  const overdue = active.filter((item) => item.status === "vencido").length;
  const attention = active.filter((item) => item.status === "atencao").length;

  return {
    id: profile._id.toString(),
    motorcycle: {
      modelo: user.moto?.modelo || "",
      placa: user.moto?.placa || "",
      apelidoMoto: profile.apelidoMoto,
      ano: profile.ano,
      cor: profile.cor
    },
    odometroKm: profile.odometroKm,
    odometroAtualizadoEm: profile.odometroAtualizadoEm,
    observacoes: profile.observacoes,
    reminders,
    summary: {
      active: active.length,
      overdue,
      attention,
      healthy: overdue === 0 && attention === 0
    }
  };
}
