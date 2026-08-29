import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

function isPrivateIp(address: string) {
  if (address === "::1" || address.startsWith("fc") || address.startsWith("fd") || address.startsWith("fe80:")) return true;
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN)) return false;
  return parts[0] === 10 || parts[0] === 127 || (parts[0] === 169 && parts[1] === 254) || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || (parts[0] === 192 && parts[1] === 168) || parts[0] === 0;
}

export async function assertSafePublicUrl(value: string) {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Only HTTP and HTTPS URLs are allowed");
  if (url.username || url.password || url.port) throw new Error("Credentials and custom ports are not allowed");
  if (isIP(url.hostname) && isPrivateIp(url.hostname)) throw new Error("Private network URLs are not allowed");
  const records = await lookup(url.hostname, { all: true });
  if (!records.length || records.some(record => isPrivateIp(record.address))) throw new Error("Private network URLs are not allowed");
  return url;
}
