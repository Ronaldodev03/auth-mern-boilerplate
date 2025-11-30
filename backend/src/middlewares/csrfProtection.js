/**
 * Middleware de protección CSRF mediante verificación de Referer
 *
 * Uso con sameSite='none' para agregar capa extra de seguridad
 */
export const csrfProtection = (req, res, next) => {
  // Solo verificar en peticiones mutantes (que cambian datos)
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  const origin = req.get("origin");
  const referer = req.get("referer");

  const allowedOrigins = [process.env.CORS_ORIGIN].filter(Boolean);

  if (origin) {
    if (!allowedOrigins.includes(origin)) {
      console.log(`❌ Origen bloqueado: ${origin}`);
      return res.status(403).json({
        status: "error",
        message: "Forbidden - Invalid origin",
      });
    }
  }

  // Verificar referer (como backup)
  if (!origin && referer) {
    const refererDomain = new URL(referer).origin;
    if (!allowedOrigins.includes(refererDomain)) {
      console.log(`❌ Referer bloqueado: ${refererDomain}`);
      return res.status(403).json({
        status: "error",
        message: "Forbidden - Invalid referer",
      });
    }
  }

  // Si no hay ni origin ni referer, bloquear (sospechoso)
  if (!origin && !referer) {
    console.log("❌ Petición sin origin ni referer bloqueada");
    return res.status(403).json({
      status: "error",
      message: "Forbidden - Missing origin/referer",
    });
  }

  next();
};
