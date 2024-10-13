import fs from "fs";
import path from "node:path";
import { getOrmClient } from "../lib/getOrmClient/getOrmClient.js";
import { logger } from "../lib/logger/logger.js";

const prisma = getOrmClient();

export const getAllProducts = async (req, res) => {
  const products = await prisma.product.findMany({
    include: {
      photos: true,
    },
    where: {
      stopped: false,
    },
  });
  res.json(products);
};

export const getAllProductsWithStopped = async (req, res) => {
  const products = await prisma.product.findMany({
    include: {
      photos: true,
    },
  });
  res.json(products);
};

export const getOneProductWithStopped = async (req, res) => {
  const id = req.params.id;

  if (isNaN(+id)) {
    return productNotFoundResponse(res);
  }

  const result = await prisma.product.findFirst({
    where: {
      id: +id,
    },
    include: {
      photos: true,
    },
  });
  res.json(result);
};

export const getOneProduct = async (req, res) => {
  const id = req.params.id;

  if (isNaN(+id)) {
    return productNotFoundResponse(res);
  }

  const result = await prisma.product.findFirst({
    where: {
      id: +id,
    },
    include: {
      photos: true,
    },
  });

  if (result === null || result.stopped) {
    return productNotFoundResponse(res);
  }

  res.json(result);
};

export const getPopularProducts = async (req, res) => {
  const result = await prisma.product.findMany({
    take: 10,
    orderBy: {
      order_product: {
        _count: "asc",
      },
    },
    include: {
      photos: true,
    },
    where: {
      stopped: false,
    },
  });

  res.json(result);
};

export const addProduct = async (req, res) => {
  const result = await prisma.product.create({
    data: getProductDataFromRequestBody(req.body),
  });

  //добавление новых фото пролукта
  console.log(req.files);
  saveProductPhotos(req.files.photos, result.id);
  savePdf(req.files.pdf, result.id);

  res.status(201).json({
    message: "Successfully added product",
  });
};

export const deleteProduct = async (req, res) => {
  const id = req.params.id;

  const product = await prisma.product.findFirst({
    where: {
      id: +id,
    },
    include: {
      photos: true,
    },
  });

  await deleteProductPhotos(product.photos, +id);

  await prisma.product.deleteMany({
    where: {
      id: +id,
    },
  });

  return res.sendStatus(204);
};

export const stopProduct = async (req, res) => {
  const id = req.params.id;
  const value = req.body.value;

  await prisma.product.update({
    where: {
      id: +id,
    },
    data: {
      stopped: value === "true",
    },
  });

  res.json({
    message: "Продукт остановлен",
  });
};

export const editProduct = async (req, res) => {
  const id = req.params.id;

  if (isNaN(+id)) {
    return productNotFoundResponse(res);
  }

  if (!req.body) {
    return res.status(422).json({
      message: "Не переданы данные",
    });
  }

  const product = await prisma.product.findFirst({
    where: {
      id: +id,
    },
    include: {
      photos: true,
      pdf: true,
    },
  });

  if (!product) {
    return productNotFoundResponse(res);
  }

  //удаление фото продукта
  await deleteProductPhotos(product.photos, +id);
  await deletePdf(product.id, product.pdf);
  //добавление новых фото продукта
  await saveProductPhotos(req.files.photos, product.id);
  await savePdf(req.files.pdf, product.id);
  //обловление данных продукта в бд
  await prisma.product.update({
    data: getProductDataFromRequestBody(req.body),
    where: {
      id: +id,
    },
  });

  res.status(200).json({
    message: "Продукт изменен",
  });
};

//сохранение изображений продукта на диске и в бд
const saveProductPhotos = (photos, product_id) => {
  Promise.all(
    photos?.map(async (i) => {
      //генерация случайного названия файла
      const randomNumber = Math.trunc(Math.random() * 10 ** 8);
      const filename =
        Date.now() + "-" + randomNumber + path.extname(i.originalname);

      //абсолютный путь для сохранения файла в дисковом пространстве
      const absolutePathString = path.resolve(
        "static",
        "public",
        "product",
        filename
      );
      //относительный путь для сохранения в бд
      const pathString = `product/${filename}`;
      fs.writeFile(absolutePathString, i.buffer, (err) => {
        if (err) {
          console.error(err);
        }
      });

      await prisma.productPhoto
        .create({
          data: {
            product_id: product_id,
            source: pathString,
          },
        })
        .then();
    })
  );
};

