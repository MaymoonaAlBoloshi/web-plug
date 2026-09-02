import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist");
const configuredOrigin = process.env.WEBPLUG_ORIGIN || "http://localhost:3000";
const origin = new URL(configuredOrigin);

if (!['http:', 'https:'].includes(origin.protocol)) {
  throw new Error("WEBPLUG_ORIGIN must be an HTTP or HTTPS URL");
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
const html = await readFile(path.join(root, "src", "index.html"), "utf8");
await writeFile(path.join(output, "index.html"), html.replaceAll("__WEBPLUG_ORIGIN__", origin.origin), "utf8");
await cp(path.join(root, "src", "styles.css"), path.join(output, "styles.css"));
await cp(path.join(root, "src", "app.js"), path.join(output, "app.js"));

console.log(`Northstar demo built for WebPlug at ${origin.origin}`);
