import {PrismaClient} from "@prisma/client";
import config from "config";
const db = config.get("db");

export const getOrmClient = () => new PrismaClient({
    datasourceUrl: `postgresql://${db.user}:${db.password}@${db.address}:${db.port}/${db.dbname}?schema=public`
})