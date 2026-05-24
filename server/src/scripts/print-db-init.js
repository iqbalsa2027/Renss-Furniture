import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sqlPath = path.resolve(__dirname, "../../database/001_init.sql");

process.stdout.write(fs.readFileSync(sqlPath, "utf8"));
