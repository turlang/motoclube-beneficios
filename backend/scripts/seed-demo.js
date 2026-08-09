import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase } from "../src/config/db.js";
import { User } from "../src/models/User.js";
import { Partner } from "../src/models/Partner.js";
import { Benefit } from "../src/models/Benefit.js";

async function ensureDemoUser() {
  const password = process.env.DEMO_ADMIN_PASSWORD;
  if (!password || password.length < 8) {
    throw new Error("Defina DEMO_ADMIN_PASSWORD com pelo menos 8 caracteres.");
  }

  let user = await User.findOne({ email: "diretoria@irmaosdoasfalto.local" });

  if (!user) {
    user = new User({
      nome: "Diretoria Demo",
      apelidoEstrada: "Comandante",
      cpf: "52998224725",
      email: "diretoria@irmaosdoasfalto.local",
      senha: password,
      moto: { modelo: "Honda CG 160 Titan", placa: "ABC1D23" },
      patente: "Diretoria",
      statusAssinatura: "ativo"
    });
    await user.save();
  } else {
    user.patente = "Diretoria";
    user.statusAssinatura = "ativo";
    await user.save();
  }

  return user;
}

async function ensureDemoPartner() {
  const password = process.env.DEMO_PARTNER_PASSWORD;
  if (!password || password.length < 8) {
    throw new Error("Defina DEMO_PARTNER_PASSWORD com pelo menos 8 caracteres.");
  }

  let partner = await Partner.findOne({ email: "parceiro@irmaosdoasfalto.local" });

  if (!partner) {
    partner = new Partner({
      nome: "Borracharia do André",
      email: "parceiro@irmaosdoasfalto.local",
      senha: password,
      categoria: "oficina",
      telefone: "",
      endereco: {
        cidade: "São Paulo",
        bairro: "Centro",
        logradouro: ""
      },
      ativo: true
    });
    await partner.save();
  }

  await Benefit.findOneAndUpdate(
    { parceiro: partner._id, titulo: "Desconto em pneus e serviços" },
    {
      $set: {
        parceiro: partner._id,
        titulo: "Desconto em pneus e serviços",
        descricao: "Condição exclusiva para associados com Escudo Digital ativo.",
        descontoLabel: "15% OFF",
        categoria: "oficina",
        regras: ["Escudo ativo obrigatório", "Não cumulativo com outras promoções"],
        destaque: true,
        ativo: true
      }
    },
    { upsert: true, new: true, runValidators: true }
  );

  return partner;
}

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEMO_SEED !== "true") {
    throw new Error("Seed demo bloqueado em produção. Use ALLOW_DEMO_SEED=true somente de forma consciente.");
  }

  await connectDatabase();
  const user = await ensureDemoUser();
  const partner = await ensureDemoPartner();

  console.log("Seed concluído:");
  console.log(`- Diretoria: ${user.email}`);
  console.log(`- Parceiro: ${partner.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
