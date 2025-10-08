import nodemailer from "nodemailer";

export function createTransport(host,port,user,pass) {
  return nodemailer.createTransport({
    host,
    port,
    secure:true,
    auth: {
        user,
        pass
    },

    tls:{
      rejectUnauthorized:false
    }
  });
}