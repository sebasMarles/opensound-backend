const express = require("express")
const Playlist = require("../models/Playlist")

const router = express.Router()

// GET /playlists - Listar todas las playlists del usuario
router.get("/", async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.user.sub })
      .sort({ isLiked: -1, createdAt: -1 }) // "Me Gusta" primero, luego por fecha
      .select("name description isLiked songs createdAt")

    return res.json({ playlists })
  } catch (err) {
    console.error("Error al listar playlists:", err)
    return res.status(500).json({ message: "Error al obtener playlists" })
  }
})

// POST /playlists - Crear nueva playlist
router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body || {}

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "El nombre es obligatorio" })
    }

    const playlist = await Playlist.create({
      userId: req.user.sub,
      name: name.trim(),
      description: description || "",
      isLiked: false, // Solo la playlist automática puede ser isLiked: true
      songs: [],
    })

    return res.status(201).json({ playlist })
  } catch (err) {
    console.error("Error al crear playlist:", err)
    return res.status(500).json({ message: "Error al crear playlist" })
  }
})

// GET /playlists/liked/songs - Obtener canciones de "Me Gusta"
router.get("/liked/songs", async (req, res) => {
  try {
    const likedPlaylist = await Playlist.findOne({
      userId: req.user.sub,
      isLiked: true,
    })

    if (!likedPlaylist) {
      return res.status(404).json({ message: "Playlist Me Gusta no encontrada" })
    }

    return res.json({ songs: likedPlaylist.songs })
  } catch (err) {
    console.error("Error al obtener canciones de Me Gusta:", err)
    return res.status(500).json({ message: "Error al obtener canciones" })
  }
})

// POST /playlists/liked/toggle - Toggle canción en "Me Gusta"
router.post("/liked/toggle", async (req, res) => {
  try {
    const { jamendoId, name, artist_name, image, album_image, audio } = req.body || {}

    if (!jamendoId || !name || !artist_name) {
      return res.status(400).json({ message: "Datos de canción incompletos" })
    }

    const likedPlaylist = await Playlist.findOne({
      userId: req.user.sub,
      isLiked: true,
    })

    if (!likedPlaylist) {
      return res.status(404).json({ message: "Playlist Me Gusta no encontrada" })
    }

    // Verificar si la canción ya existe
    const existingIndex = likedPlaylist.songs.findIndex((s) => s.jamendoId === jamendoId)

    let liked = false

    if (existingIndex !== -1) {
      // Eliminar canción
      likedPlaylist.songs.splice(existingIndex, 1)
      liked = false
    } else {
      // Agregar canción
      likedPlaylist.songs.push({
        jamendoId,
        name,
        artist_name,
        image,
        album_image,
        audio,
        addedAt: new Date(),
      })
      liked = true
    }

    await likedPlaylist.save()

    return res.json({ liked, playlist: likedPlaylist })
  } catch (err) {
    console.error("Error al hacer toggle en Me Gusta:", err)
    return res.status(500).json({ message: "Error al actualizar Me Gusta" })
  }
})

// GET /playlists/:id - Obtener una playlist específica
router.get("/:id", async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)

    if (!playlist) {
      return res.status(404).json({ message: "Playlist no encontrada" })
    }

    // Verificar que pertenezca al usuario
    if (playlist.userId.toString() !== req.user.sub) {
      return res.status(403).json({ message: "No tienes permiso para ver esta playlist" })
    }

    return res.json({ playlist })
  } catch (err) {
    console.error("Error al obtener playlist:", err)
    return res.status(500).json({ message: "Error al obtener playlist" })
  }
})

// PUT /playlists/:id - Actualizar playlist
router.put("/:id", async (req, res) => {
  try {
    const { name, description } = req.body || {}

    const playlist = await Playlist.findById(req.params.id)

    if (!playlist) {
      return res.status(404).json({ message: "Playlist no encontrada" })
    }

    // Verificar que pertenezca al usuario
    if (playlist.userId.toString() !== req.user.sub) {
      return res.status(403).json({ message: "No tienes permiso para editar esta playlist" })
    }

    // Actualizar campos
    if (name !== undefined) playlist.name = name.trim()
    if (description !== undefined) playlist.description = description.trim()

    await playlist.save()

    return res.json({ playlist })
  } catch (err) {
    console.error("Error al actualizar playlist:", err)
    return res.status(500).json({ message: "Error al actualizar playlist" })
  }
})

// DELETE /playlists/:id - Eliminar playlist
router.delete("/:id", async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)

    if (!playlist) {
      return res.status(404).json({ message: "Playlist no encontrada" })
    }

    // Verificar que pertenezca al usuario
    if (playlist.userId.toString() !== req.user.sub) {
      return res.status(403).json({ message: "No tienes permiso para eliminar esta playlist" })
    }

    // No permitir eliminar "Me Gusta"
    if (playlist.isLiked) {
      return res.status(400).json({ message: "No puedes eliminar la playlist Me Gusta" })
    }

    await Playlist.findByIdAndDelete(req.params.id)

    return res.json({ message: "Playlist eliminada exitosamente" })
  } catch (err) {
    console.error("Error al eliminar playlist:", err)
    return res.status(500).json({ message: "Error al eliminar playlist" })
  }
})

// POST /playlists/:id/songs - Agregar canción a playlist
router.post("/:id/songs", async (req, res) => {
  try {
    const { jamendoId, name, artist_name, image, album_image, audio } = req.body || {}

    if (!jamendoId || !name || !artist_name) {
      return res.status(400).json({ message: "Datos de canción incompletos" })
    }

    const playlist = await Playlist.findById(req.params.id)

    if (!playlist) {
      return res.status(404).json({ message: "Playlist no encontrada" })
    }

    // Verificar que pertenezca al usuario
    if (playlist.userId.toString() !== req.user.sub) {
      return res.status(403).json({ message: "No tienes permiso para editar esta playlist" })
    }

    // Verificar que la canción no esté ya en la playlist
    const exists = playlist.songs.some((s) => s.jamendoId === jamendoId)
    if (exists) {
      return res.status(400).json({ message: "La canción ya está en esta playlist" })
    }

    // Agregar canción
    playlist.songs.push({
      jamendoId,
      name,
      artist_name,
      image,
      album_image,
      audio,
      addedAt: new Date(),
    })

    await playlist.save()

    return res.json({ playlist })
  } catch (err) {
    console.error("Error al agregar canción:", err)
    return res.status(500).json({ message: "Error al agregar canción" })
  }
})

// DELETE /playlists/:id/songs/:jamendoId - Eliminar canción de playlist
router.delete("/:id/songs/:jamendoId", async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)

    if (!playlist) {
      return res.status(404).json({ message: "Playlist no encontrada" })
    }

    // Verificar que pertenezca al usuario
    if (playlist.userId.toString() !== req.user.sub) {
      return res.status(403).json({ message: "No tienes permiso para editar esta playlist" })
    }

    // Eliminar canción
    const initialLength = playlist.songs.length
    playlist.songs = playlist.songs.filter((s) => s.jamendoId !== req.params.jamendoId)

    if (playlist.songs.length === initialLength) {
      return res.status(404).json({ message: "Canción no encontrada en la playlist" })
    }

    await playlist.save()

    return res.json({ playlist })
  } catch (err) {
    console.error("Error al eliminar canción:", err)
    return res.status(500).json({ message: "Error al eliminar canción" })
  }
})

module.exports = router
