import HttpError from "../helpers/HttpError.js";
import { getOrmClient } from "../lib/getOrmClient/getOrmClient.js";
import pdfService from "./pdf-service.js";
import photoService  from "./photo-service.js";

const prisma = getOrmClient();

export default new class productService {
  async addProduct(photos = [], pdf = [], productDto) {
    const product = await prisma.product.create({
      data: productDto,
    });

    //добавление новых фото пролукта
    this.saveProductPhotos(photos, product.id);
    this.saveProductPdf(pdf, product.id);

    return {
      success: true,
      message: "Продукт был успешно создан!",
      product,
    };
  }

  async deleteProduct(id) {
    const product = await prisma.product.findFirst({
        where: {
          id: +id,
        },
        include: {
          photos: true,
        },
      });
    
      await this.deleteProductPhotos(product.photos, +id);
    
      await prisma.product.deleteMany({
        where: {
          id: +id,
        },
      });
    return {
        success: true,
        message: "Продукт был успешно удален!",
    }
  }

  async stopProduct({id, value}) {  
    
    await prisma.product.update({
      where: {
        id: +id,
      },
      data: {
        stopped: !value,
      },
    });

    return {
        success: true,
        message: "Продукт был успешно остановлен!",
    }
  }

  async getAllProducts() {
    const products = await prisma.product.findMany({
      include: {
        photos: true,
        pdf: true,
      },
      where: {
        stopped: false,
      },
    });

    return products;
  }

  async editProduct(id, productDto, pdf, photos = []) {
    if (isNaN(+id)) {
        return productNotFoundResponse(res);
      }
    
      if (!productDto) {
        throw HttpError(400, "Не были переданы данные");
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
        throw HttpError(404, "Продукт не найден");
      }
    
      //удаление фото продукта
      await this.deleteProductPhotos(product.photos, +id);
      await this.deleteProductPdf(product.pdf, product.id);
      //добавление новых фото продукта
      await this.saveProductPhotos(photos, product.id);
      await this.saveProductPdf(pdf, product.id);
      //обловление данных продукта в бд
      await prisma.product.update({
        data: productDto,
        where: {
          id: +id,
        },
      });

      return {
        success: true,
        message: "Продукт был успешно изменен!",
      }
  }

  async getAllProductsWithStopped() {
    const products = await prisma.product.findMany({
      include: {
        photos: true,
      },
    });

    return products;
  }

  async getOneProductWithStopped(id) {
    if (isNaN(+id)) {
      throw HttpError(404, "Неверный id продукта");
    }

    const result = await prisma.product.findFirst({
      where: {
        id: +id,
      },
      include: {
        photos: true,
      },
    });

    if (!result) {
      throw HttpError(404, "Продукт не найден");
    }

    return result;
  }

  async getProductById(id) {
    const result = await prisma.product.findFirst({
      where: {
        id: +id,
      },
      include: {
        photos: true,
        pdf: true,
      },
    });

    if (!result || result.stopped) {
      throw HttpError(404, "Продукт не найден");
    }

    return result;
  }

  async getPopularProducts() {
    const result = await prisma.product.findMany({
      take: 10,
      orderBy: {
        order_product: {
          _count: "asc",
        },
      },
      include: {
        photos: true,
        pdf: true,
      },
      where: {
        stopped: false,
      },
    });
    return result;
  }

  async saveProductPhotos(photos, product_id) {
    const pathStrings = await photoService.savePhotos(photos);
    pathStrings.forEach(async (pathString) => {
      await prisma.productPhoto
        .create({
          data: {
            product_id: product_id,
            source: pathString,
          },
        })
        .then();
    });
  }

  async deleteProductPhotos(photos, product_id) {
    await photoService.deletePhotos(photos);
    await prisma.productPhoto.deleteMany({
      where: {
        product_id: product_id,
      },
    });
  }

  async saveProductPdf(photos, product_id) {
    const pathStrings = await pdfService.savePdf(photos);
    pathStrings.forEach(async (pathString) => {
      await prisma.productPdf.create({
        data: {
          product_id: product_id,
          source: pathString,
        },
      });
    });
  }

  async deleteProductPdf(pdf, product_id) {
    await pdfService.deletePdf(pdf)
    await prisma.productPdf.deleteMany({
      where: {
        product_id: product_id,
      },
    });
  }
}
