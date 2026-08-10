import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase } from "../src/config/db.js";
import { User } from "../src/models/User.js";
import { ClubDocument } from "../src/models/ClubDocument.js";

async function main() {
  await connectDatabase();
  const creator = await User.findOne({ email: "diretoria@irmaosdoasfalto.local" }).select("_id");

  const existing = await ClubDocument.findOne({ codigo: "codigo-convivencia", versao: "modelo-1" });
  if (!existing) {
    await ClubDocument.create({
      titulo: "Código de Convivência — modelo inicial",
      codigo: "codigo-convivencia",
      tipo: "codigo_conduta",
      versao: "modelo-1",
      resumo: "Modelo inicial para demonstrar o módulo documental. A Diretoria deve revisar, substituir ou desativar este conteúdo antes de uso institucional definitivo.",
      conteudo: `MODELO INICIAL — REVISAR ANTES DO USO INSTITUCIONAL\n\n1. Respeito\nCada integrante deve tratar irmãos, parceiros e demais pessoas com respeito dentro e fora das atividades do clube.\n\n2. Responsabilidade\nO uso do nome, brasão e identidade do motoclube deve respeitar as orientações definidas pela Diretoria.\n\n3. Convivência\nParticipação em encontros, rotas e ações deve observar organização, pontualidade e conduta compatível com os valores do clube.\n\n4. Segurança\nCada motociclista continua responsável por sua condução, documentação, equipamento e cumprimento das regras de trânsito.\n\n5. Sede digital\nA sede digital registra eventos, comunicados, documentos, progressão e benefícios. Os registros internos devem ser utilizados de forma responsável.\n\nEste conteúdo é apenas um modelo operacional inicial e não substitui revisão jurídica, estatutária ou normativa pela Diretoria.`,
      obrigatorio: false,
      patentes: [],
      publishedAt: new Date(),
      effectiveAt: new Date(),
      ativo: true,
      createdBy: creator?._id || null
    });
  }

  console.log("- Documentos: modelo inicial de convivência disponível para revisão da Diretoria");
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(async () => { await mongoose.connection.close(); });
