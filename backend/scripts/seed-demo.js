import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase } from "../src/config/db.js";
import { User } from "../src/models/User.js";
import { Partner } from "../src/models/Partner.js";
import { Benefit } from "../src/models/Benefit.js";
import { ClubProfile } from "../src/models/ClubProfile.js";
import { ClubOfficer } from "../src/models/ClubOfficer.js";
import { ClubEvent } from "../src/models/ClubEvent.js";
import { ClubPost } from "../src/models/ClubPost.js";
import { ClubChapter } from "../src/models/ClubChapter.js";
import { ClubMedia } from "../src/models/ClubMedia.js";

const PHOTOS = {
  hero: "https://images.pexels.com/photos/9789339/pexels-photo-9789339.jpeg?auto=compress&cs=tinysrgb&w=2200",
  rain: "https://images.pexels.com/photos/5195487/pexels-photo-5195487.jpeg?auto=compress&cs=tinysrgb&w=1400",
  road: "https://images.pexels.com/photos/12202235/pexels-photo-12202235.jpeg?auto=compress&cs=tinysrgb&w=1400",
  urban: "https://images.pexels.com/photos/9789338/pexels-photo-9789338.jpeg?auto=compress&cs=tinysrgb&w=1400"
};

function daysFromNow(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function ensureDemoUser() {
  const password = process.env.DEMO_ADMIN_PASSWORD;
  if (!password || password.length < 8) throw new Error("Defina DEMO_ADMIN_PASSWORD com pelo menos 8 caracteres.");

  let user = await User.findOne({ email: "diretoria@irmaosdoasfalto.local" });
  if (!user) {
    user = new User({
      nome: "Diretoria Demo", apelidoEstrada: "Comandante", cpf: "52998224725",
      email: "diretoria@irmaosdoasfalto.local", senha: password,
      moto: { modelo: "Honda CG 160 Titan", placa: "ABC1D23" }, patente: "Diretoria", statusAssinatura: "ativo"
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
  if (!password || password.length < 8) throw new Error("Defina DEMO_PARTNER_PASSWORD com pelo menos 8 caracteres.");

  let partner = await Partner.findOne({ email: "parceiro@irmaosdoasfalto.local" });
  if (!partner) {
    partner = new Partner({
      nome: "Borracharia do André", email: "parceiro@irmaosdoasfalto.local", senha: password,
      categoria: "oficina", telefone: "", endereco: { cidade: "São Paulo", bairro: "Centro", logradouro: "" }, ativo: true
    });
    await partner.save();
  }

  await Benefit.findOneAndUpdate(
    { parceiro: partner._id, titulo: "Desconto em pneus e serviços" },
    { $set: { parceiro: partner._id, titulo: "Desconto em pneus e serviços", descricao: "Condição exclusiva para associados com Escudo Digital ativo.", descontoLabel: "15% OFF", categoria: "oficina", regras: ["Escudo ativo obrigatório", "Não cumulativo com outras promoções"], destaque: true, ativo: true } },
    { upsert: true, new: true, runValidators: true }
  );
  return partner;
}

async function ensureClubContent() {
  await ClubProfile.findOneAndUpdate(
    { slug: "main" },
    { $setOnInsert: {
      slug: "main", nome: "Irmãos do Asfalto", sigla: "MC", foundedYear: 2026, cidade: "São Paulo", estado: "SP",
      headline: "A estrada nos une. O escudo nos representa.",
      historia: "O Irmãos do Asfalto nasce para reunir motociclistas em torno de respeito, convivência, responsabilidade e apoio. Mais do que um clube de benefícios, a proposta é construir uma irmandade com presença real na estrada e uma sede digital capaz de organizar membros, parceiros, encontros e a memória do clube.",
      manifesto: "Honra para representar o escudo. Respeito por quem divide a estrada. Responsabilidade em cada decisão. Irmandade para que ninguém caminhe sozinho.",
      heroImageUrl: PHOTOS.hero
    } },
    { upsert: true, new: true, runValidators: true }
  );

  const officers = [
    { nome: "Comandante", apelidoEstrada: "Comandante", cargo: "Presidência", patente: "Diretoria", bio: "Representa a direção institucional e conduz as decisões estratégicas do clube.", ordem: 1 },
    { nome: "Estradeiro", apelidoEstrada: "Estradeiro", cargo: "Direção de Estrada", patente: "Diretoria", bio: "Coordena rotas, encontros e a organização das atividades sobre duas rodas.", ordem: 2 },
    { nome: "Guardião", apelidoEstrada: "Guardião", cargo: "Relações e Apoio", patente: "Diretoria", bio: "Acompanha parceiros, apoio ao associado e integração da irmandade.", ordem: 3 }
  ];
  for (const officer of officers) {
    await ClubOfficer.findOneAndUpdate({ cargo: officer.cargo }, { $setOnInsert: { ...officer, ativo: true } }, { upsert: true, new: true, runValidators: true });
  }

  const events = [
    { titulo: "Encontro da Irmandade", descricao: "Ponto de encontro para integração dos membros, apresentação de novos associados e alinhamento da agenda do clube.", data: daysFromNow(14), cidade: "São Paulo", local: "Ponto de encontro a definir", tipo: "encontro", imageUrl: PHOTOS.urban, destaque: true },
    { titulo: "Bate e volta da serra", descricao: "Rota organizada pela Diretoria com briefing prévio, pontos de parada e retorno em grupo.", data: daysFromNow(28), cidade: "São Paulo", local: "Saída a definir", tipo: "rota", imageUrl: PHOTOS.road, destaque: false },
    { titulo: "Ação de apoio", descricao: "Mobilização comunitária do clube com participação voluntária dos associados.", data: daysFromNow(45), cidade: "São Paulo", local: "Local a definir", tipo: "acao", imageUrl: PHOTOS.rain, destaque: false }
  ];
  for (const event of events) {
    await ClubEvent.findOneAndUpdate({ titulo: event.titulo }, { $setOnInsert: { ...event, ativo: true } }, { upsert: true, new: true, runValidators: true });
  }

  const posts = [
    { titulo: "Por que o escudo vem antes do benefício", categoria: "comunidade", resumo: "A sede digital organiza vantagens, mas a identidade do clube continua baseada em convivência, responsabilidade e respeito.", conteudo: "O benefício é uma consequência da organização do clube. O que sustenta a irmandade é a forma como os membros representam o escudo dentro e fora da estrada.", imageUrl: PHOTOS.hero, publishedAt: daysFromNow(-2), destaque: true },
    { titulo: "Checklist antes de sair para a rota", categoria: "manutencao", resumo: "Pneus, iluminação, freios e itens básicos que merecem atenção antes de qualquer deslocamento.", conteudo: "Uma rotina simples de verificação preventiva ajuda a reduzir imprevistos e reforça a responsabilidade de cada motociclista com sua própria segurança.", imageUrl: PHOTOS.rain, publishedAt: daysFromNow(-5), destaque: false },
    { titulo: "Estrada, encontro e memória", categoria: "rota", resumo: "Cada encontro ajuda a construir a história do motoclube e aproxima quem veste o mesmo escudo.", conteudo: "Registrar rotas, encontros e ações cria memória institucional e dá visibilidade à vida real da irmandade.", imageUrl: PHOTOS.road, publishedAt: daysFromNow(-8), destaque: false }
  ];
  for (const post of posts) {
    await ClubPost.findOneAndUpdate({ titulo: post.titulo }, { $setOnInsert: { ...post, ativo: true } }, { upsert: true, new: true, runValidators: true });
  }

  await ClubChapter.findOneAndUpdate(
    { nome: "Sede São Paulo" },
    { $setOnInsert: { nome: "Sede São Paulo", cidade: "São Paulo", estado: "SP", regiao: "Capital", responsavel: "Comandante", descricao: "Sede de referência institucional do Irmãos do Asfalto.", destaque: true, ordem: 1, ativo: true } },
    { upsert: true, new: true, runValidators: true }
  );

  const mediaItems = [
    { titulo: "Faça chuva ou faça sol", legenda: "A estrada muda. A irmandade permanece.", imageUrl: PHOTOS.rain, categoria: "estrada", local: "São Paulo", data: daysFromNow(-3), destaque: true, ordem: 1 },
    { titulo: "Estrada & irmandade", legenda: "Quilômetros compartilhados constroem memória.", imageUrl: PHOTOS.road, categoria: "irmandade", local: "São Paulo", data: daysFromNow(-6), destaque: false, ordem: 2 },
    { titulo: "Juntos na rota", legenda: "O clube acontece fora da tela.", imageUrl: PHOTOS.urban, categoria: "encontro", local: "São Paulo", data: daysFromNow(-9), destaque: false, ordem: 3 }
  ];
  for (const mediaItem of mediaItems) {
    await ClubMedia.findOneAndUpdate({ titulo: mediaItem.titulo }, { $setOnInsert: { ...mediaItem, ativo: true } }, { upsert: true, new: true, runValidators: true });
  }
}

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEMO_SEED !== "true") {
    throw new Error("Seed demo bloqueado em produção. Use ALLOW_DEMO_SEED=true somente de forma consciente.");
  }

  await connectDatabase();
  const user = await ensureDemoUser();
  const partner = await ensureDemoPartner();
  await ensureClubContent();

  console.log("Seed concluído:");
  console.log(`- Diretoria: ${user.email}`);
  console.log(`- Parceiro: ${partner.email}`);
  console.log("- Conteúdo institucional: perfil, comando, eventos, notícias, núcleo e galeria");
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(async () => { await mongoose.connection.close(); });
