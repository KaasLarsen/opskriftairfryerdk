// node >=18
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** <<< TILPAS DISSE TO, hvis dine filer ligger et andet sted >>> **/
const PUBLIC_DIR = path.resolve(__dirname, "..", "public");      // din public-rod
const RECIPES_DIR = path.join(PUBLIC_DIR, "opskrifter");         // mappe med opskrift-HTML
const OUT_FILE    = path.join(PUBLIC_DIR, "recipes-sitemap.xml");
/*******************************************************************/

function normalizeKey(p) {
  // robust dedupe: små bogstaver, fjern accenter, kollapsér bindestreger
  return p
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/--+/g, "-")
    .replace(/\/+/g, "/");
}

async function listHtml(dir, base = "/opskrifter") {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith(".")) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...await listHtml(full, base + "/" + e.name));
    } else if (e.isFile() && e.name.endsWith(".html")) {
      // skip skabeloner/kladder hvis du har dem
      if (/^(index|template|_draft)/i.test(e.name)) continue;
      out.push(`${base}/${e.name}`);
    }
  }
  return out;
}

(async () => {
  // 1) find alle opskriftsider
  const relPaths = await listHtml(RECIPES_DIR);

  // 2) dedupe
  const seen = new Set();
  const unique = [];
  for (const rel of relPaths) {
    const key = normalizeKey(rel);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(rel);
  }

  // 3) sortér pænt (dansk)
  unique.sort((a, b) => a.localeCompare(b, "da"));

  // 4) skriv sitemap
  const urls = unique.map(u => `  <url><loc>https://www.opskrift-airfryer.dk${u}</loc></url>`);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;
  await fs.writeFile(OUT_FILE, xml, "utf8");
  console.log(`✔ Skrev ${unique.length} URL'er til ${OUT_FILE}`);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
