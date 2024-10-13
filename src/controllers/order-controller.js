import {generateDocumentByOrderId} from "../lib/generate-document/generateDocumentByOrderId.js";
import {getSmtpTransporter} from "../lib/get-smtp-transporter/getSmtpTransporter.js";
import config from "config";
import {logger} from "../lib/logger/logger.js";
import {getOrmClient} from "../lib/getOrmClient/getOrmClient.js";

const prisma = getOrmClient()
const smtp = config.get('smtp')

export const getAllOrders = async (req, res) => {
    const orders = await prisma.order.findMany({
        include: {
            products: {
                include: {
                    product: {
                        include: {
                            photos: true
                        }
                    }
                }
            }
        }
    })
    return res.json(orders)
}

export const makeOrder = async (req, res) => {
    const body = req.body

    if (!body.products || body.products.length === 0) {
        return res.status(422).json({
            message: 'Нет продуктов в заказе',
        })
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
    }

    logger.info(body.order_type)
    logger.info(typeof body.order_type)
    logger.info(body.order_type === "juridical")

    switch (body.order_type) {
        case "juridical":
            orderData.organization = body.organization
            orderData.iin = body.iin
            orderData.kpp = body.kpp
            break
        case "physical":
            orderData.surname = body.surname
            orderData.name = body.name
            orderData.apartment = body.apartment
            orderData.patronymic = body.patronymic
            break

        default:
            return res.status(422).json({
                'message': 'неверно передан тип заказа'
            })
    }

    orderData.phone = body.phone
    orderData.region = body.region
    orderData.city = body.city
    orderData.address = body.address
    orderData.email = body.email
    orderData.type = body.order_type.toUpperCase()

    const order = await prisma.order.create({
        data: orderData
    })

    body.products.forEach(p => {
        prisma.orderProduct.create({
            data: {
                product_id: p.product_id,
                count: p.count,
                order_id: order.id
            }
        }).then()
    })

    //сгенерированный файл
    const buffer = await generateDocumentByOrderId(order.id)

    //объект отправителя писем
    const transporter = getSmtpTransporter()

    const mailOptions = {
        from: smtp.sender,
        to: orderData.email,
        subject: 'Счет на оплату',
        attachments: [
            {
                filename: 'счет_на_оплату.docx',
                content: Buffer.from(buffer, 'base64'),
            }
        ]
    }

    //отправка клиенту
    try {
        await transporter.sendMail(mailOptions, err => {
            if (err) {
                logger.error(err, `Ошибка при отправлении письма на ${mailOptions.to}`)
                throw err
            }
        })

        //отправка себе
        mailOptions.to = smtp.sender
        await transporter.sendMail(mailOptions, err => {
            if (err) {
                logger.error(err, `Ошибка при отправлении письма на ${mailOptions.to}`)
                throw err
            }
        })
    } catch (e) {
        return res.status(500).json({
            message: 'возникла ошибка при создании заказа'
        })
    }

    logger.info(order, `Заказ №${order.id} создан`)

    res.status(201).json({
        message: 'Заказ создан',
    })
}