import { Request, Response } from "express";
import QuoteProduct from "../models/QuoteProductModel";
import Product from "../models/ProductModel";
import Quote from "../models/QuoteModel";
import Client from "../models/ClientModel";
import Attachment from "../models/QuoteAttachmentModel";
import { SendEmailQuote } from "../utils/SendEmail";
import { generateQuotePdf } from "../utils/generateQuotePdf";
import fs from "fs";
import path from "path";

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
      const { id, client, emails, attachmentType } = req.body;

      // Obtener la cotización de la base de datos
      const quote = await Quote.findByPk(id, {
        attributes: ["id", "total", "status", "notes", "createdAt", "createdBy"],
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

      // Generar el PDF de la cotización como buffer
      const pdfBuffer = await generateQuotePdf({ quote });

      if (!pdfBuffer) {
        return res.status(500).json({ message: "Error al generar el PDF" });
      }

      // Buscar el attachment por tipo si se proporciona attachmentType
      let attachmentBuffer: Buffer | null = null;
      let attachmentFilename: string | null = null;

      if (attachmentType) {
        const attachment = await Attachment.findOne({
          where: {
            attachmentType: parseInt(attachmentType),
            isActive: true
          },
          order: [["createdAt", "DESC"]]
        });

        if (attachment) {
          // Construir la ruta completa del archivo
          const attachmentPath = path.join(__dirname, "../public", attachment.url);

          // Verificar si el archivo existe
          if (fs.existsSync(attachmentPath)) {
            // Leer el archivo como buffer
            attachmentBuffer = fs.readFileSync(attachmentPath);
            attachmentFilename = path.basename(attachment.url);
          } else {
            console.warn(`Archivo de attachment no encontrado: ${attachmentPath}`);
          }
        }
      }

      // Enviar el correo con los PDFs adjuntos
      await SendEmailQuote({
        id,
        client,
        emails,
        pdfBuffer,
        attachmentBuffer,
        attachmentFilename
      });

      return res.status(200).json({ message: "Cotización Enviada" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al Enviar la Cotización" });
    }
  }
}