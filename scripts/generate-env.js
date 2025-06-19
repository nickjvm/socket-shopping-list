// scripts/generate-env.js
import fs from "fs";

const envVars = ["OPENAI_API_KEY", "TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN"];

console.log("Generating .env file...");
console.log("TURSDO_DATABASE_URL:", process.env.TURSO_DATABASE_URL);

const envContent = envVars
  .map((key) => `${key}=${process.env[key] || ""}`)
  .join("\n");

fs.writeFileSync(".env", envContent);
console.log("Generated .env file");
