/*
  Warnings:

  - You are about to drop the column `ooi_15` on the `latest_insights` table. All the data in the column will be lost.
  - You are about to drop the column `ooi_1D` on the `latest_insights` table. All the data in the column will be lost.
  - You are about to drop the column `ooi_1M` on the `latest_insights` table. All the data in the column will be lost.
  - You are about to drop the column `ooi_1W` on the `latest_insights` table. All the data in the column will be lost.
  - You are about to drop the column `ooi_1h` on the `latest_insights` table. All the data in the column will be lost.
  - You are about to drop the column `ooi_4h` on the `latest_insights` table. All the data in the column will be lost.
  - You are about to drop the column `op_15m` on the `latest_insights` table. All the data in the column will be lost.
  - You are about to drop the column `op_1D` on the `latest_insights` table. All the data in the column will be lost.
  - You are about to drop the column `op_1M` on the `latest_insights` table. All the data in the column will be lost.
  - You are about to drop the column `op_1W` on the `latest_insights` table. All the data in the column will be lost.
  - You are about to drop the column `op_1h` on the `latest_insights` table. All the data in the column will be lost.
  - You are about to drop the column `op_4h` on the `latest_insights` table. All the data in the column will be lost.
  - You are about to drop the column `roi_15` on the `latest_insights` table. All the data in the column will be lost.
  - You are about to drop the column `roi_1D` on the `latest_insights` table. All the data in the column will be lost.
  - You are about to drop the column `roi_1M` on the `latest_insights` table. All the data in the column will be lost.
  - You are about to drop the column `roi_1W` on the `latest_insights` table. All the data in the column will be lost.
  - You are about to drop the column `roi_1h` on the `latest_insights` table. All the data in the column will be lost.
  - You are about to drop the column `roi_4h` on the `latest_insights` table. All the data in the column will be lost.
  - You are about to drop the column `rp_15m` on the `latest_insights` table. All the data in the column will be lost.
  - You are about to drop the column `rp_1D` on the `latest_insights` table. All the data in the column will be lost.
  - You are about to drop the column `rp_1M` on the `latest_insights` table. All the data in the column will be lost.
  - You are about to drop the column `rp_1W` on the `latest_insights` table. All the data in the column will be lost.
  - You are about to drop the column `rp_1h` on the `latest_insights` table. All the data in the column will be lost.
  - You are about to drop the column `rp_4h` on the `latest_insights` table. All the data in the column will be lost.
  - Added the required column `mcap_oi` to the `latest_insights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `o_DH` to the `latest_insights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `o_DL` to the `latest_insights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `o_oi_1D` to the `latest_insights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `o_oi_1h` to the `latest_insights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `o_oi_4h` to the `latest_insights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `o_p_15m` to the `latest_insights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `o_p_1D` to the `latest_insights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `o_p_1M` to the `latest_insights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `o_p_1W` to the `latest_insights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `o_p_1h` to the `latest_insights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `o_p_4h` to the `latest_insights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `r_DL` to the `latest_insights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `r_oi_15` to the `latest_insights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `r_oi_1D` to the `latest_insights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `r_oi_1h` to the `latest_insights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `r_oi_4h` to the `latest_insights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `r_p_15m` to the `latest_insights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `r_p_1D` to the `latest_insights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `r_p_1M` to the `latest_insights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `r_p_1W` to the `latest_insights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `r_p_1h` to the `latest_insights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `r_p_4h` to the `latest_insights` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `mcap` on the `latest_insights` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "latest_insights" DROP COLUMN "ooi_15",
DROP COLUMN "ooi_1D",
DROP COLUMN "ooi_1M",
DROP COLUMN "ooi_1W",
DROP COLUMN "ooi_1h",
DROP COLUMN "ooi_4h",
DROP COLUMN "op_15m",
DROP COLUMN "op_1D",
DROP COLUMN "op_1M",
DROP COLUMN "op_1W",
DROP COLUMN "op_1h",
DROP COLUMN "op_4h",
DROP COLUMN "roi_15",
DROP COLUMN "roi_1D",
DROP COLUMN "roi_1M",
DROP COLUMN "roi_1W",
DROP COLUMN "roi_1h",
DROP COLUMN "roi_4h",
DROP COLUMN "rp_15m",
DROP COLUMN "rp_1D",
DROP COLUMN "rp_1M",
DROP COLUMN "rp_1W",
DROP COLUMN "rp_1h",
DROP COLUMN "rp_4h",
ADD COLUMN     "mcap_oi" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "o_DH" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "o_DL" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "o_MH" DOUBLE PRECISION,
ADD COLUMN     "o_ML" DOUBLE PRECISION,
ADD COLUMN     "o_WH" DOUBLE PRECISION,
ADD COLUMN     "o_WL" DOUBLE PRECISION,
ADD COLUMN     "o_oi_15" DOUBLE PRECISION,
ADD COLUMN     "o_oi_1D" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "o_oi_1M" DOUBLE PRECISION,
ADD COLUMN     "o_oi_1W" DOUBLE PRECISION,
ADD COLUMN     "o_oi_1h" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "o_oi_4h" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "o_p_15m" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "o_p_1D" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "o_p_1M" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "o_p_1W" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "o_p_1h" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "o_p_4h" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "r_DL" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "r_ML" DOUBLE PRECISION,
ADD COLUMN     "r_WL" DOUBLE PRECISION,
ADD COLUMN     "r_oi_15" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "r_oi_1D" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "r_oi_1M" DOUBLE PRECISION,
ADD COLUMN     "r_oi_1W" DOUBLE PRECISION,
ADD COLUMN     "r_oi_1h" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "r_oi_4h" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "r_p_15m" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "r_p_1D" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "r_p_1M" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "r_p_1W" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "r_p_1h" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "r_p_4h" DOUBLE PRECISION NOT NULL,
DROP COLUMN "mcap",
ADD COLUMN     "mcap" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "r_MH" DROP NOT NULL,
ALTER COLUMN "r_WH" DROP NOT NULL;
