const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const GLOB_DIRS = [ 'opskrifter' ]; // tilføj evt. flere mapper

function read(file) { return fs.readFileSync(file, 'utf8'); }
function write(file, txt) { fs.writeFileSync(file, txt, 'utf8'); }

function extractBetween(html, start, end) {
  const s = html.indexOf(start);
  if (s === -1) return '';
  const e = html.indexOf(end, s + start.length);
  if (e === -1) return '';
  return html.slice(s + start.length, e).trim();
}

function getMeta(html, name, prop=false) {
  const re = prop
    ? new RegExp(`<meta[^>]+property=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i')
    : new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i');
  const m = html.match(re);
  return m ? m[1].trim() : '';
}

function toJSONLD({name, desc, img, ingredients, steps}) {
  const schema = {
    "@context": "https://schema.org/",
    "@type": "Recipe",
    "name": name || undefined,
    "description": desc || undefined,
    "image": img ? [img] : undefined,
    "recipeIngredient": ingredients.length ? ingredients : undefined,
    "recipeInstructions": steps.length ? steps.map(t => ({ "@type":"HowToStep", "text": t })) : undefined,
    "author": { "@type": "Organization", "name": "Opskrift-Airfryer.dk" }
  };
  Object.keys(schema).forEach(k => (schema[k] == null) && delete schema[k]);
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

function processFile(file) {
  let html = read(file);

  // find titel
  let name = extractBetween(html, '<h1', '</h1>');
  if (name) {
    // strip <h1 ...>
    const gt = name.indexOf('>');
    if (gt !== -1) name = name.slice(gt+1).trim();
  } else {
    name = extractBetween(html, '<title>', '</title>');
  }

  const desc = getMeta(html, 'description') || '';
  const img = getMeta(html, 'og:image', true) ||
              extractBetween(html, '<img', '>').match(/src=["']([^"']+)["']/i)?.[1] || '';

  // ingredienser
  const ingBlock = extractBetween(html, '<ul class="ingredients">', '</ul>')
                || extractBetween(html, '<ul class="ingredienser">', '</ul');
  const ingredients = Array.from(ingBlock.matchAll(/<li[^>]*>(.*?)<\/li>/gis)).map(m => m[1].replace(/<[^>]+>/g,'').trim()).filter(Boolean);

  // steps
  const stBlock = extractBetween(html, '<ol class="steps">', '</ol>')
               || extractBetween(html, '<ol class="instructions">', '</ol>');
  const steps = Array.from(stBlock.matchAll(/<li[^>]*>(.*?)<\/li>/gis)).map(m => m[1].replace(/<[^>]+>/g,'').trim()).filter(Boolean);

  const jsonld = toJSONLD({name, desc, img, ingredients, steps});

  if (html.includes('application/ld+json')) return; // allerede indsat

  // indsæt før </head> hvis muligt, ellers i toppen af <body>
  if (html.includes('</head>')) {
    html = html.replace('</head>', `${jsonld}\n</head>`);
  } else if (html.includes('<body')) {
    html = html.replace(/<body[^>]*>/i, (m) => `${m}\n${jsonld}\n`);
  } else {
    html = `${jsonld}\n${html}`;
  }

  write(file, html);
  console.log('✔ schema indsat:', path.relative(ROOT, file));
}

function walkDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walkDir(p);
    else if (entry.isFile() && p.endsWith('.html')) processFile(p);
  }
}

for (const d of GLOB_DIRS) walkDir(path.join(ROOT, d));
