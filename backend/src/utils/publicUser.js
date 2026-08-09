export function publicUser(user) {
  return {
    id: user._id.toString(),
    nome: user.nome,
    apelidoEstrada: user.apelidoEstrada,
    email: user.email,
    moto: user.moto,
    patente: user.patente,
    statusAssinatura: user.statusAssinatura,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}
