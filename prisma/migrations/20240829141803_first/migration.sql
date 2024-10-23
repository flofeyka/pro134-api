-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('PHYSICAL', 'JURIDICAL');

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "articul" INTEGER NOT NULL,
    "model" TEXT NOT NULL,
    "capacity" TEXT NOT NULL,
    "rated_power" INTEGER NOT NULL,
    "peak_power" INTEGER NOT NULL,
    "battery_type" TEXT NOT NULL,
    "adapter" TEXT NOT NULL,
    "car_charge_input" TEXT NOT NULL,
    "sun_charge" TEXT NOT NULL,
    "work_temp" TEXT NOT NULL,
    "ac_output" TEXT NOT NULL,
    "usb_output" TEXT NOT NULL,
    "dc_output" TEXT NOT NULL,
    "type_c_output" TEXT NOT NULL,
    "output_signal" TEXT NOT NULL,
    "gross_weight" TEXT NOT NULL,
    "rated_frequency" TEXT NOT NULL,
    "anderson_output" TEXT NOT NULL,
    "battery_rated_frequency" TEXT NOT NULL,
    "construction_type" TEXT NOT NULL,
    "noise_level" TEXT NOT NULL,
    "volume_of_fuel_tank_during_operation" TEXT NOT NULL,
    "starting_system" TEXT NOT NULL,
    "auto_start" TEXT NOT NULL,
    "alternator" TEXT NOT NULL,
    "alternator_winding" TEXT NOT NULL,
    "engine_model" TEXT NOT NULL,
    "engine_type" TEXT NOT NULL,
    "engine_volume" INTEGER NOT NULL,
    "fuel_type" TEXT NOT NULL,
    "recommended_oil" TEXT NOT NULL,
    "lubrication_volume" TEXT NOT NULL,
    "overcurrent_protection" TEXT NOT NULL,
    "overvoltage_protection" TEXT NOT NULL,
    "overheating_protection" TEXT NOT NULL,
    "recharge_protection" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "length" INTEGER NOT NULL,
    "stopped" BOOLEAN NOT NULL DEFAULT false,
    "price" DECIMAL(65, 30) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductPhoto" (
    "id" SERIAL NOT NULL,
    "source" TEXT NOT NULL,
    "product_id" INTEGER NOT NULL,
    CONSTRAINT "ProductPhoto_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductPdf" (
    "id" SERIAL NOT NULL,
    "source" TEXT NOT NULL,
    "product_id" INTEGER NOT NULL,
    CONSTRAINT "ProductPdf_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "type" "OrderType" NOT NULL,
    "surname" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "apartment" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "iin" TEXT NOT NULL,
    "kpp" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderProduct" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "order_id" INTEGER NOT NULL,
    "count" INTEGER NOT NULL,
    CONSTRAINT "OrderProduct_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE
    "ProductPhoto"
ADD
    CONSTRAINT "ProductPhoto_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE
    "ProductPdf"
ADD 
    CONSTRAINT "ProductPdf_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    "OrderProduct"
ADD
    CONSTRAINT "OrderProduct_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    "OrderProduct"
ADD
    CONSTRAINT "OrderProduct_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;