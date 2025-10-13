import { Request, Response } from "express";
import PDFDocument from "pdfkit";
import path from "path";
import Quote from "../models/QuoteModel";

type GeneratePdfQuoteProps = {
  quote: Quote,
  res: Response<any, Record<string, any>>
}
export const generateQuotePdf = async ({ quote, res }: GeneratePdfQuoteProps) => {
  const doc = new PDFDocument({ margin: 25 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=cotizacion_${quote.id}.pdf`);

  doc.pipe(res);

  const logoPath = path.join(__dirname, "../public/logo-rec.png");

  // === ENCABEZADO ===
  doc.text(`Fecha: ${new Date(quote.createdAt).toLocaleDateString()}`, { align: "right" });
  doc.moveDown(1);
  doc.fontSize(15).text(`COTIZACIÓN No. ${quote.id}`, { align: "center", underline: true }).moveDown(1);
  doc.save();
  doc.opacity(0.2);
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
  const productsTotalTax = quote.quoteProducts.map((p: any) => {
    const base = (p.price * p.quantity) / (1 + p.tax / 100);
    const iva = p.price * p.quantity - base;
    return { base: base.toFixed(2), iva: iva.toFixed(2) };
  });

  const TotalBase = productsTotalTax.reduce((total, product) => +product.base + total, 0);
  const TotalTax = productsTotalTax.reduce((total, product) => +product.iva + total, 0);

  const table = {
    headers: [
      { label: "Producto", property: "producto", width: 150 },
      { label: "Descripción", property: "descripcion", width: 150 },
      { label: "Cantidad", property: "cantidad", width: 50, align: "right" },
      { label: "IVA", property: "iva", width: 30, align: "right" },
      { label: "Precio", property: "precio", width: 80, align: "right" },
      { label: "Total", property: "total", width: 80, align: "right" },
    ],
    datas: quote.quoteProducts.map((qp: any) => ({
      producto: qp.products.name,
      descripcion: qp.products.description,
      cantidad: qp.quantity,
      iva: `${qp.tax}%`,
      precio: `$${qp.price.toLocaleString()}`,
      total: `$${(qp.price * qp.quantity).toLocaleString()}`,
    })),
  };

  await (doc as any).table(table, {
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(11),
    prepareRow: () => doc.font("Helvetica").fontSize(10),
  });

  doc.moveDown(2);
  doc.font("Helvetica-Bold").fontSize(12);
  doc.text(`SUBTOTAL: $${TotalBase.toLocaleString()}`, { align: "right" });
  doc.moveDown(0.5);
  doc.text(`IVA: $${TotalTax.toLocaleString()}`, { align: "right" });
  doc.moveDown(1);
  doc.text(`TOTAL COTIZACIÓN: $${quote.total.toLocaleString()}`, { align: "right" });
  doc.moveDown(2);

  if (quote.notes) {
    doc.font("Helvetica").fontSize(12);
    doc.text(`Observaciones: ${quote.notes}`);
  }

  doc.moveDown(2);
  doc.text("Atte. REC-Soluciones S.A.S");
  doc.text("Contacto: 311 222 33 44");
  doc.text("Correo: recsoluciones@gmail.com");
  doc.text("Calle 2 #a - 23");
  doc.text(`Quien realizó: ${quote.createdBy}`);
  doc.moveDown(1);
  doc.text("A la espera de una favorable respuesta, agradecemos su interés.", {
    align: "center",
  }).fontSize(10);

  doc.end();
};
