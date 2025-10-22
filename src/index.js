require("dotenv").config()

const express = require("express")
const cors = require("cors")
const morgan = require("morgan")

const { connectDB } = require("./db")
const authRoutes = require("./routes/auth")

const app = express()

const allowed = (process.env.CORS_ORIGIN || "*").split(",").map((s) => s.trim())

const corsOptions = {
  origin: (origin, cb) => {
    // Permitir requests sin origin (apps móviles nativas)
    if (!origin || allowed.includes("*") || allowed.includes(origin)) {
      return cb(null, true)
    }
    return cb(new Error("Not allowed by CORS"))
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(morgan("dev"))

app.get("/health", (_, res) =>
  res.json({
    ok: true,
    service: "opensound-backend",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
  }),
)

app.use("/auth", authRoutes)

app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" })
})

app.use((err, req, res, next) => {
  console.error("Error global:", err)
  res.status(500).json({ message: err.message || "Error interno del servidor" })
})

const PORT = process.env.PORT || 4000

connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Backend escuchando en http://0.0.0.0:${PORT}`)
    console.log(`📱 Listo para recibir conexiones de apps móviles`)
  })
})
