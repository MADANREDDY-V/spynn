
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const envText = fs.readFileSync(".env.migration.local", "utf8");

function getEnv(name) {
  const line = envText
    .split(/\r?\n/)
    .find((line) => line.trim().startsWith(`${name}=`));

  if (!line) throw new Error(`${name} is missing`);

  return line.slice(line.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "");
}

const url = getEnv("SUPABASE_URL");
const key = getEnv("SUPABASE_SECRET_KEY");

if (!url.startsWith("https://") || !key.startsWith("sb_secret_")) {
  throw new Error("Check the migration URL and secret-key format.");
}

const supabase = createClient(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const { data, error } = await supabase
  .from("billing_stores")
  .select("id, store_code")
  .eq("store_code", "CHANDANAGAR")
  .maybeSingle();

if (error) {
  console.error("Connection/query failed:", error.message);
  process.exitCode = 1;
} else if (!data) {
  console.error("Connected, but CHANDANAGAR was not found.");
  process.exitCode = 1;
} else {
  console.log("Supabase connection: SUCCESS");
  console.log("Target store code:", data.store_code);
  console.log("Read-only test completed; no data was changed.");
}
