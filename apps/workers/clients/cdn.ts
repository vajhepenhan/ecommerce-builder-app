import { config } from "../config";

export async function purgeCDN(urls: string[]) {
  return fetch(config.CDN_PURGE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.CDN_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ urls }),
  });
}
