import config from "config";
import {getSmtpTransporter} from "../lib/get-smtp-transporter/getSmtpTransporter.js";
import {logger} from "../lib/logger/logger.js";

const smtp = config.get('smtp')

const transporter = getSmtpTransporter()

export const feedback = async (req, res) => {
    const mailOptions = {
        from: smtp.sender,
        to: smtp.sender,
        subject: 'Заказ звонка',
        html: `
            <h2>Заказ звонка</h2>
            <div><b>Имя:</b> ${req.body.name}</div>
            <div><b>Фамилия:</b> ${req.body.surname}</div>
            <div><b>Email:</b> ${req.body.email}</div>
            <div><b>Телефон:</b> <a href="tel:${req.body.phone}">${req.body.phone}</a></div>
        `
    }

    await transporter.sendMail(mailOptions, err => {
        if (err) {
            logger.error(err, `Ошибка при отправлении письма на ${mailOptions.to}`)
            return res.status(500).json({
                message: 'Произошла ошибка при заказе звонка'
            })
        }
    })


    res.status(200).json({
        message: 'Заказ на звонок осуществлен',
    })
}