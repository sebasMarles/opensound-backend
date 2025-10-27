const { Schema, model } = require("mongoose")

const PlaylistSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    isLiked: { type: Boolean, default: false }, // true solo para la playlist "Me Gusta"
    songs: [
      {
        jamendoId: { type: String, required: true },
        name: { type: String, required: true },
        artist_name: { type: String, required: true },
        image: { type: String },
        album_image: { type: String },
        audio: { type: String },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
)

module.exports = model("Playlist", PlaylistSchema)
