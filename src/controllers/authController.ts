import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/UserModel";
import { generateJWT } from "../utils/index";

const SALT_ROUNDS = 10;
export class authController {
  static createAccount = async (req: Request, res: Response) => {
    try {
      const { username, email, password, isAdmin} = req.body;

      // Validar campos obligatorios
      if (!username || !email || !password) {
        res.status(400).json({ message: "Todos los campos son obligatorios" });
        return;
      }

      // Verificar si el email ya está registrado
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        res.status(409).json({ message: "El correo ya está registrado" });
        return;
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // Crear nuevo usuario
      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        isAdmin
      });
      res.status(201).json({
        message: "Cuenta creada exitosamente",
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
        },
      });

      return;
    } catch (error) {
      console.error("Error al crear la cuenta:", error);
      res.status(500).json({ message: "Error del servidor" });
      return;
    }
  };

  static login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Validar campos obligatorios
      if (!email || !password) {
        res
          .status(400)
          .send("Correo y contraseña son obligatorios");
        return;
      }

      // Buscar el usuario por email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        res.status(401).send("Correo no registrado");
        return;
      }

      // Comparar contraseñas
      const isPasswordValid = await bcrypt.compare(
        password,
        user.password
      );
      if (!isPasswordValid) {
        res.status(401).send("Contraseña incorrecta");
        return;
      }
      const token = generateJWT({ id: user.id })
      res.status(200).send(token);
      return;
    } catch (error) {
      res.status(500).send("Error del servidor");
      return;
    }
  };

  static updatePassword = async (req: Request, res: Response) => {
    try {
      const { email, newPassword } = req.body;

      // Validar campos obligatorios
      if (!email || !newPassword) {
        res.status(400).json({ message: "Correo y nueva contraseña son obligatorios" });
        return;
      }

      // Buscar el usuario por email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }

      // Hash de la nueva contraseña
      const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

      // Actualizar contraseña
      await user.update({ password: hashedNewPassword });

      res.status(200).json({ message: "Contraseña actualizada correctamente 👌" });
      return;
    } catch (error) {
      console.error("Error al actualizar la contraseña:", error);
      res.status(500).json({ message: "Error del servidor" });
      return;
    }
  };

  static user = async (req: Request, res: Response) => {
    res.json(req.user)
    return
  }
}
