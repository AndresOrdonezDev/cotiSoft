import { Request, Response } from "express";
import PDFDocument from "pdfkit-table"
import path from "path";
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
      const { id } = req.params;

      const quote = await Quote.findByPk(id, {
        attributes: ["id", "total", "status", "notes", "createdAt"],
        include: [
          { model: Client, attributes: ["fullname","idNumber", "email","contact","companyName"] },
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

      const doc = new PDFDocument({ margin: 25 });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=cotizacion_${quote.id}.pdf`);
      doc.pipe(res);
      const logoPath = path.join(__dirname, "../public/logo-rec.png");

      // === ENCABEZADO ===
      doc.text(`Fecha: ${new Date(quote.createdAt).toLocaleDateString()}`,{align:'right'});
      doc.moveDown(1);
      doc
        .fontSize(15)
        .text(`COTIZACIÓN No. ${id}`, { align: "center", underline: true })
        .moveDown(1);
      doc.save();
      doc.opacity(0.2); // 🔹 Ajusta la opacidad (0.0 a 1.0)
      doc.image(logoPath, 150, 150, { width: 300 });
      doc.restore();
      doc.moveDown(2);
      doc.fontSize(12);
      
      doc.text(`Cliente: ${quote.client.fullname}`);
      if (quote.client.companyName) doc.text(`Razón Social: ${quote.client.companyName}`);
      doc.text(`Identificación: ${quote.client.idNumber}`);
      doc.text(`Correo: ${quote.client.email}`);
      doc.text(`Contacto: ${quote.client.contact}`);
      
      
      doc.moveDown(2);

      // === TABLA ===
      const productsTotalTax = quote.quoteProducts.map(p => {
        const base = (p.price * p.quantity) / (1 + p.tax / 100) 
        const iva = (p.price * p.quantity) - base
        return { base: base.toFixed(2), iva: iva.toFixed(2) }
      })
      const TotalBase = productsTotalTax.reduce((total, product) => +product.base + total, 0)
      const TotalTax = productsTotalTax.reduce((total, product) => +product.iva + total, 0)
      const table = {
        headers: [
          { label: " Producto", property: "producto", width: 150 },
          { label: "Descripción", property: "descripcion", width: 150 },
          { label: "Cantidad", property: "cantidad", width: 50, align: "right" },
          { label: "Iva", property: "iva", width: 30, align: "right" },
          { label: "Precio", property: "precio", width: 80, align: "right" },
          { label: "Total", property: "total", width: 80, align: "right" },
        ],
        datas: quote.quoteProducts.map((qp) => ({
          producto: qp.products.name,
          descripcion: qp.products.description,
          cantidad: qp.quantity,
          iva: `${qp.tax}%`,
          precio: `$${qp.price.toLocaleString()}`,
          total: `$${(qp.price * qp.quantity).toLocaleString()}`,
        })),
      };

      // 👇 Aquí se usa directamente doc.table
      await (doc as any).table(table, {
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(11),
        prepareRow: (row, i) => doc.font("Helvetica").fontSize(10),
      });

      doc.moveDown(2);
      
      doc.font("Helvetica-Bold").fontSize(12);
      doc.text(`SUBTOTAL: $${TotalBase.toLocaleString()}`, { align: "right" });
      doc.moveDown(0.5);

      doc.font("Helvetica-Bold").fontSize(12);
      doc.text(`IVA: $${TotalTax.toLocaleString()}`, { align: "right" });
      doc.moveDown(1);

      doc.font("Helvetica-Bold").fontSize(12);
      doc.text(`TOTAL COTIZACIÓN: $${quote.total.toLocaleString()}`, { align: "right" });
      
      doc.moveDown(2);

      if (quote.notes){
        doc.font("Helvetica").fontSize(12);
        doc.text(`Observaciones: ${quote.notes}`);
      } 
      doc.moveDown(2);
      doc.font("Helvetica").fontSize(12);
      doc.text('Atte. REC-Soluciones S.A.S')
      doc.text('Contacto: 311 222 33 44')
      doc.text('Correo: recsoluciones@gmail.com')
      doc.text('Calle 2 #a - 23')
      doc.moveDown(1);
      doc.text('A la espera de una favorable respuesta, agradecemos su interés.',{align:"center"}).fontSize(10)
      doc.end();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al generar PDF" });
    }
  };
}
