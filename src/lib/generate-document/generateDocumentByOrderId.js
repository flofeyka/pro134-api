import fs from "fs";
import {createReport} from "docx-templates";
import {getOrmClient} from "../getOrmClient/getOrmClient.js";
import {numToWord} from "../num-to-word/num-to-word.js";
import {ucFirst} from "../ucfirst/ucfirst.js";
import {logger} from "../logger/logger.js";


export const generateDocumentByOrderId = async (orderId) =>  {
    const prisma = getOrmClient();

    const order = await prisma.order.findFirst({
        where: {
            id: orderId
        },
        include: {
            products: {
                include: {
                    product: true,
                }
            }
        }
    })

    const templateProductsData =  order.products.map((p, index) => {
        return {
            count: p.count,
            price: +p.product.price,
            sum: (p.count * +p.product.price),
            model: p.product.model,
            index: index + 1
        }
    })

    const parsedDate = Date.parse(order.created_at)
    const date = new Date(parsedDate)

    //дата, до которой необходимо оплатить
    const payUntilDate = new Date(parsedDate)
    payUntilDate.setDate(payUntilDate.getDate() + 7)

    //дата заказа в виде строки
    const dateString = date.toLocaleDateString('ru-RU', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })

    ///TODO: составить адресные строки для физ и юр лица
    let addressString = ''

    switch (order.type) {
        case 'JURIDICAL':
            addressString =
            `ООО "${order.organization}" ИНН ${order.iin}, КПП ${order.kpp}, ${order.region}, ${order.city}, ${order.address} Телефон: ${order.phone}`
            break;

        case 'PHYSICAL':
            addressString =
            `${order.surname} ${order.name} ${order.patronymic}, ${order.region}, ${order.city}, ${order.address}, кв. ${order.apartment} Телефон: ${order.phone}`
            break;
        default:
            throw new Error('неверно указан тип заказа')
    }

    const formatPrice = (num) => num.toLocaleString().replaceAll(',', ' ') + ',00'
    const orderSum = templateProductsData.reduce((sum, p) => sum + +p.sum, 0)

    const template = await new Promise((resolve, reject) => {
        fs.readFile('template.docx', (err, data) => {
            if (err) {
                logger.error(err)
                reject(err)
            }
            resolve(data)
        })
    })

    return await createReport({
        template,
        data: {
            order_id: order.id,
            date: dateString,
            products: structuredClone(templateProductsData).map(p => {
                p.sum = formatPrice(p.sum)
                p.price = formatPrice(p.price)
                return p
            }),
            order_sum: formatPrice(orderSum),
            order_sum_word: ucFirst(numToWord(orderSum)),
            total_count: templateProductsData.length,
            address_string: addressString,
            pay_until: payUntilDate.toLocaleDateString('ru-RU')
        }
    });
}