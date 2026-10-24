#!/usr/bin/env python3
"""Deploy TIMLOMBA.EXE: source -> main, dist/ -> orphan gh-pages, enable Pages.

Usage: gh-deploy.py <workdir>
Credential via custom.legacy-github-pat surrogate (see AGENTS.md 2026-10-15 fix).
"""
import sys, os, json, base64, urllib.request, urllib.error, shutil

sys.path.insert(0, "/opt/muse/skills/custom-connector-setup/bin")
from dynamic_credentials import add_surrogate_to_request, read_json_response

API = "https://api.github.com"
OWNER = "Kayzenn123"
AUTHOR = {"name": "Ahmad Zen", "email": "zenbae0280@gmail.com"}
REPO = "agent-tools-timlomba"

workdir = sys.argv[1]


def call(method, path, data=None):
    req = urllib.request.Request(API + path, method=method)
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("User-Agent", "muse-gh-deploy")
    add_surrogate_to_request(req, "custom.github-pat", allowed_hosts=["api.github.com"])
    body = json.dumps(data).encode() if data is not None else None
    if body:
        req.add_header("Content-Type", "application/json")
        req.data = body
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return read_json_response(resp) if resp.status != 204 else {"ok": True}
    except urllib.error.HTTPError as e:
        try:
            err = json.loads(e.read().decode())
        except Exception:
            err = {"message": str(e)}
        return {"_error": e.code, "_detail": err}


def die(msg, r=None):
    print("GAGAL:", msg)
    if r:
        print(json.dumps(r)[:500])
    sys.exit(1)


def push_tree(d, message, branch, base_tree=None, parents=()):
    tree = []
    for root, _, fns in os.walk(d):
        for fn in fns:
            full = os.path.join(root, fn)
            rel = os.path.relpath(full, d)
            with open(full, "rb") as f:
                content = f.read()
            if len(content) > 900_000:
                print(f"  skip (gede): {rel}")
                continue
            b = call("POST", f"/repos/{OWNER}/{REPO}/git/blobs",
                     {"content": base64.b64encode(content).decode(), "encoding": "base64"})
            if b.get("_error"):
                die(f"blob {rel}", b)
            tree.append({"path": rel, "mode": "100644", "type": "blob", "sha": b["sha"]})
    print(f"  {len(tree)} blob -> {branch}")
    tdata = {"tree": tree, "base_tree": base_tree} if base_tree else {"tree": tree}
    t = call("POST", f"/repos/{OWNER}/{REPO}/git/trees", tdata)
    if t.get("_error"):
        die("buat tree", t)
    cm = call("POST", f"/repos/{OWNER}/{REPO}/git/commits",
              {"message": message, "tree": t["sha"], "parents": list(parents),
               "author": AUTHOR, "committer": AUTHOR})
    if cm.get("_error"):
        die("buat commit", cm)
    return cm["sha"]


# 1. repo
r = call("GET", f"/repos/{OWNER}/{REPO}")
just_created = False
if r.get("_error") == 404:
    print("membuat repo", REPO)
    r = call("POST", "/user/repos", {"name": REPO, "private": False,
             "description": "TIMLOMBA.EXE — terminal primbon cari tim lomba (Astro, 2026-10-23)"})
    if r.get("_error"):
        die("buat repo", r)
    just_created = True
elif r.get("_error"):
    die("cek repo", r)
else:
    print("repo sudah ada")

if just_created:
    # seed via Contents API supaya Git Data API tidak 409 "empty"
    import time
    for i in range(5):
        s = call("PUT", f"/repos/{OWNER}/{REPO}/contents/.gitkeep",
                 {"message": "init", "content": "",
                  "committer": AUTHOR, "author": AUTHOR})
        if not s.get("_error"):
            print("seed .gitkeep ok")
            break
        print(f"  seed coba {i + 1} gagal ({s.get('_error')}), tunggu...")
        time.sleep(5)
    else:
        die("seed .gitkeep", s)

# 2. source -> main
src = "/tmp/push-src"
shutil.rmtree(src, ignore_errors=True)
os.makedirs(src)
os.system(f"rsync -a --exclude node_modules --exclude dist --exclude .git --exclude tools/gh-push-branch.py {workdir}/ {src}/")
ref = call("GET", f"/repos/{OWNER}/{REPO}/git/ref/heads/main")
if ref.get("_error") in (404, 409):
    sha = push_tree(src, "build(2026-10-23): TIMLOMBA.EXE — terminal primbon cari tim lomba", "main")
    cr = call("POST", f"/repos/{OWNER}/{REPO}/git/refs",
              {"ref": "refs/heads/main", "sha": sha})
    if cr.get("_error"):
        die("buat ref main", cr)
    print("main dibuat:", sha[:8])
else:
    print("main sudah ada — lewati (R1 read-only repo lama tak berlaku; repo ini baru)")

# 3. dist -> gh-pages (orphan, tree bersih)
ref = call("GET", f"/repos/{OWNER}/{REPO}/git/ref/heads/gh-pages")
if ref.get("_error") in (404, 409):
    sha = push_tree(os.path.join(workdir, "dist"), "deploy(2026-10-23): TIMLOMBA.EXE", "gh-pages")
    cr = call("POST", f"/repos/{OWNER}/{REPO}/git/refs",
              {"ref": "refs/heads/gh-pages", "sha": sha})
    if cr.get("_error"):
        die("buat ref gh-pages", cr)
    print("gh-pages dibuat:", sha[:8])
else:
    print("gh-pages sudah ada — lewati")

# 4. enable Pages
pg = call("GET", f"/repos/{OWNER}/{REPO}/pages")
if pg.get("_error") == 404:
    pg = call("POST", f"/repos/{OWNER}/{REPO}/pages",
              {"source": {"branch": "gh-pages", "path": "/"}})
    if pg.get("_error"):
        die("enable pages", pg)
    print("Pages diaktifkan")
print("pages:", pg.get("html_url", pg.get("status", "?")))
print("SELESAI")
