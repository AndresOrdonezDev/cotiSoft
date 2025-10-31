import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import User from "../models/UserModel";
import { generateJWT } from "../utils/index";
import { SendEmailTokenUser } from "../utils/SendEmail";

const SALT_ROUNDS = 10;
export class authController {
  static createAccount = async (req: Request, res: Response) => {
    try {
      const { username, email, password, isAdmin } = req.body;
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
          .json({ message: "Correo y contraseña son obligatorios" });
        return;
      }
      
      // Buscar el usuario por email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        res.status(401).json({ message: "Correo no registrado" });
        return;
      }

      if (!user.isActive) return res.status(404).json({ message: "Usuario Inactivo" });

      // Comparar contraseñas
      const isPasswordValid = await bcrypt.compare(
        password,
        user.password
      );
      if (!isPasswordValid) {
        res.status(401).json({ message: "Contraseña incorrecta" });
        return;
      }
      const token = generateJWT({ id: user.id })
      res.status(200).send(token);
      return;
    } catch (error) {
      res.status(500).json({ message: "Error en el servidor" });
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

      res.status(200).json({ message: "Contraseña actualizada correctamente" });
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
  static updateUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { email, username, isAdmin } = req.body;
      if (!email || !username) {
        return res
          .status(400)
          .json({ message: "El correo y el nombre de usuario son obligatorios" });
      }
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      const existingEmail = await User.findOne({
        where: {
          email,
          id: { [Op.ne]: id },// if id !== current id
        },
      });

      if (existingEmail) {
        return res.status(400).json({
          message: "El correo ingresado ya pertenece a otro usuario",
        });
      }
      await user.update({
        email,
        username,
        isAdmin: isAdmin ?? user.isAdmin,
      });
      return res.status(200).json({ message: "Usuario actualizado" });
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      return res.status(500).json({ message: "Error al actualizar el usuario" });
    }
  };
  static logout = async (req: Request, res: Response) => {
    try {
      req.user.email = "",
        req.user.id = 0
      req.user.username = ""
      res.status(200).json({ message: "Salida segura" });
      return
    } catch (error) {
      console.error("Error logout", error);
      res.status(500).json({ message: "Error al Cerrar Sesión" });
      return;
    }
  }
  static getUsers = async (req: Request, res: Response) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }
      const users = await User.findAll({
        where: {
          id: { [Op.ne]: req.user.id },
        },
        order: [["createdAt", "DESC"]],
        limit: 200,
        attributes: ["id", "username", "email", 'isAdmin', 'isActive'],
      })
      return res.json(users)
    } catch (error) {
      console.error("Error al listar usuarios:", error)
      return res.status(500).json({ message: "Error al listar usuarios" })
    }
  }
  static getUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const user = await User.findByPk(id, {
        attributes: ["id", "username", "email", "isAdmin","isActive"]
      })
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" })
      return res.json(user);
    } catch (error) {
      console.error("Error al obtener el usuario:", error)
      return res.status(500).json({ message: "Error al obtener el usuario" })
    }

  }
  static toggleUserStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      // toggle status
      const newStatus = !user.isActive;
      await user.update({ isActive: newStatus });
      return res.status(200).json({ message: `Usuario ${newStatus ? "activado" : "inactivado"}`, });
    } catch (error) {
      console.error("Error al cambiar estado del usuario:", error);
      return res
        .status(500)
        .json({ message: "Error al cambiar el estado del usuario" });
    }
  };

  static sendTokenForgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      // set token 
      const token = generateJWT({ id: user.id })
      await user.update({ token });
      await SendEmailTokenUser({ email, token })
      return res.status(200).json({ message: `Se envió un correo a ${email}`, });
    } catch (error) {
      console.error("Error al enviar el token:", error);
      return res
        .status(500)
        .json({ message: "Error al enviar el token" });
    }
  };

  static updatePasswordToken = async (req: Request, res: Response) => {
    try {
      const { email, password, token } = req.body;
      if (!email || !password || !token) {
        return res
          .status(400)
          .json({ message: "Correo, contraseña y token son obligatorios" });
      }
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      if (!user.token || user.token !== token) {
        return res.status(400).json({ message: "Token inválido o expirado" });
      }
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      await user.update({
        password: hashedPassword,
        token: "",
      });
      return res
        .status(200)
        .json({ message: "Contraseña actualizada" });
    } catch (error) {
      console.error("Error al restablecer la contraseña:", error);
      return res
        .status(500)
        .json({ message: "Error interno del servidor" });
    }
  };
}

