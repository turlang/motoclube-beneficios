import { MemberJourney } from "../models/MemberJourney.js";

export const MEMBER_PATENTS = ["Candidato", "Próspero", "Meio-Escudo", "Escudado", "Diretoria"];
export const PROGRESSION_PATENTS = ["Candidato", "Próspero", "Meio-Escudo", "Escudado"];

const DEFAULT_REQUIREMENTS = {
  Candidato: [
    { key: "padrinho", label: "Padrinho definido pela Diretoria", required: true },
    { key: "apresentacao", label: "Apresentação e orientação inicial concluídas", required: true },
    { key: "primeiro_encontro", label: "Primeira participação registrada no clube", required: true }
  ],
  "Próspero": [
    { key: "convivencia", label: "Período de convivência avaliado pela Diretoria", required: true },
    { key: "participacao", label: "Participação consistente em encontros e ações", required: true },
    { key: "valores", label: "Valores e responsabilidades do escudo reconhecidos", required: true }
  ],
  "Meio-Escudo": [
    { key: "presenca", label: "Presença ativa na vida do núcleo", required: true },
    { key: "apoio", label: "Participação em ação de apoio ou atividade do clube", required: true },
    { key: "avaliacao", label: "Avaliação final da Diretoria concluída", required: true }
  ],
  Escudado: []
};

export function nextPatentFor(patente) {
  const index = PROGRESSION_PATENTS.indexOf(patente);
  if (index < 0 || index === PROGRESSION_PATENTS.length - 1) return null;
  return PROGRESSION_PATENTS[index + 1];
}

export function requirementsFor(patente) {
  return (DEFAULT_REQUIREMENTS[patente] || []).map((item) => ({
    ...item,
    completed: false,
    completedAt: null,
    notes: ""
  }));
}

export async function ensureMemberJourney(user) {
  let journey = await MemberJourney.findOne({ user: user._id });
  if (journey) return journey;

  journey = await MemberJourney.create({
    user: user._id,
    dataEntrada: user.createdAt || new Date(),
    status: user.patente === "Candidato" ? "em_analise" : "ativo",
    requisitos: requirementsFor(user.patente)
  });

  return journey;
}

export function journeyProgress(journey) {
  const required = journey.requisitos.filter((item) => item.required !== false);
  const completed = required.filter((item) => item.completed).length;
  return {
    completed,
    total: required.length,
    percent: required.length ? Math.round((completed / required.length) * 100) : 100,
    ready: required.every((item) => item.completed)
  };
}
