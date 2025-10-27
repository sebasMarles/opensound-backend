// Middleware para verificar que el usuario sea administrador
function requireAdmin(req, res, next) {
  // req.user viene del middleware verifyToken
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Acceso denegado: se requieren permisos de administrador",
    })
  }

  next()
}

module.exports = { requireAdmin }
