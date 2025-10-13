import { Request, Response } from "express";
import QuoteProduct from "../models/QuoteProductModel";
import Product from "../models/ProductModel";
import Quote from "../models/QuoteModel";
import Client from "../models/ClientModel";
import { SendEmailQuote } from "../utils/SendEmail";
import { generateQuotePdf } from "../utils/generateQuotePdf";

export class quoteProductController {

  static getProductsByQuote = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const quote = await Quote.findByPk(id, {
        attributes: ["id", "total", "status", "notes", "createdAt", "updatedAt"],
        include: [
          {
            model: Client,
            attributes: ["id", "fullname", "email","companyName","contact"],
          },
          {
            model: QuoteProduct,
            attributes: ["id", "product_id", "price", "quantity", "tax"],
            include: [
              {
                model: Product,
                attributes: ["id", "name", "description"],
              },
            ],
          },
        ],
      });

      if (!quote) return res.status(404).json({ message: "Cotización no encontrada" });
      return res.json(quote);
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ message: "Error al obtener la cotización" });
    }
  };

  static updateQuoteProduct = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const [updated] = await QuoteProduct.update(req.body, { where: { id } });

      if (updated === 0) {
        return res.status(404).json({ message: "Producto de cotización no encontrado" });
      }
      return res.status(200).json({ message: "Producto de cotización actualizado" });
    } catch (error) {
      console.error("Error al actualizar producto de cotización:", error);
      return res.status(500).json({ message: "Error al actualizar producto de cotización" });
    }
  };

  static deleteQuoteProduct = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await QuoteProduct.destroy({ where: { id } });
      if (!deleted) {
        return res.status(404).json({ message: "Producto de cotización no encontrado" });
      }
      return res.status(200).json({ message: "Producto eliminado de la cotización" });
    } catch (error) {
      console.error("Error al eliminar producto de cotización:", error);
      return res.status(500).json({ message: "Error al eliminar producto de cotización" });
    }
  };

  static generatePdfQuote = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const quote = await Quote.findByPk(id, {
        attributes: ["id", "total", "status", "notes", "createdAt","createdBy"],
        include: [
          { model: Client, attributes: ["fullname", "idNumber", "email", "contact", "companyName"] },
          {
            model: QuoteProduct,
            attributes: ["price", "quantity", "tax"],
            include: [{ model: Product, attributes: ["name", "description"] }],
          },
        ],
      });

      if (!quote) {
        return res.status(404).json({ message: "Cotización no encontrada" });
      }
      //generate Pdf
      await generateQuotePdf({quote, res});
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al generar PDF" });
    }
  };

  static sendQuoteByEmail = async (req: Request, res: Response) => {
    try {
      const { id, client,email } = req.body
      await SendEmailQuote({ id, client,email })
      return res.status(200).json({ message: "Cotización Enviada" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al Enviar la Cotización" });
    }

  }
}