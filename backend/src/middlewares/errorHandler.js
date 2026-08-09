export function notFoundHandler(req, res) {
  res.status(404).json({
    message: "Rota não encontrada."
  });
}

export function errorHandler(error, req, res, next) {
  console.error("[error]", error);

  if (error?.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || "campo";
    return res.status(409).json({
      message: `${field} já cadastrado.`
    });
  }

  const status = error.status || 500;

  res.status(status).json({
    message:
      status === 500
        ? "Erro interno do servidor."
        : error.message,
    ...(process.env.NODE_ENV !== "production" && {
      stack: error.stack
    })
  });
}
