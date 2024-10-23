import { getSmtpTransporter } from "../lib/get-smtp-transporter/getSmtpTransporter.js";
import { logger } from "../lib/logger/logger.js";
import config from "config";

const smtp = config.get('smtp')
const transporter = getSmtpTransporter()

export default new class feedbackService {
  async feedback(name, surname, email, phone) {
    const mailOptions = {
      from: smtp.sender,
      to: smtp.sender,
      subject: "Заказ звонка",
      html: `
                    <h2>Заказ звонка</h2>
                    <div><b>Имя:</b> ${name}</div>
                    <div><b>Фамилия:</b> ${surname}</div>
                    <div><b>Email:</b> ${email}</div>
                    <div><b>Телефон:</b> <a href="tel:${phone}">${phone}</a></div>
                `,
    };

    await transporter.sendMail(mailOptions, (err) => {
      if (err) {
        logger.error(err, `Ошибка при отправлении письма на ${mailOptions.to}`);
        return {
          success: false,
          message: "Произошла ошибка при заказе звонка",
        };
      }
    });

    return {
      success: true,
      message: "Заказ звонка был успешно оформлен!",
    };
  }
}
