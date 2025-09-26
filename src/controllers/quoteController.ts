import { Request, Response } from "express";
import Quote from "../models/QuoteModel";
import Client from "../models/ClientModel";

export class quoteController {
  
  static getQuotes = async (_req: Request, res: Response) => {
    try {
      const quotes = await Quote.findAll({
        order: [["createdAt", "DESC"]],
        limit: 10,
        include: [
        {
          model: Client,
          attributes: ["fullname", "contact","email","companyName"]
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
      const quote = await Quote.findByPk(id);
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
