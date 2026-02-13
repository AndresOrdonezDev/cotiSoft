import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY);

type SendEmailQuoteProps = {
  id: number,
  client: string,
  emails: string[],
  pdfBuffer: Buffer,
  attachments?: Array<{buffer: Buffer, filename: string}> | null
}

type SendEmailTokenProps = {
  email: string
  token: string,
}

export async function SendEmailQuote({ id, client, emails, pdfBuffer, attachments: additionalAttachments }: SendEmailQuoteProps) {
  // Leer logo y convertir a base64 data URI (Resend no soporta cid)
  const logoPath = path.join(process.cwd(), 'src', 'public', 'rec-mail.png');
  const logoBase64 = fs.readFileSync(logoPath).toString('base64');
  const logoDataUri = `data:image/png;base64,${logoBase64}`;

  // Construir array de adjuntos para Resend
  const attachments: Array<{ filename: string; content: Buffer }> = [];

  // Agregar attachments adicionales primero si existen
  if (additionalAttachments && additionalAttachments.length > 0) {
    additionalAttachments.forEach(att => {
      attachments.push({
        filename: att.filename,
        content: att.buffer,
      });
    });
  }

  // Agregar el PDF de la cotización
  attachments.push({
    filename: `cotizacion_${id}.pdf`,
    content: pdfBuffer,
  });

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL as string,
    to: emails,
    subject: `COTIZACIÓN No. ${id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <img src="${logoDataUri}" alt="REC Ingeniería" style="max-width: 200px; margin-bottom: 20px; display: block;" />

        <p style="font-size: 20px; color: #0066cc; font-style: italic; font-weight: bold; margin: 20px 0 10px 0; text-align: left;">
          CAMILA ANDREA CHAMORRO GUERRERO
        </p>

        <p style="font-size: 14px; color: #000000; line-height: 1.6; margin: 0; text-align: left;">
          <span style="font-style: italic; text-decoration: underline;">Representante Legal</span><br/>
          <strong>INGENIERA ELECTRONICA</strong><br/>
          <strong>REC INGENIERIA SAS ZOMAC</strong><br/>
          <strong>Nit 901484899-9</strong><br/>
          <strong>Cel: 321 2396357</strong><br/>
          <strong>Mocoa - Putumayo</strong>
        </p>

        <br/>
        <p style="text-align: left;">Señor(a): ${client}, en atención a su solicitud ponemos a su disposición la siguiente cotización adjunta en este correo.</p>
        <br/>
        <p style="font-style: italic; color: #666666; text-align: left;">A la espera de una favorable respuesta, agradecemos su interés.</p>
      </div>
      `,
    attachments
  });
}

export async function SendEmailTokenUser({ email, token }: SendEmailTokenProps) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL as string,
    to: [email],
    subject: `Recuperación de contraseña`,
    html: `
      <p>Has solicitado la recuperación de contraseña para el correo ${email}</p>
      <p>Recuerda que el token es de un solo uso, si lo pierdes vuelve a generarlo</p>
      <br/>
      <a
        href='${process.env.FRONTEND_URL}/forgot-password/${email}/${token}'
        target="_blank"
        style="
          display: inline-block;
          background-color: #0d9488;
          color: #ffffff;
          text-decoration: none;
          border-radius: 6px;
          padding: 12px 24px;
          font-family: Arial, sans-serif;
          font-size: 14px;
          font-weight: bold;"
      >
      Cambiar Contraseña
      </a>
      `,
  });
}
