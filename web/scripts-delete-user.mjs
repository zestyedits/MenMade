import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const envPath = "/workspaces/MenMade/web/.env.local";
const env = Object.fromEntries(
  fs.readFileSync(envPath, "utf8")
    .split("\n")
    .filter(l => l && !l.startsWith("#") && l.includes("="))
    .map(l => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("Missing env"); process.exit(1); }

const admin = createClient(url, key, { auth: { persistSession: false } });
const target = process.argv[2];
if (!target) { console.error("Usage: node delete-user.mjs <email>"); process.exit(1); }

// Page through users to find the match.
let userId = null;
let page = 1;
while (!userId) {
  const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
  if (error) { console.error(error); process.exit(1); }
  const hit = data.users.find(u => u.email?.toLowerCase() === target.toLowerCase());
  if (hit) { userId = hit.id; break; }
  if (data.users.length < 200) break;
  page++;
}

if (!userId) { console.log(`No user with email ${target}`); process.exit(0); }

const { error: delErr } = await admin.auth.admin.deleteUser(userId);
if (delErr) { console.error("Delete failed:", delErr); process.exit(1); }
console.log(`Deleted ${target} (id=${userId})`);
