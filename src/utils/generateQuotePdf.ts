import { Response } from "express";
import PdfPrinter from "pdfmake";
import { TDocumentDefinitions, Content } from "pdfmake/interfaces";
import path from "path";
import fs from "fs";

// Tipos basados en tu estructura de datos
interface QuoteData {
  id?: number ;
  total: number;
  status: string;
  notes: string | null;
  createdAt?: string;
  createdBy: string;
  client: {
    fullname: string;
    idNumber: string;
    email: string;
    contact: string;
    companyName: string | null;
  };
  quoteProducts: Array<{
    price: number;
    quantity: number;
    tax: number;
    products: {
      name: string;
      description: string;
    };
  }>;
}

type GeneratePdfQuoteProps = {
  quote: QuoteData;
  res?: Response;
};

export const generateQuotePdf = async ({ quote, res }: GeneratePdfQuoteProps): Promise<Buffer | void> => {
  // Configurar fuentes estándar de PDF
  const fonts = {
    Helvetica: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Oblique",
      bolditalics: "Helvetica-BoldOblique",
    },
  };

  const printer = new PdfPrinter(fonts);

  // Manejar la fecha (si no existe, usar fecha actual)
  const quoteDate = quote.createdAt ? new Date(quote.createdAt) : new Date();

  // Convertir imagen a base64 (opcional)
  const logoPath = path.join(__dirname, "../public/logo-rec.png");
  let logoBase64 = "";
  
  if (fs.existsSync(logoPath)) {
    logoBase64 = `data:image/png;base64,${fs.readFileSync(logoPath).toString("base64")}`;
  }

  // Calcular totales
  const productsTotalTax = quote.quoteProducts.map((p) => {
    const base = (p.price * p.quantity) / (1 + p.tax / 100);
    const iva = p.price * p.quantity - base;
    return { base, iva };
  });

  const TotalBase = productsTotalTax.reduce((total, product) => product.base + total, 0);
  const TotalTax = productsTotalTax.reduce((total, product) => product.iva + total, 0);

  // Construir el contenido del PDF
  const content: Content[] = [
    // Fecha
    {
      columns: [
        { text: "", width: "*" },
        {
          text: `Fecha: ${quoteDate.toLocaleDateString("es-CO")}`,
          alignment: "right",
          fontSize: 10,
        },
      ],
      margin: [0, 0, 0, 10],
    },

    // Título
    {
      text: `COTIZACIÓN No. ${quote.id}`,
      fontSize: 18,
      bold: true,
      decoration: "underline",
      color: "#2c3e50",
      alignment: "center",
      margin: [0, 10, 0, 20],
    },

    // Información del cliente - Título
    {
      text: "INFORMACIÓN DEL CLIENTE",
      fontSize: 12,
      bold: true,
      color: "#34495e",
      margin: [0, 0, 0, 10],
    },
  ];

  // Información del cliente - Datos
  const clientInfoStack: Content[] = [
    { text: `Cliente: ${quote.client.fullname}`, margin: [0, 0, 0, 5] },
  ];

  if (quote.client.companyName) {
    clientInfoStack.push({
      text: `Razón Social: ${quote.client.companyName}`,
      margin: [0, 0, 0, 5],
    });
  }

  clientInfoStack.push({
    text: `Identificación: ${quote.client.idNumber}`,
    margin: [0, 0, 0, 5],
  });

  content.push({
    columns: [
      {
        width: "50%",
        stack: clientInfoStack,
      },
      {
        width: "50%",
        stack: [
          { text: `Correo: ${quote.client.email}`, margin: [0, 0, 0, 5] },
          { text: `Contacto: ${quote.client.contact}`, margin: [0, 0, 0, 5] },
        ],
      },
    ],
    margin: [0, 0, 0, 20],
  });

  // Tabla de productos - Título
  content.push({
    text: "DETALLE DE PRODUCTOS",
    fontSize: 12,
    bold: true,
    color: "#34495e",
    margin: [0, 0, 0, 10],
  });

  // Tabla de productos
  const tableBody: any[][] = [
    // Headers
    [
      { text: "Producto", style: "tableHeader" },
      { text: "Descripción", style: "tableHeader" },
      { text: "Cant.", style: "tableHeader", alignment: "center" },
      { text: "IVA", style: "tableHeader", alignment: "center" },
      { text: "Precio", style: "tableHeader", alignment: "right" },
      { text: "Total", style: "tableHeader", alignment: "right" },
    ],
  ];

  // Filas de productos
  quote.quoteProducts.forEach((qp) => {
    tableBody.push([
      { text: qp.products.name, fontSize: 9 },
      { text: qp.products.description || "-", fontSize: 9 },
      { text: qp.quantity.toString(), alignment: "center", fontSize: 9 },
      { text: `${qp.tax}%`, alignment: "center", fontSize: 9 },
      {
        text: `$${qp.price.toLocaleString("es-CO")}`,
        alignment: "right",
        fontSize: 9,
      },
      {
        text: `$${(qp.price * qp.quantity).toLocaleString("es-CO")}`,
        alignment: "right",
        fontSize: 9,
      },
    ]);
  });

  content.push({
    table: {
      headerRows: 1,
      widths: [120, "*", 50, 40, 60, 70],
      body: tableBody,
    },
    layout: {
      fillColor: (rowIndex: number) => {
        if (rowIndex === 0) return "#3498db";
        return rowIndex % 2 === 0 ? "#f2f2f2" : null;
      },
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => "#cccccc",
      vLineColor: () => "#cccccc",
    },
    margin: [0, 0, 0, 20],
  });

  // Totales
  content.push({
    columns: [
      { text: "", width: "*" },
      {
        width: 200,
        stack: [
          {
            columns: [
              { text: "SUBTOTAL:", bold: true, width: 100 },
              {
                text: `$${TotalBase.toLocaleString("es-CO", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`,
                alignment: "right",
                width: "*",
              },
            ],
            margin: [0, 0, 0, 5],
          },
          {
            columns: [
              { text: "IVA:", bold: true, width: 100 },
              {
                text: `$${TotalTax.toLocaleString("es-CO", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`,
                alignment: "right",
                width: "*",
              },
            ],
            margin: [0, 0, 0, 10],
          },
          {
            columns: [
              { text: "TOTAL:", bold: true, fontSize: 14, width: 100 },
              {
                text: `$${quote.total.toLocaleString("es-CO")}`,
                alignment: "right",
                bold: true,
                fontSize: 14,
                width: "*",
              },
            ],
            fillColor: "#e8f4f8",
            margin: [5, 5, 5, 5],
          },
        ],
      },
    ],
    margin: [0, 0, 0, 20],
  });

  // Observaciones (solo si existen)
  if (quote.notes) {
    content.push({
      text: [
        { text: "Observaciones: ", bold: true },
        { text: quote.notes },
      ],
      margin: [0, 0, 0, 20],
    });
  }

  // Línea divisoria
  content.push({
    canvas: [
      {
        type: "line",
        x1: 0,
        y1: 0,
        x2: 515,
        y2: 0,
        lineWidth: 1,
      },
    ],
    margin: [0, 20, 0, 10],
  });

  // Pie de página empresarial
  content.push({
    columns: [
      {
        width: "50%",
        stack: [
          { text: "REC-Soluciones S.A.S", bold: true, fontSize: 12 },
          { text: "Contacto: 311 222 33 44", fontSize: 9 },
          { text: "Correo: recsoluciones@gmail.com", fontSize: 9 },
          { text: "Calle 2 #a - 23", fontSize: 9 },
        ],
      },
      {
        width: "50%",
        stack: [
          {
            text: `Elaborado por: ${quote.createdBy}`,
            fontSize: 9,
            alignment: "right",
          },
        ],
      },
    ],
    margin: [0, 0, 0, 10],
  });

  content.push({
    text: "A la espera de una favorable respuesta, agradecemos su interés.",
    alignment: "center",
    italics: true,
    fontSize: 10,
    color: "#666666",
  });

  // Definir el documento PDF
  const docDefinition: TDocumentDefinitions = {
    pageSize: "LETTER",
    pageMargins: [40, 60, 40, 60],
    defaultStyle: {
      font: "Helvetica",
    },

    // Marca de agua con el logo (si existe)
    background: logoBase64
      ? {
          image: logoBase64,
          width: 300,
          opacity: 0.2,
          absolutePosition: { x: 150, y: 200 },
        }
      : undefined,

    content: content,

    // Estilos
    styles: {
      tableHeader: {
        bold: true,
        fontSize: 10,
        color: "white",
        fillColor: "#3498db",
      },
    },
  };

  // Generar el PDF
  const pdfDoc = printer.createPdfKitDocument(docDefinition);

  // Si se proporciona res, enviar como respuesta HTTP
  if (res) {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=cotizacion_${quote.id}.pdf`
    );

    pdfDoc.pipe(res);
    pdfDoc.end();
    return;
  }

  // Si no se proporciona res, retornar el buffer del PDF
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];

    pdfDoc.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    pdfDoc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });

    pdfDoc.on('error', (err: Error) => {
      reject(err);
    });

    pdfDoc.end();
  });
};