import { Request, Response } from "express";
import PDFDocument from "pdfkit"
import QuoteProduct from "../models/QuoteProductModel";
import Product from "../models/ProductModel";
import Quote from "../models/QuoteModel";
import Client from "../models/ClientModel";

export class quoteProductController {

  static getProductsByQuote = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const quote = await Quote.findByPk(id, {
        attributes: ["id", "total", "status", "notes", "createdAt", "updatedAt"],
        include: [
          {
            model: Client,
            attributes: ["id", "fullname", "email"],
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
      const doc = new PDFDocument();

      // Configura headers antes de enviar nada
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=cotizacion.pdf");

      // Envía el PDF al cliente
      doc.pipe(res);

      // Contenido del PDF
      doc.fontSize(20).text("Cotización de productos", { align: "center" });
      doc.moveDown();
      doc.text("Gracias por su interés en nuestros productos.");

      // Finaliza el PDF
      doc.end();

      // ❌ No pongas aquí ningún res.send()
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al generar PDF" });
    }
  }
}
