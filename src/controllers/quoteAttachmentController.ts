import { Request, Response } from "express";
import Attachment from "../models/QuoteAttachmentModel";
import { db } from "../config/db";
import fs from "fs";
import path from "path";
import { Op } from "sequelize";

export class AttachmentController {

    // create attachment
    static createAttachment = async (req: Request, res: Response) => {
        try {
            const { name, attachmentType } = req.body;
            const file = req.file as Express.Multer.File;

            // Verify that the file has been uploaded
            if (!file) {
                return res.status(400).json({ message: "Debe enviar un archivo" });
            }

            // there is no name
            if (!name) {
                // Delete uploaded file if the name is not sent
                fs.unlinkSync(file.path);
                return res.status(400).json({ message: "Debe especificar el nombre del adjunto" });
            }

            // Verify that the attachment type is being sent.
            if (!attachmentType) {
                // Delete uploaded file if the type is not sent
                fs.unlinkSync(file.path);
                return res.status(400).json({ message: "Debe especificar el tipo de adjunto" });
            }

            // Validate that the attachment type is valid (1, 2 or 3)
            const validTypes = [1, 2, 3];
            const typeNumber = parseInt(attachmentType);
            if (!validTypes.includes(typeNumber)) {
                // Delete uploaded file if the type is invalid
                fs.unlinkSync(file.path);
                return res.status(400).json({
                    message: "Tipo de adjunto inválido. Debe ser: 1 (Producto), 2 (Servicio) o 3 (Productos y Servicios)"
                });
            }

            // Create attachment in the database
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
            // if error, Delete uploaded file
            const file = req.file as Express.Multer.File;
            if (file && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }

            console.error("Error al crear adjunto:", error);
            return res.status(500).json({ message: "Error al crear el adjunto" });
        }
    };

    // list all attachments withe search params
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

    // get attachment by ID
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

    // update attachment
    static updateAttachment = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { name, attachmentType } = req.body;
            const file = req.file as Express.Multer.File;

            // search attach
            const attachment = await Attachment.findByPk(id);

            if (!attachment) {
                // delete file if there is no attachment
                if (file && fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
                return res.status(404).json({ message: "Adjunto no encontrado" });
            }

            // validate if there is name
            if (!name) {
                // delete attachment if no exist name
                if (file && fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
                return res.status(400).json({ message: "Debe especificar el nombre del adjunto" });
            }

            // validate attachment type
            if (!attachmentType) {
                
                if (file && fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
                return res.status(400).json({ message: "Debe especificar el tipo de adjunto" });
            }

    
            const validTypes = [1, 2, 3];
            const typeNumber = parseInt(attachmentType);
            if (!validTypes.includes(typeNumber)) {
               
                if (file && fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
                return res.status(400).json({
                    message: "Tipo de adjunto inválido. Debe ser: 1 (Producto), 2 (Servicio) o 3 (Productos y Servicios)"
                });
            }

            // update fields
            attachment.name = name;
            attachment.attachmentType = typeNumber;

            // if file uploaded, delete prev file
            if (file) {
                
                const oldFilePath = path.join(__dirname, "../public", attachment.url);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }

                // update url file
                attachment.url = `/attachment/${file.filename}`;
            }

            // save changes
            await attachment.save();

            return res.status(200).json({
                message: "Adjunto actualizado correctamente",
                attachment
            });

        } catch (error) {
            // if error, delete file uploaded
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

            // change status
            attachment.isActive = !attachment.isActive;
            await attachment.save();

            return res.status(200).json({
                message: `Adjunto ${attachment.isActive ? 'activado' : 'desactivado'}`
            });

        } catch (error) {
            console.error("Error al cambiar estado del adjunto:", error);
            return res.status(500).json({ message: "Error al cambiar estado del adjunto" });
        }
    };

    // delete attachment
    static deleteAttachment = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            // search attachment to get the path
            const attachment = await Attachment.findByPk(id);

            if (!attachment) {
                return res.status(404).json({ message: "Adjunto no encontrado" });
            }

            // Delete file on server
            const filePath = path.join(__dirname, "../public", attachment.url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            // Delete record on db
            await attachment.destroy();

            return res.status(200).json({ message: "Archivo adjunto eliminado" });

        } catch (error) {
            console.error("Error al eliminar adjunto:", error);
            return res.status(500).json({ message: "Error al eliminar el adjunto" });
        }
    };
}
