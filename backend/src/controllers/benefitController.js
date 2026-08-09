import { Benefit } from "../models/Benefit.js";

export async function listBenefits(req, res) {
  const filter = { ativo: true };

  if (req.query.categoria && req.query.categoria !== "todos") {
    filter.categoria = req.query.categoria;
  }

  if (req.query.destaque === "true") {
    filter.destaque = true;
  }

  const benefits = await Benefit.find(filter)
    .populate("parceiro", "nome categoria telefone endereco ativo")
    .sort({ destaque: -1, createdAt: -1 })
    .limit(100)
    .lean();

  return res.json({ benefits });
}
