const express = require("express")
const User = require("../models/User")

const router = express.Router()

// GET /admin/users - Listar todos los usuarios
router.get("/users", async (req, res) => {
  try {
    const { search } = req.query

    let query = {}
    if (search) {
      query = {
        $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }],
      }
    }

    const users = await User.find(query).select("-passwordHash").sort({ createdAt: -1 })

    const formattedUsers = users.map((user) => ({
      id: user._id.toString(),
      name: user.name || user.email.split("@")[0],
      email: user.email,
      role: user.role || "user",
      createdAt: user.createdAt,
    }))

    return res.json({ users: formattedUsers })
  } catch (err) {
    console.error("Error al listar usuarios:", err)
    return res.status(500).json({ message: "Error al listar usuarios" })
  }
})

// PUT /admin/users/:id - Actualizar usuario
router.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, role } = req.body

    // Validar que el ID sea válido
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "ID de usuario inválido" })
    }

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" })
    }

    // Si se cambia el email, verificar que no esté duplicado
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email })
      if (emailExists) {
        return res.status(409).json({ message: "El email ya está en uso" })
      }
      user.email = email
    }

    // Actualizar campos permitidos
    if (name !== undefined) user.name = name
    if (role && ["user", "admin"].includes(role)) user.role = role

    await user.save()

    return res.json({
      message: "Usuario actualizado exitosamente",
      user: {
        id: user._id.toString(),
        name: user.name || user.email.split("@")[0],
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    })
  } catch (err) {
    console.error("Error al actualizar usuario:", err)
    return res.status(500).json({ message: "Error al actualizar usuario" })
  }
})

// DELETE /admin/users/:id - Eliminar usuario
router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params

    // Validar que el ID sea válido
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "ID de usuario inválido" })
    }

    // Verificar que el admin no se elimine a sí mismo
    if (id === req.user.sub) {
      return res.status(400).json({
        message: "No puedes eliminar tu propia cuenta de administrador",
      })
    }

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" })
    }

    await User.findByIdAndDelete(id)

    return res.json({
      message: "Usuario eliminado exitosamente",
      deletedUser: {
        id: user._id.toString(),
        email: user.email,
      },
    })
  } catch (err) {
    console.error("Error al eliminar usuario:", err)
    return res.status(500).json({ message: "Error al eliminar usuario" })
  }
})

// GET /admin/stats - Estadísticas del sistema
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalAdmins = await User.countDocuments({ role: "admin" })

    const recentUsers = await User.find().select("-passwordHash").sort({ createdAt: -1 }).limit(5)

    const formattedRecentUsers = recentUsers.map((user) => ({
      id: user._id.toString(),
      name: user.name || user.email.split("@")[0],
      email: user.email,
      role: user.role || "user",
      createdAt: user.createdAt,
    }))

    return res.json({
      totalUsers,
      totalAdmins,
      recentUsers: formattedRecentUsers,
    })
  } catch (err) {
    console.error("Error al obtener estadísticas:", err)
    return res.status(500).json({ message: "Error al obtener estadísticas" })
  }
})

module.exports = router
