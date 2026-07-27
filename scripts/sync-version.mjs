import { readFileSync, writeFileSync } from "node:fs";

const { version } = JSON.parse(readFileSync("package.json", "utf8"));
const target = "public/version.json";

writeFileSync(target, JSON.stringify({ version }, null, 2) + "\n");
console.log(`synced ${target} -> ${version}`);