import { createTransport } from "../config/nodemailer";

type SendEmailQuoteProps = {
  id:number,
  client:string,
  emails:string[],
  pdfBuffer: Buffer,
  attachmentBuffer?: Buffer | null,
  attachmentFilename?: string | null
}
type SendEmailTokenProps = {
  email:string
  token:string,
}
export async function SendEmailQuote({ id, client, emails, pdfBuffer, attachmentBuffer, attachmentFilename }:SendEmailQuoteProps) {
  const transporter = createTransport(
    process.env.HOST_EMAIL,
    process.env.PORT_EMAIL,
    process.env.USER_EMAIL,
    process.env.PASS_EMAIL
  );

  // Construir array de adjuntos
  const attachments: any[] = [];

  // Agregar el attachment primero si existe (debe ir de primero)
  if (attachmentBuffer && attachmentFilename) {
    attachments.push({
      filename: attachmentFilename,
      content: attachmentBuffer,
      contentType: 'application/pdf'
    });
  }

  // Agregar el PDF de la cotización
  attachments.push({
    filename: `cotizacion_${id}.pdf`,
    content: pdfBuffer,
    contentType: 'application/pdf'
  });

  // send email
  await transporter.sendMail({
    from: "portafolio@ordonezandres.com", // sender address
    to: `${emails}`, // list of receivers
    subject: `COTIZACIÓN No. ${id}`, // Subject line
    text: `REC- INGENIERÍA - Nueva Cotización`, // plain text body
    html: `
      <p>Señor(a): ${client}, en atención a su solicitud ponemos a su disposición la siguiente cotización adjunta en este correo.</p>
      <br/>
      <p style="font-family: Arial, sans-serif; font-size: 14px; color: #34495e;">
        <strong>REC-Soluciones S.A.S</strong><br/>
        Contacto: 311 222 33 44<br/>
        Correo: recsoluciones@gmail.com<br/>
        Calle 2 #a - 23
      </p>
      <br/>
      <p style="font-style: italic; color: #666666;">A la espera de una favorable respuesta, agradecemos su interés.</p>
      `,
    attachments
  });
}
export async function SendEmailTokenUser({ email,token }:SendEmailTokenProps) {
  const transporter = createTransport(
    process.env.HOST_EMAIL,
    process.env.PORT_EMAIL,
    process.env.USER_EMAIL,
    process.env.PASS_EMAIL
  );
  
  // send email to recovery password
  await transporter.sendMail({
    from: "portafolio@ordonezandres.com", // sender address
    to: `${email}`, // list of receivers
    subject: `Recuperación de contraseña`, // Subject line
    text: `Recuperar Contraseña`, // plain text body
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
