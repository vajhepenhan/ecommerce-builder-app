import { refreshTemplateSnapshots } from "./tasks/template-snapshot-cache";
import { refreshProductCache } from "./tasks/product-cache";
import { logger } from "./utils/logger";

logger.info("Worker started.");

async function loop() {
  await refreshTemplateSnapshots();
  await refreshProductCache();

  setTimeout(loop, 60 * 1000); // run every 60 sec
}

// Start loop
loop();
