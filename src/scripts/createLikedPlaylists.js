const mongoose = require("mongoose")
const User = require("../models/User")
const Playlist = require("../models/Playlist")
require("dotenv").config()

async function createLikedPlaylists() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("✅ Conectado a MongoDB")

    const users = await User.find()
    console.log(`📊 Encontrados ${users.length} usuarios`)

    let created = 0

    for (const user of users) {
      const existingLiked = await Playlist.findOne({ userId: user._id, isLiked: true })

      if (!existingLiked) {
        await Playlist.create({
          userId: user._id,
          name: "Me Gusta",
          description: "Tus canciones favoritas",
          isLiked: true,
          songs: [],
        })
        console.log(`✅ Playlist "Me Gusta" creada para ${user.email}`)
        created++
      } else {
        console.log(`⏭️  ${user.email} ya tiene playlist "Me Gusta"`)
      }
    }

    console.log(`\n✅ Migración completada: ${created} playlists creadas`)
    process.exit(0)
  } catch (err) {
    console.error("❌ Error en migración:", err)
    process.exit(1)
  }
}

createLikedPlaylists()
