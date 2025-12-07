import mongoose from "mongoose";

const UsuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    avatar: {
      type: String,
      default: "https://i.imgur.com/2ZzK8K7.png"
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Usuario", UsuarioSchema);
