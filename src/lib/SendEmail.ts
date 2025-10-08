import { createTransport } from "../config/nodemailer";

type SendEmailQuoteProps = {
  id:number,
  client:string,
  email:string
}
export async function SendEmailQuote({ id, client,email }:SendEmailQuoteProps) {
  const transporter = createTransport(
    process.env.HOST_EMAIL,
    process.env.PORT_EMAIL,
    process.env.USER_EMAIL,
    process.env.PASS_EMAIL
  );
  // send email when creating a new appointment
  await transporter.sendMail({
    from: "portafolio@ordonezandres.com", // sender address
    to: `${email}`, // list of receivers
    subject: `COTIZACIÓN No. ${id}`, // Subject line
    text: `REC-Soluciones SAS - Nueva Cotización`, // plain text body
    html: `
      <p>Señor(a): ${client}, en atención a su solicitud ponemos a su disposición la siguiente cotización</p>
      <br/>
      <a 
        href='http://localhost:4000/api/quote/generate-pdf/${id}'
        download="quote.pdf"
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
    Descargar Cotización
    </a>
      `,
  });
}
