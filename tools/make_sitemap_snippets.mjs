import { readdirSync, statSync } from "fs";
import { join } from "path";

const BASE = "https://opskrift-airfryer.dk";
const FOLDERS = [["opskrifter","/opskrifter"], ["guides","/guides"]];
const today = new Date().toISOString().slice(0,10);

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) yield* walk(p);
    else if (name.toLowerCase().endsWith(".html")) yield p;
  }
}

function emit(pathWeb){
  const enc = encodeURI(pathWeb);
  return `  <url><loc>${BASE}${enc}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>`;
}

let out = [];
for (const [, webroot] of FOLDERS) {
  const local = "." + webroot;
  try {
    for (const p of walk(local)) {
      const web = p.replace(/\\/g,"").replace(/^\./,"").replace(/\\/g,"/"); // -> /opskrifter/...
      out.push(emit(web));
    }
  } catch {}
}

console.log(out.sort().join("\n"));
