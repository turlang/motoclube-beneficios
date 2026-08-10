export function publicUser(user) {
  const chapter = user.nucleo;
  const chapterId = chapter?._id || chapter;

  return {
    id: user._id.toString(),
    nome: user.nome,
    apelidoEstrada: user.apelidoEstrada,
    email: user.email,
    moto: user.moto,
    patente: user.patente,
    statusAssinatura: user.statusAssinatura,
    nucleo: chapterId
      ? {
          id: chapterId.toString(),
          nome: chapter?.nome || "",
          cidade: chapter?.cidade || "",
          estado: chapter?.estado || ""
        }
      : null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}
