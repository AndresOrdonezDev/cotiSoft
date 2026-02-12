import { Request, Response } from "express";
import { json, Op } from "sequelize";
import Client from "../models/ClientModel";
import EmailClient from "../models/EmailListClient";

export class clientController {

    static createClient = async (req: Request, res: Response) => {
        try {
            const { idNumber, email } = req.body
            const clientExist = await Client.findOne({
                where: {
                    [Op.or]: [
                        { idNumber },
                        { email }
                    ]
                }
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
            const { isActive, search } = req.query
            let whereClause: any = { isActive: "1" }
            if (isActive === "0") {
                whereClause.isActive = "0"
            } else if (isActive === "1") {
                whereClause.isActive = "1"
            }

            if (search) {
                whereClause[Op.or] = [
                    { fullname: { [Op.like]: `%${search}%` } },
                    { idNumber: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } },
                    { companyName: { [Op.like]: `%${search}%` } },
                ]
            }
            const clients = await Client.findAll({
                where: whereClause,
                order: [["createdAt", "DESC"]],
                limit: 500,
            })

            return res.json(clients)
        } catch (error) {
            console.error("Error al listar clientes:", error)
            return res.status(500).json({ message: "Error al listar clientes" })
        }
    }

    static getClientById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const clientFound = await Client.findByPk(id as string, {
                include: [
                    {
                        model: EmailClient,
                        as: "emailList"
                    }
                ]
            });

            if (!clientFound) {
                return res.status(404).json({ message: "Cliente no encontrado" });
            }

            return res.json(clientFound);
        } catch (error) {
            console.error("Error al obtener cliente:", error);
            return res.status(500).json({ message: "Error al obtener cliente" });
        }
    };

    static updateClient = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { idNumber, email } = req.body;
            const clientExist = await Client.findOne({
                where: {
                    [Op.or]: [
                        { idNumber },
                        { email }
                    ],
                    id: { [Op.ne]: id }//exclude the client I'm editing
                }
            });

            if (clientExist) {
                return res.status(400).json({ message: "Ya existe un cliente con ese documento o correo" });
            }

            const [updated] = await Client.update(req.body, {
                where: { id },
            });

            if (updated === 0) {
                return res.status(404).json({ message: "Cliente no encontrado" });
            }

            return res.status(200).json({ message: "Cliente actualizado" });

        } catch (error) {
            console.error("Error al actualizar cliente:", error);
            return res.status(500).json({ message: "Error al actualizar el cliente" });
        }
    };

    static toggleClientStatus = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const client = await Client.findByPk(id as string);
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
    static getClientToQuote = async (req: Request, res: Response) => {
        try {
            const { search } = req.params
            let whereClause: any = {}
            if (search) {
                whereClause[Op.or] = [
                    { idNumber: +search },
                    { email: search },
                ]
            }
            const client = await Client.findOne({
                where: whereClause,
                order: [["createdAt", "DESC"]],
            })
            if (!client) return res.status(400).json({ message: "Cliente no encontrado" })
            if(!client.isActive) return res.status(409).json({message:"El cliente se encuentra inactivo"})
            return res.json(client)
        } catch (error) {
            console.error("Error al consultar el cliente: ", error)
            return res.status(500).json({ message: "Error al consultar el cliente" })
        }
    }
    //add email to client
    static addListEmail = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { email } = req.body;
            // if client exist  
            const client = await Client.findByPk(id as string);
            if (!client) {
                return res.status(404).json({ message: "Cliente no encontrado" });
            }

            // validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || !email.trim() || !emailRegex.test(email.trim())) {
                return res.status(400).json({ message: "Debe enviar un email válido" });
            }

            // check if email already exists for this client
            const existingEmail = await EmailClient.findOne({
                where: {
                    client_id: +id,
                    email: email.trim().toLowerCase()
                }
            });

            if (existingEmail) {
                return res.status(400).json({ message: "Este correo ya está registrado para este cliente" });
            }

            // create email
            await EmailClient.create({
                client_id: +id,
                email: email.trim().toLowerCase()
            });

            return res.status(201).json({ message: "Correo agregado correctamente" });

        } catch (error) {
            console.error("Error al agregar correo del cliente: ", error);
            return res.status(500).json({ message: "Error al agregar correo del cliente" });
        }
    };

    // get emails list by client ID
    static getClientEmails = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const client = await Client.findByPk(id as string);
            if (!client) {
                return res.status(404).json({ message: "Cliente no encontrado" });
            }

            const emails = await EmailClient.findAll({
                where: { client_id: id },
                order: [["createdAt", "ASC"]]
            });

            return res.json(emails);

        } catch (error) {
            console.error("Error al obtener emails del cliente: ", error);
            return res.status(500).json({ message: "Error al obtener emails del cliente" });
        }
    };

    //delete email from list
    static deleteEmailFromList = async (req: Request, res: Response) => {
        try {

            const { id } = req.params;
            const emailDeleted = await EmailClient.destroy({
                where: { id }
            });

            if (emailDeleted === 0) {
                return res.status(404).json({ message: "Email no encontrado" });
            }

            return res.status(200).json({ message: "Email eliminado correctamente" });

        } catch (error) {
            console.error("Error al eliminar email: ", error);
            return res.status(500).json({ message: "Error al eliminar email" });
        }
    };

}