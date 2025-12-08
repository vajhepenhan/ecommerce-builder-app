/**
 * apps/worker/template-snapshot-cache.ts
 * ---------------------------------------
 * CRON: Runs every 2–5 minutes
 * PURPOSE:
 *  - Pull template snapshots from Payload
 *  - Store in Redis with TTL
 *  - Exposed to storefront through Redis only
 */

import "dotenv/config";
import { Redis } from "@upstash/redis";
import fetch from "node-fetch";

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});

const PAYLOAD_URL = process.env.PAYLOAD_PUBLIC_URL!;
const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET!;

type Tenant = {
  id: string;
  slug: string;
  template: string; // template id
};

export async function refreshTemplateSnapshots() {
  console.log("⏳ Refreshing template snapshots...");

  // 1. Fetch all tenants
  const tenantRes = await fetch(`${PAYLOAD_URL}/api/tenants?limit=500`, {
    headers: { Authorization: `Bearer ${PAYLOAD_SECRET}` },
  });
  const tenantData = await tenantRes.json();
  const tenants: Tenant[] = tenantData.docs;

  for (const tenant of tenants) {
    try {
      // 2. Fetch template snapshot for this tenant
      const snapshotRes = await fetch(
        `${PAYLOAD_URL}/api/templates/${tenant.template}/snapshot`,
        { headers: { Authorization: `Bearer ${PAYLOAD_SECRET}` } }
      );
      const snapshot = await snapshotRes.json();

      // 3. Save to Redis
      const key = `template:snapshot:${tenant.slug}`;
      await redis.set(key, snapshot, { ex: 60 * 30 }); // 30 min TTL

      console.log(`✔ Stored snapshot → ${key}`);
    } catch (err) {
      console.error(`❌ Failed snapshot for tenant ${tenant.slug}`, err);
    }
  }

  console.log("🚀 Template snapshot worker completed.");
}

if (require.main === module) {
  refreshTemplateSnapshots();
}