const savePdf = async (pdfProduct, product_id) => {
  console.log(pdfProduct);
  await Promise.all(
    pdfProduct?.map(async (pdf) => {
      const randomNumber = Math.trunc(Math.random() * 10 ** 8);
      const filename =
        Date.now() + "-" + randomNumber + path.extname(pdf.originalname);
      const absolutePath = path.resolve(
        "static",
        "public",
        "product",
        filename
      );
      fs.writeFile(absolutePath, pdf.buffer, (err) => {
        if (err) {
          console.error(err);
        }
      });

      const pathString = `product/${filename}`;

      await prisma.productPdf.create({
        data: {
          product_id: product_id,
          source: pathString,
        },
      });
    })
  );
};

const deletePdf = async (product_id, productPdf) => {
  productPdf.forEach((pdf) => {
    const absolutePath = path.resolve("static", "public", pdf.source);
    fs.rm(absolutePath, () => {
      logger.info(
        pdf,
        `Успешно удален PDF-файл: ${pdf.id}. Расположение: ${pdf.source}`
      );
    });
  });
  await prisma.productPdf.deleteMany({
    where: {
      product_id: product_id,
    },
  });
};

//удаление фото продукта на диске и в бд
const deleteProductPhotos = async (photos, product_id) => {
  photos.forEach((photo) => {
    const absolutePath = path.resolve("static", "public", photo.source);
    fs.rm(absolutePath, () => {
      logger.info(
        photo,
        `Успешно удалено фото: ${photo.id}. Расположение: ${photo.source}`
      );
    });
  });

  await prisma.productPhoto.deleteMany({
    where: {
      product_id: product_id,
    },
  });
};

//response "продукт не найден"
const productNotFoundResponse = (res) => {
  return res.status(404).json({
    message: "Продукт не найден",
  });
};

//получение данных пролукта из запроса
const getProductDataFromRequestBody = (body) => {
  const size = body["size"].split("x");
  const peak_power = +body["peak_power"].split(" ")[0];
  const rated_power = +body["rated_power"].split(" ")[0];
  const engine_volume = +body["engine_volume"].split(" ")[0];

  return {
    articul: +body["articul"],
    capacity: body["capacity"],
    ac_output: body["ac_output"],
    adapter: body["adapter"],
    battery_type: body["battery_type"],
    dc_output: body["dc_output"],
    model: body["model"],
    rated_frequency: body["rated_frequency"],
    anderson_output: body["anderson_output"],
    battery_rated_frequency: body["battery_rated_frequency"],
    construction_type: body["construction_type"],
    noise_level: body["noise_level"],
    volume_of_fuel_tank_during_operation:
      body["volume_of_fuel_tank_during_operation"],
    starting_system: body["starting_system"],
    auto_start: body["auto_start"],
    alternator: body["alternator"],
    alternator_winding: body["alternator_winding"],
    engine_model: body["engine_model"],
    engine_type: body["engine_type"],
    engine_volume: +engine_volume,
    fuel_type: body["fuel_type"],
    recommended_oil: body["recommended_oil"],
    lubrication_volume: body["lubrication_volume"],
    overcurrent_protection: body["overcurrent_protection"],
    overvoltage_protection: body["overvoltage_protection"],
    overheating_protection: body["overheating_protection"],
    recharge_protecting: body["recharge_protecting"],
    height: +size[0],
    length: +size[1],
    width: +size[2],
    output: body["output"],
    gross_weight: body["gross_weight"],
    output_signal: body["output_signal"],
    peak_power: peak_power,
    rated_power: rated_power,
    sun_charge: body["sun_charge"],
    work_temp: body["work_temp"],
    car_charge_input: body["car_charge_input"],
    type_c_output: body["type_c_output"],
    usb_output: body["usb_output"],
    price: +body["price"],
    count: +body["count"],
  };
};
