import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Admin from "./models/Admin.js";
import dotenv from "dotenv";
dotenv.config();

const crearAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const passwordHash = await bcrypt.hash("123456", 10);

  await Admin.create({
    username: "admin",
    correo: "admin@blogme.com",
    password: passwordHash,
    rol: "admin",
  });

  console.log("Admin creado correctamente");
  process.exit();
};

crearAdmin();
