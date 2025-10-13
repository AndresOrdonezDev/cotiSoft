import { Request, Response, NextFunction } from "express";
export const validatePermissions = async (req: Request,res: Response,next: NextFunction)=>{
    try {
        if(!req.user.isAdmin) return res.status(401).json({ message: "Usuario sin permisos para esta acción" });
        next()
    } catch (error) {
    res.status(500).json({ message: "Error al permisos" });
    return;
  }
}