import { redis } from "../clients/redis";
import { fetchFromPayload } from "../clients/payload";
import { logger } from "../utils/logger";
import { config } from "../config";

export async function refreshProductCache() {
  try {
    logger.info("Refreshing product cache…");

    const tenants = await fetchFromPayload("/api/tenants?limit=250");

    for (const tenant of tenants.docs) {
      const products = await fetchFromPayload(
        `/api/products?where[tenant.slug][equals]=${tenant.slug}&limit=500`
      );

      await redis.set(
        `TENANT:${tenant.slug}:PRODUCTS`,
        JSON.stringify(products),
        { EX: config.PRODUCT_CACHE_TTL }
      );

      logger.info(`Cached products for tenant: ${tenant.slug}`);
    }
  } catch (err: any) {
    logger.error("Product cache refresh failed:", err.message);
  }
}
