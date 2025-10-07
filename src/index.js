require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const { connectDB } = require("./db");
const authRoutes = require("./routes/auth");

const app = express();

// CORS (simple para dev; si pones CORS_ORIGIN, lo respeta)
const allowed = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map(s => s.trim());

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin || allowed.includes("*") || allowed.includes(origin)) {
      return cb(null, true);
    }
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_, res) => res.json({ ok: true, service: "opensound-backend" }));

app.use("/auth", authRoutes);

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Backend escuchando en http://localhost:${PORT}`);
  });
});
