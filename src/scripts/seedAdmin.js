require("dotenv").config()
const bcrypt = require("bcryptjs")
const { connectDB } = require("../db")
const User = require("../models/User")

async function seedAdmin() {
  try {
    await connectDB()
    console.log("Conectado a MongoDB")

    const adminEmail = "admin123@admin.com"
    const adminPassword = "admin123"

    // Verificar si el admin ya existe
    const existingAdmin = await User.findOne({ email: adminEmail })

    if (existingAdmin) {
      console.log("El usuario administrador ya existe")
      console.log(`Email: ${adminEmail}`)
      process.exit(0)
    }

    // Crear el usuario administrador
    const passwordHash = await bcrypt.hash(adminPassword, 10)
    const admin = await User.create({
      name: "Administrador",
      email: adminEmail,
      passwordHash,
      role: "admin",
    })

    console.log("Usuario administrador creado exitosamente")
    console.log(`Email: ${admin.email}`)
    console.log(`Password: ${adminPassword}`)
    console.log(`Role: ${admin.role}`)

    process.exit(0)
  } catch (error) {
    console.error("Error al crear el administrador:", error)
    process.exit(1)
  }
}

seedAdmin()
