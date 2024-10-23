import { generateDocumentByOrderId } from "../lib/generate-document/generateDocumentByOrderId.js";
import { getSmtpTransporter } from "../lib/get-smtp-transporter/getSmtpTransporter.js";
import { getOrmClient } from "../lib/getOrmClient/getOrmClient.js";
import config from "config";
import { logger } from "../lib/logger/logger.js";

const prisma = getOrmClient();
const smtp = config.get("smtp");

export default new (class orderService {
  async getAllOrders() {
    const orders = await prisma.order.findMany({
      include: {
        products: {
          include: {
            product: {
              include: {
                photos: true,
              },
            },
          },
        },
      },
    });

    return orders;
  }

  async makeOrder({
    products,
    order_type,
    organization,
    iin,
    kpp,
    surname,
    name,
    apartment,
    patronymic,
    phone,
    region,
    city,
    address,
    email,
  }) {
    if (!products || products.length === 0) {
      return res.status(422).json({
        message: "Нет продуктов в заказе",
      });
    }

    ///TODO: реализовать создание ордера в зависимости от типа ордера
    const orderData = {
      organization: null,
      iin: null,
      kpp: null,
      surname: null,
      name: null,
      patronymic: null,
      apartment: null,
      phone: null,
      region: null,
      city: null,
      address: null,
      email: null,
      type: null,
    };

    logger.info(order_type);
    logger.info(typeof order_type);
    logger.info(order_type === "juridical");

    switch (order_type) {
      case "juridical":
        orderData.organization = organization;
        orderData.iin = iin;
        orderData.kpp = kpp;
        break;
      case "physical":
        orderData.surname = surname;
        orderData.name = name;
        orderData.apartment = apartment;
        orderData.patronymic = patronymic;
        break;

      default:
        return res.status(422).json({
          message: "неверно передан тип заказа",
        });
    }

    orderData.phone = phone;
    orderData.region = region;
    orderData.city = city;
    orderData.address = address;
    orderData.email = email;
    orderData.type = order_type.toUpperCase();

    const order = await prisma.order.create({
      data: orderData,
    });

    products.forEach((p) => {
      prisma.orderProduct
        .create({
          data: {
            product_id: p.product_id,
            count: p.count,
            order_id: order.id,
          },
        })
        .then();
    });

    //сгенерированный файл
    const buffer = await generateDocumentByOrderId(order.id);

    //объект отправителя писем
    const transporter = getSmtpTransporter();

    const mailOptions = {
      from: smtp.sender,
      to: orderData.email,
      subject: "Счет на оплату",
      attachments: [
        {
          filename: "счет_на_оплату.docx",
          content: Buffer.from(buffer, "base64"),
        },
      ],
    };

    //отправка клиенту
    try {
      await transporter.sendMail(mailOptions, (err) => {
        if (err) {
          logger.error(
            err,
            `Ошибка при отправлении письма на ${mailOptions.to}`
          );
          console.log(err);
        }
      });

      //отправка себе
      mailOptions.to = smtp.sender;
      await transporter.sendMail(mailOptions, (err) => {
        if (err) {
          logger.error(
            err,
            `Ошибка при отправлении письма на ${mailOptions.to}`
          );
          console.log(err);
        }
      });
    } catch (e) {
      console.log(e);
      return {
        success: false,
        message: "Возникла ошибка при создании заказа",
      };
    }

    logger.info(order, `Заказ №${order.id} создан`);

    return {
      success: true,
      message: "Заказ был успешно создан",
    };
  }
})();
