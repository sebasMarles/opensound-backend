const jwt = require("jsonwebtoken")

// Middleware para verificar JWT en rutas protegidas
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token no proporcionado" })
  }

  const token = authHeader.split(" ")[1]
  const secret = process.env.JWT_SECRET || "dev-secret"

  try {
    const decoded = jwt.verify(token, secret)
    req.user = decoded // { sub, email, role }
    next()
  } catch (err) {
    return res.status(401).json({ message: "Token inválido o expirado" })
  }
}

module.exports = { verifyToken }
