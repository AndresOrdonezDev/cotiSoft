import { Op } from "sequelize";
import { Request, Response } from "express";
import Quote from "../models/QuoteModel";
import Client from "../models/ClientModel";

export class quoteController {

  static getQuotes = async (req: Request, res: Response) => {
    try {
      const { showState, search } = req.query

      const clientWhere: any = {};
      clientWhere[Op.or] = [
        {
          email: {
            [Op.like]: `%${search}%`
          }
        },
        {
          idNumber: {
            [Op.like]: `%${search}%`
          }
        }
      ]
      if (showState === "All") {
        const quotes = await Quote.findAll({
          order: [["createdAt", "DESC"]],
          limit: 500,
          include: [
            {
              model: Client,
              attributes: ["fullname", "contact", "email", "companyName"],
              where: clientWhere
            }
          ],
        });
        return res.json(quotes);
      }
      const quotes = await Quote.findAll({
        order: [["createdAt", "DESC"]],
        limit: 500,
        where: {
          status: showState
        },
        include: [
          {
            model: Client,
            attributes: ["fullname", "contact", "email", "companyName"],
            where: clientWhere
          }
        ],
      });
      return res.json(quotes);
    } catch (error) {
      console.error("Error al listar cotizaciones:", error);
      return res.status(500).json({ message: "Error al listar cotizaciones" });
    }
  };

  static getQuoteById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const quote = await Quote.findByPk(id as string);
      if (!quote) {
        return res.status(404).json({ message: "Cotización no encontrada" });
      }
      return res.json(quote);
    } catch (error) {
      console.error("Error al obtener cotización:", error);
      return res.status(500).json({ message: "Error al obtener cotización" });
    }
  };

  static updateQuote = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const [updated] = await Quote.update(req.body, { where: { id } });

      if (updated === 0) {
        return res.status(404).json({ message: "Cotización no encontrada" });
      }
      return res.status(200).json({ message: "Cotización actualizada" });
    } catch (error) {
      console.error("Error al actualizar cotización:", error);
      return res.status(500).json({ message: "Error al actualizar la cotización" });
    }
  };

  static toggleQuoteStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body
      if (!status) {
        return res.status(400).json({ message: "Debe enviar el estado" });
      }
      //validate status to update
      const validStatuses = ["Aceptada", "Pendiente", "Rechazada"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Estado no válido" });
      }

      // update only status
      const [updated] = await Quote.update(
        { status },
        { where: { id } }
      );

      if (updated === 0) {
        return res.status(404).json({ message: "Cotización no encontrada" });
      }

      return res.status(200).json({
        message: `Cotización actualizada a ${status}`,
      });
    } catch (error) {
      console.error("Error al cambiar el estado de la cotización:", error);
      return res.status(500).json({
        message: "Error al cambiar el estado de la cotización",
      });
    }
  };

  static deleteQuote = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await Quote.destroy({ where: { id } });
      if (!deleted) {
        return res.status(404).json({ message: "Cotización no encontrada" });
      }
      return res.status(200).json({ message: "Cotización eliminada" });
    } catch (error) {
      console.error("Error al eliminar cotización:", error);
      return res.status(500).json({ message: "Error al eliminar la cotización" });
    }
  };
}