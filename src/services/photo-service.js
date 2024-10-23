import path from "path";
import fs from "fs";
import { logger } from "../lib/logger/logger.js ";
export default new class photoService {
  async deletePhotos(photos = []) {
    photos.forEach((photo) => {
      const absolutePath = path.resolve("static", "public", photo.source);
      fs.rm(absolutePath, () => {
        logger.info(
          photo,
          `Успешно удалено фото: ${photo.id}. Расположение: ${photo.source}`
        );
      });
    });
  }

  async savePhotos(photos = []) {
    return Promise.all(
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

        return pathString;
      })
    );
  }
}
