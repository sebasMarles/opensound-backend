const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

const signToken = (user) => {
  const payload = { sub: user._id.toString(), email: user.email, role: user.role || "user" };
  const secret = process.env.JWT_SECRET || "dev-secret";
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(payload, secret, { expiresIn });
};

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email y contraseña son obligatorios" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "El correo ya está registrado" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const doc = await User.create({ name, email, passwordHash });

    const token = signToken(doc);
    return res.status(201).json({
      token,
      user: {
        id: doc._id.toString(),
        email: doc.email,
        name: doc.name || doc.email.split("@")[0],
        role: doc.role || "user"
      }
    });
  } catch (err) {
    console.error("register error:", err);
    return res.status(500).json({ message: "Error al registrar usuario" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email y contraseña son obligatorios" });
    }

    const doc = await User.findOne({ email });
    if (!doc) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const ok = await bcrypt.compare(password, doc.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = signToken(doc);
    return res.json({
      token,
      user: {
        id: doc._id.toString(),
        email: doc.email,
        name: doc.name || doc.email.split("@")[0],
        role: doc.role || "user"
      }
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ message: "Error al iniciar sesión" });
  }
});

module.exports = router;
