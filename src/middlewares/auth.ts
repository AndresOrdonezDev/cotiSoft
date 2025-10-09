import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/UserModel";
import dotenv from "dotenv";
dotenv.config();

type IUser = {
  id?: number;
  username: string;
  email: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bearer = req.headers.authorization;

  if (!bearer) {
    const error = new Error("Usuario no autorizado");
    res.status(500).send(error.message);
    return;
  }
  const token = bearer.split(" ")[1];

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error(
        "JWT_SECRET no está definida en las variables de entorno"
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);


    if (typeof decoded === "object" && decoded.id) {

      const user = await User.findByPk(decoded.id, {
        attributes: ["id", "username", "email", 'isAdmin', 'isActive'],
      });
      if (!user) return res.status(500).send("Token no válido");
      req.user = user;
      next();
    }
  } catch (error) {
    res.status(500).json({ error: "Error al vaidar el token" });
    return;
  }
};
