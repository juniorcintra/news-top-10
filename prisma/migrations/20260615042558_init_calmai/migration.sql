/*
  Warnings:

  - You are about to drop the `daily_summaries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `news_articles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notification_logs` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "HealthPillar" AS ENUM ('humor', 'nutricao', 'fitness', 'mental', 'sono');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('sent', 'failed');

-- DropForeignKey
ALTER TABLE "notification_logs" DROP CONSTRAINT "notification_logs_summary_id_fkey";

-- DropTable
DROP TABLE "daily_summaries";

-- DropTable
DROP TABLE "news_articles";

-- DropTable
DROP TABLE "notification_logs";

-- DropEnum
DROP TYPE "Category";

-- DropEnum
DROP TYPE "NotifyStatus";

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "cnpj" VARCHAR(18) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ativo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "company_id" TEXT,
    "whatsapp_phone" VARCHAR(20) NOT NULL,
    "anonymous_token" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255),
    "department" VARCHAR(100),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "check_ins" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "pillar" "HealthPillar" NOT NULL,
    "button_response" VARCHAR(100),
    "free_text" TEXT,
    "score_converted" INTEGER,
    "is_critical" BOOLEAN NOT NULL DEFAULT false,
    "ai_response" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aggregated_metrics" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "department" VARCHAR(100),
    "avg_wellbeing_score" DECIMAL(5,2),
    "burnout_alert" BOOLEAN NOT NULL DEFAULT false,
    "calculated_at" DATE NOT NULL,

    CONSTRAINT "aggregated_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "direction" VARCHAR(10) NOT NULL,
    "content" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL,
    "provider_response" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_cnpj_key" ON "companies"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "users_whatsapp_phone_key" ON "users"("whatsapp_phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_anonymous_token_key" ON "users"("anonymous_token");

-- CreateIndex
CREATE UNIQUE INDEX "check_ins_user_id_date_key" ON "check_ins"("user_id", "date");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aggregated_metrics" ADD CONSTRAINT "aggregated_metrics_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_logs" ADD CONSTRAINT "message_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
