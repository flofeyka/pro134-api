import HttpError from "../helpers/httpError.js";
import path from "path";
import fs from "fs";
import { logger } from "../lib/logger/logger.js ";

export default new (class pdfService {
  async savePdf(pdf = []) {
    try {
      return await Promise.all(
        pdf?.map(async (pdf) => {
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

          return pathString;
        })
      );
    } catch (e) {
      throw HttpError(400, "Не удалось сохранить PDF-файл");
    }
  }

  async deletePdf(Pdf = []) {
    return Pdf.map((pdf) => {
      const absolutePath = path.resolve("static", "public", pdf.source);
      fs.rm(absolutePath, () => {
        logger.info(
          pdf,
          `Успешно удален PDF-файл: ${pdf.id}. Расположение: ${pdf.source}`
        );
      });
    });
  }
})();
