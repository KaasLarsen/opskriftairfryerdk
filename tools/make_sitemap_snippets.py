import os, urllib.parse, datetime
BASE = "https://opskrift-airfryer.dk"
FOLDERS = [("./opskrifter","/opskrifter"), ("./guides","/guides")]
today = datetime.date.today().isoformat()

def emit(path):
    url = f"{BASE}{urllib.parse.quote(path)}"
    return f'  <url><loc>{url}</loc><lastmod>{today}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>'

out = []
for local_root, web_root in FOLDERS:
    if not os.path.isdir(local_root): 
        continue
    for root, _, files in os.walk(local_root):
        for f in files:
            if f.lower().endswith(".html"):
                rel = os.path.join(root, f).replace("\\","/")
                if rel.startswith("."): rel = rel[1:]
                out.append(emit(rel))

print("\n".join(sorted(out)))
