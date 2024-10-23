import config from "config";
import nodemailer from "nodemailer";

export const getSmtpTransporter = () => {
    const smtp = config.get('smtp')
    console.log(smtp);
    return nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        auth: {
            user: smtp.credentials.login,
            pass: smtp.credentials.password
        }
    })
}