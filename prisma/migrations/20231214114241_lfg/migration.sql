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
    "mcap" DOUBLE PRECISION NOT NULL,
    "oi_mcap" DOUBLE PRECISION NOT NULL,
    "o" DOUBLE PRECISION NOT NULL,
    "oi" DOUBLE PRECISION NOT NULL,
    "r_p_15m" DOUBLE PRECISION NOT NULL,
    "r_p_1h" DOUBLE PRECISION NOT NULL,
    "r_p_4h" DOUBLE PRECISION NOT NULL,
    "r_p_1D" DOUBLE PRECISION NOT NULL,
    "r_p_1W" DOUBLE PRECISION NOT NULL,
    "r_p_1M" DOUBLE PRECISION NOT NULL,
    "r_oi_15m" DOUBLE PRECISION NOT NULL,
    "r_oi_1h" DOUBLE PRECISION NOT NULL,
    "r_oi_4h" DOUBLE PRECISION NOT NULL,
    "r_oi_1D" DOUBLE PRECISION NOT NULL,
    "r_oi_1W" DOUBLE PRECISION,
    "r_oi_1M" DOUBLE PRECISION,
    "r_MH" DOUBLE PRECISION NOT NULL,
    "r_WH" DOUBLE PRECISION NOT NULL,
    "r_DH" DOUBLE PRECISION NOT NULL,
    "r_ML" DOUBLE PRECISION,
    "r_WL" DOUBLE PRECISION,
    "r_DL" DOUBLE PRECISION NOT NULL,
    "o_p_15m" DOUBLE PRECISION NOT NULL,
    "o_p_1h" DOUBLE PRECISION NOT NULL,
    "o_p_4h" DOUBLE PRECISION NOT NULL,
    "o_p_1D" DOUBLE PRECISION NOT NULL,
    "o_p_1W" DOUBLE PRECISION NOT NULL,
    "o_p_1M" DOUBLE PRECISION NOT NULL,
    "o_oi_15m" DOUBLE PRECISION NOT NULL,
    "o_oi_1h" DOUBLE PRECISION NOT NULL,
    "o_oi_4h" DOUBLE PRECISION NOT NULL,
    "o_oi_1D" DOUBLE PRECISION NOT NULL,
    "o_oi_1W" DOUBLE PRECISION,
    "o_oi_1M" DOUBLE PRECISION,
    "o_MH" DOUBLE PRECISION NOT NULL,
    "o_WH" DOUBLE PRECISION NOT NULL,
    "o_DH" DOUBLE PRECISION NOT NULL,
    "o_ML" DOUBLE PRECISION NOT NULL,
    "o_WL" DOUBLE PRECISION NOT NULL,
    "o_DL" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "latest_insights_pkey" PRIMARY KEY ("ticker_name","timestamp")
);

-- CreateIndex
CREATE UNIQUE INDEX "tickers_ticker_name_key" ON "tickers"("ticker_name");

-- CreateIndex
CREATE INDEX "price_oi_data_timestamp_ticker_name_idx" ON "price_oi_data"("timestamp", "ticker_name" DESC);

-- CreateIndex
CREATE INDEX "latest_insights_ticker_name_timestamp_idx" ON "latest_insights"("ticker_name", "timestamp" DESC);
