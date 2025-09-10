import os, urllib.parse, datetime

BASE = "https://opskrift-airfryer.dk"
FOLDERS = [("opskrifter", "/opskrifter"), ("guides", "/guides")]
today = datetime.date.today().isoformat()

def emit(path):
    url = f"{BASE}{urllib.parse.quote(path)}"
    return f'  <url><loc>{url}</loc><lastmod>{today}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>'

snippets = []

for label, webroot in FOLDERS:
    local = "." + webroot
    if not os.path.isdir(local):
        continue
    for root, _, files in os.walk(local):
        for f in files:
            if f.lower().endswith(".html"):
                rel = os.path.join(root, f)[1:]  # drop leading dot
                rel_web = rel.replace("\\", "/")
                snippets.append(emit(rel_web))

print("\n".join(sorted(snippets)))
