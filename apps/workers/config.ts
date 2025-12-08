export const config = {
  PAYLOAD_URL: process.env.PAYLOAD_URL!,
  REDIS_URL: process.env.REDIS_URL!,
  CDN_PURGE_URL: process.env.CDN_PURGE_URL!,
  CDN_TOKEN: process.env.CDN_TOKEN!,
  
  SNAPSHOT_CACHE_TTL: 60 * 5,       // 5 min
  PRODUCT_CACHE_TTL: 60 * 2,        // 2 min
};
