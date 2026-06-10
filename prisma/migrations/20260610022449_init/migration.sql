-- CreateEnum
CREATE TYPE "Category" AS ENUM ('economy', 'business', 'politics');

-- CreateEnum
CREATE TYPE "NotifyStatus" AS ENUM ('sent', 'failed');

-- CreateTable
CREATE TABLE "news_articles" (
    "id" TEXT NOT NULL,
    "source_name" VARCHAR(100) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "published_at" TIMESTAMP(3) NOT NULL,
    "category" "Category" NOT NULL,
    "relevance_score" DOUBLE PRECISION,
    "collected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_summaries" (
    "id" TEXT NOT NULL,
    "summary_date" DATE NOT NULL,
    "content" TEXT NOT NULL,
    "articles_ids" TEXT[],
    "tokens_used" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" TEXT NOT NULL,
    "summary_id" TEXT NOT NULL,
    "recipient" VARCHAR(50) NOT NULL,
    "status" "NotifyStatus" NOT NULL,
    "provider_response" TEXT,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "news_articles_url_key" ON "news_articles"("url");

-- CreateIndex
CREATE UNIQUE INDEX "daily_summaries_summary_date_key" ON "daily_summaries"("summary_date");

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_summary_id_fkey" FOREIGN KEY ("summary_id") REFERENCES "daily_summaries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
