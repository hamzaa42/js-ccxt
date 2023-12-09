-- CreateTable
CREATE TABLE "tickers" (
    "ticker_name" TEXT NOT NULL,
    "circ_supply" DOUBLE PRECISION,
    "tags" TEXT[],

    CONSTRAINT "tickers_pkey" PRIMARY KEY ("ticker_name")
);

-- CreateTable
CREATE TABLE "price_oi_data" (
    "ticker_name" TEXT NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "o" DOUBLE PRECISION NOT NULL,
    "h" DOUBLE PRECISION NOT NULL,
    "l" DOUBLE PRECISION NOT NULL,
    "c" DOUBLE PRECISION NOT NULL,
    "oi" DOUBLE PRECISION,

    CONSTRAINT "price_oi_data_pkey" PRIMARY KEY ("timestamp","ticker_name")
);

-- CreateTable
CREATE TABLE "latest_insights" (
    "ticker_name" TEXT NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "mcap" TEXT NOT NULL,
    "o" DOUBLE PRECISION NOT NULL,
    "h" DOUBLE PRECISION NOT NULL,
    "l" DOUBLE PRECISION NOT NULL,
    "c" DOUBLE PRECISION NOT NULL,
    "oi" DOUBLE PRECISION NOT NULL,
    "rp_15m" DOUBLE PRECISION NOT NULL,
    "rp_1h" DOUBLE PRECISION NOT NULL,
    "rp_4h" DOUBLE PRECISION NOT NULL,
    "rp_1D" DOUBLE PRECISION NOT NULL,
    "rp_1W" DOUBLE PRECISION NOT NULL,
    "rp_1M" DOUBLE PRECISION NOT NULL,
    "op_15m" DOUBLE PRECISION NOT NULL,
    "op_1h" DOUBLE PRECISION NOT NULL,
    "op_4h" DOUBLE PRECISION NOT NULL,
    "op_1D" DOUBLE PRECISION NOT NULL,
    "op_1W" DOUBLE PRECISION NOT NULL,
    "op_1M" DOUBLE PRECISION NOT NULL,
    "roi_15" DOUBLE PRECISION NOT NULL,
    "roi_1h" DOUBLE PRECISION NOT NULL,
    "roi_4h" DOUBLE PRECISION NOT NULL,
    "roi_1D" DOUBLE PRECISION NOT NULL,
    "roi_1W" DOUBLE PRECISION NOT NULL,
    "roi_1M" DOUBLE PRECISION NOT NULL,
    "ooi_15" DOUBLE PRECISION NOT NULL,
    "ooi_1h" DOUBLE PRECISION NOT NULL,
    "ooi_4h" DOUBLE PRECISION NOT NULL,
    "ooi_1D" DOUBLE PRECISION NOT NULL,
    "ooi_1W" DOUBLE PRECISION NOT NULL,
    "ooi_1M" DOUBLE PRECISION NOT NULL,
    "r_MH" DOUBLE PRECISION NOT NULL,
    "r_WH" DOUBLE PRECISION NOT NULL,
    "r_DH" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "latest_insights_pkey" PRIMARY KEY ("ticker_name","timestamp")
);

-- CreateIndex
CREATE UNIQUE INDEX "tickers_ticker_name_key" ON "tickers"("ticker_name");

-- CreateIndex
CREATE INDEX "price_oi_data_timestamp_ticker_name_idx" ON "price_oi_data"("timestamp", "ticker_name" DESC);

-- CreateIndex
CREATE INDEX "latest_insights_ticker_name_timestamp_idx" ON "latest_insights"("ticker_name", "timestamp" DESC);
