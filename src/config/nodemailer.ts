import nodemailer from 'nodemailer';

export function createTransport(host: string, port: number, user: string, pass: string) {
    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true para puerto 465, false para otros
        auth: {
            user,
            pass
        }
    });
}