import { Request, Response } from "express";
import Attachment from "../models/QuoteAttachmentModel";
import { db } from "../config/db";
import fs from "fs";
import path from "path";
import { Op } from "sequelize";

export class AttachmentController {

    // Crear un adjunto
    static createAttachment = async (req: Request, res: Response) => {
        try {
            const { name, attachmentType } = req.body;
            const file = req.file as Express.Multer.File;

            // Validar que se haya subido un archivo
            if (!file) {
                return res.status(400).json({ message: "Debe enviar un archivo" });
            }

            // Validar que se envíe el nombre
            if (!name) {
                // Eliminar archivo subido si no se envía el nombre
                fs.unlinkSync(file.path);
                return res.status(400).json({ message: "Debe especificar el nombre del adjunto" });
            }

            // Validar que se envíe el tipo de adjunto
            if (!attachmentType) {
                // Eliminar archivo subido si no se envía el tipo
                fs.unlinkSync(file.path);
                return res.status(400).json({ message: "Debe especificar el tipo de adjunto" });
            }

            // Validar que el tipo de adjunto sea válido (1, 2 o 3)
            const validTypes = [1, 2, 3];
            const typeNumber = parseInt(attachmentType);
            if (!validTypes.includes(typeNumber)) {
                // Eliminar archivo subido si el tipo no es válido
                fs.unlinkSync(file.path);
                return res.status(400).json({
                    message: "Tipo de adjunto inválido. Debe ser: 1 (Producto), 2 (Servicio) o 3 (Productos y Servicios)"
                });
            }

            // Crear registro de adjunto en la base de datos
            const attachment = await Attachment.create({
                name,
                attachmentType: typeNumber,
                url: `/attachment/${file.filename}`,
                isActive: true
            });

            return res.status(201).json({
                message: "Adjunto creado correctamente",
                attachment
            });

        } catch (error) {
            // Eliminar archivo subido en caso de error
            const file = req.file as Express.Multer.File;
            if (file && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }

            console.error("Error al crear adjunto:", error);
            return res.status(500).json({ message: "Error al crear el adjunto" });
        }
    };

    // Listar todos los adjuntos con filtros
    static getAttachments = async (req: Request, res: Response) => {
        try {
            const { isActive, search } = req.query;
            let whereClause: any = { isActive: "1" };

            // Filtrar por isActive
            if (isActive === "0") {
                whereClause.isActive = "0";
            } else if (isActive === "1") {
                whereClause.isActive = "1";
            }

            // Filtrar por búsqueda
            if (search) {
                whereClause[Op.or] = [
                    { name: { [Op.like]: `%${search}%` } }
                ];
            }

            // Obtener todos los adjuntos filtrados
            const attachments = await Attachment.findAll({
                where: whereClause,
                order: [["createdAt", "DESC"]],
                limit: 500
            });

            return res.json(attachments);

        } catch (error) {
            console.error("Error al obtener adjuntos:", error);
            return res.status(500).json({ message: "Error al obtener los adjuntos" });
        }
    };

    // Obtener un adjunto por ID
    static getAttachmentById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const attachment = await Attachment.findByPk(id);

            if (!attachment) {
                return res.status(404).json({ message: "Adjunto no encontrado" });
            }

            return res.json(attachment);

        } catch (error) {
            console.error("Error al obtener adjunto:", error);
            return res.status(500).json({ message: "Error al obtener el adjunto" });
        }
    };

    // Actualizar un adjunto
    static updateAttachment = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { name, attachmentType } = req.body;
            const file = req.file as Express.Multer.File;

            // Buscar el adjunto
            const attachment = await Attachment.findByPk(id);

            if (!attachment) {
                // Eliminar archivo subido si el adjunto no existe
                if (file && fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
                return res.status(404).json({ message: "Adjunto no encontrado" });
            }

            // Validar que se envíe el nombre
            if (!name) {
                // Eliminar archivo subido si no se envía el nombre
                if (file && fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
                return res.status(400).json({ message: "Debe especificar el nombre del adjunto" });
            }

            // Validar que se envíe el tipo de adjunto
            if (!attachmentType) {
                // Eliminar archivo subido si no se envía el tipo
                if (file && fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
                return res.status(400).json({ message: "Debe especificar el tipo de adjunto" });
            }

            // Validar que el tipo de adjunto sea válido (1, 2 o 3)
            const validTypes = [1, 2, 3];
            const typeNumber = parseInt(attachmentType);
            if (!validTypes.includes(typeNumber)) {
                // Eliminar archivo subido si el tipo no es válido
                if (file && fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
                return res.status(400).json({
                    message: "Tipo de adjunto inválido. Debe ser: 1 (Producto), 2 (Servicio) o 3 (Productos y Servicios)"
                });
            }

            // Actualizar campos
            attachment.name = name;
            attachment.attachmentType = typeNumber;

            // Si se subió un nuevo archivo, eliminar el anterior y actualizar
            if (file) {
                // Eliminar archivo anterior
                const oldFilePath = path.join(__dirname, "../public", attachment.url);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }

                // Actualizar URL con el nuevo archivo
                attachment.url = `/attachment/${file.filename}`;
            }

            // Guardar cambios
            await attachment.save();

            return res.status(200).json({
                message: "Adjunto actualizado correctamente",
                attachment
            });

        } catch (error) {
            // Eliminar archivo subido en caso de error
            const file = req.file as Express.Multer.File;
            if (file && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }

            console.error("Error al actualizar adjunto:", error);
            return res.status(500).json({ message: "Error al actualizar el adjunto" });
        }
    };

    // Toggle isActive (activar/desactivar)
    static toggleAttachmentActive = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const attachment = await Attachment.findByPk(id);

            if (!attachment) {
                return res.status(404).json({ message: "Adjunto no encontrado" });
            }

            // Cambiar estado
            attachment.isActive = !attachment.isActive;
            await attachment.save();

            return res.status(200).json({
                message: `Adjunto ${attachment.isActive ? 'activado' : 'desactivado'} correctamente`
            });

        } catch (error) {
            console.error("Error al cambiar estado del adjunto:", error);
            return res.status(500).json({ message: "Error al cambiar estado del adjunto" });
        }
    };

    // Eliminar adjunto (mantengo esta función por si la necesitan)
    static deleteAttachment = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            // Buscar el adjunto para obtener la ruta del archivo
            const attachment = await Attachment.findByPk(id);

            if (!attachment) {
                return res.status(404).json({ message: "Adjunto no encontrado" });
            }

            // Eliminar el archivo físico del servidor
            const filePath = path.join(__dirname, "../public", attachment.url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            // Eliminar el registro de la base de datos
            await attachment.destroy();

            return res.status(200).json({ message: "Archivo adjunto eliminado correctamente" });

        } catch (error) {
            console.error("Error al eliminar adjunto:", error);
            return res.status(500).json({ message: "Error al eliminar el adjunto" });
        }
    };
}
