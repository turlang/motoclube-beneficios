export function requireDiretoria(req, res, next) {
  if (!req.user || req.user.patente !== "Diretoria") {
    return res.status(403).json({
      message: "Acesso restrito à Diretoria."
    });
  }

  next();
}
