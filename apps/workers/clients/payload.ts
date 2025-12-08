import { config } from "../config";

export async function fetchFromPayload(path: string) {
  const url = `${config.PAYLOAD_URL}${path}`;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) throw new Error(`Payload error: ${res.status}`);

  return res.json();
}
