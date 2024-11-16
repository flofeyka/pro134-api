import { getSmtpTransporter } from "../lib/get-smtp-transporter/getSmtpTransporter.js";
import { logger } from "../lib/logger/logger.js";
import config from "config";

const smtp = config.get('smtp')
const transporter = getSmtpTransporter()

export default new class feedbackService {
  async feedback(email, question) {
    const mailOptions = {
      from: smtp.sender,
      to: smtp.sender,
      subject: "Задан вопрос",
      html: `
                    <h2>Был задан вопрос пользователем</h2>
                    <div><b>Email:</b> ${email}</div>
                    <div><b>Вопрос:</b> ${question}</div>
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
