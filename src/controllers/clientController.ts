import { Request, Response } from "express";
import Client from "../models/ClientModel";

export class clientController {
    static createClient = async (req: Request, res: Response) => {
        try {
            const { idNumber } = req.body
            const clientExist = await Client.findOne({
                where:{idNumber,isActive:1}
            })
            if (clientExist) {
                res.status(400).json({ message: "cliente ya existe" })
                return
            }
            await Client.create(req.body);
            return res.status(200).json({ message: "Cliente creado" });
        } catch (error) {
            console.error("Error al crear cliente:", error);
            return res.status(500).json({ message: "Error al crear el cliente" });
        }
    }

    static getClients = async (req: Request, res: Response) => {
        try {
            const clients = await Client.findAll({
                order: [["createdAt", "DESC"]],
                limit: 10,
            });
            return res.json(clients);
        } catch (error) {
            console.error("Error al listar clientes:", error);
            return res.status(500).json({ message: "Error al listar clientes" });
        }
    }

    static getClientById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const clientFound = await Client.findByPk(id);
            if (!clientFound) {
                return res.status(404).json({ message: "Cliente no encontrado" });
            }
            return res.json(clientFound);
        } catch (error) {
            console.error("Error al obtener cliente:", error);
            return res.status(500).json({ message: "Error al obtener cliente" });
        }
    }

    static updateClient = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const [updated] = await Client.update(req.body, {
                where: { id },
            });

            if (updated === 0) {
                return res.status(404).json({ message: "Cliente no encontrado" });
            }
            return res.status(200).json({ message: "Cliente actualizado" });
        } catch (error) {
            console.error("Error al actualizar cliente:", error);
            return res.status(500).json({ message: "Error al actualizar cliente" });
        }
    }

    static toggleClientStatus = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const client = await Client.findByPk(id);
            if (!client) {
                return res.status(404).json({ message: "Cliente no encontrado" });
            }
            client.isActive = !client.isActive;
            await client.save();
            return res.status(200).json({
                message: `Se ${client.isActive ? "activó" : "desactivó"} el cliente`,
            });
        } catch (error) {
            console.error("Error al cambiar estado del cliente:", error);
            return res.status(500).json({ message: "Error al cambiar estado del cliente" });
        }
    }
    static getListClients = async (req: Request, res: Response) => {
        try {
            const clients = await Client.findAll({
                order: [["createdAt", "DESC"]],
                limit: 10,
                where:{
                    isActive:1
                }
            });
            return res.json(clients);
        } catch (error) {
            console.error("Error al listar clientes:", error);
            return res.status(500).json({ message: "Error al listar clientes" });
        }
    }
}
