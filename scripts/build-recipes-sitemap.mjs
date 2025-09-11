// node >=18
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// kandidatmapper hvor opskrifter kan ligge (første der findes, bruges)
const CANDIDATES = [
  "public/opskrifter",
  "opskrifter",
  "static/opskrifter",
  "site/opskrifter",
].map(p => path.join(ROOT, p));

const PUBLIC_CANDIDATES = [
  "public",
  ".",
  "static",
].map(p => path.join(ROOT, p));

function normalizeKey(p) {
  return p
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/--+/g, "-")
    .replace(/\/+/g, "/");
}

async function pickExisting(paths) {
  for (const p of paths) {
    try {
      const st = await fs.stat(p);
      if (st.isDirectory()) return p;
    } catch {_}
  }
  return null;
}

async function listHtml(dir, baseHref) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith(".")) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...await listHtml(full, baseHref + "/" + e.name));
    } else if (e.isFile() && e.name.endsWith(".html")) {
      if (/^(index|template|_draft)/i.test(e.name)) continue;
      out.push(`${baseHref}/${e.name}`);
    }
  }
  return out;
}

(async () => {
  const RECIPES_DIR = await pickExisting(CANDIDATES);
  if (!RECIPES_DIR) {
    console.error("❌ fandt ikke opskriftsmappen. prøvede:", CANDIDATES.join(", "));
    process.exit(1);
  }
  // find public-rod der matcher URL-roden
  const PUBLIC_DIR = await pickExisting(PUBLIC_CANDIDATES);
  if (!PUBLIC_DIR) {
    console.error("❌ fandt ikke public-rod. prøvede:", PUBLIC_CANDIDATES.join(", "));
    process.exit(1);
  }
  const baseHref = "/opskrifter"; // URL-sti
  const OUT_FILE = path.join(PUBLIC_DIR, "recipes-sitemap.xml");

  console.log("📂 læser fra:", RECIPES_DIR);
  console.log("📝 skriver til:", OUT_FILE);

  const relPaths = await listHtml(RECIPES_DIR, baseHref);

  // dedupe
  const seen = new Set();
  const unique = [];
  for (const rel of relPaths) {
    const key = normalizeKey(rel);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(rel);
  }

  if (unique.length === 0) {
    console.error("❌ fandt 0 html-filer. sitemap genereres ikke.");
    process.exit(2);
  }

  unique.sort((a, b) => a.localeCompare(b, "da"));
  const lines = unique.map(u => `  <url><loc>https://www.opskrift-airfryer.dk${u}</loc></url>`);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${lines.join("\n")}\n</urlset>\n`;
  await fs.writeFile(OUT_FILE, xml, "utf8");
  console.log(`✔ ${unique.length} URLs skrevet.`);
})();
