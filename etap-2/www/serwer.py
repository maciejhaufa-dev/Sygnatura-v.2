#!/usr/bin/env python3
"""Studio Sygnatura — podgląd + SQLite (test zamówień na kompie).
   Uruchom z katalogu podglad-serwisu:  python3 serwer.py
   Baza: data/zamowienia.sqlite
"""
from __future__ import annotations

import json
import os
import sqlite3
from datetime import datetime
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(ROOT, "data")
DB = os.path.join(DATA, "zamowienia.sqlite")
os.makedirs(DATA, exist_ok=True)


def conn():
    c = sqlite3.connect(DB)
    c.row_factory = sqlite3.Row
    return c


def init_db():
    c = conn()
    c.executescript(
        """
        CREATE TABLE IF NOT EXISTS seq (day TEXT PRIMARY KEY, n INTEGER NOT NULL);
        CREATE TABLE IF NOT EXISTS inquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            syg TEXT UNIQUE NOT NULL,
            email TEXT, name TEXT, topic TEXT, txt TEXT, sku TEXT,
            created TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            syg TEXT NOT NULL,
            email TEXT, name TEXT, uw TEXT, sum REAL,
            items TEXT, created TEXT NOT NULL
        );
        """
    )
    c.commit()
    c.close()


def next_syg():
    day = datetime.now().strftime("%Y-%m-%d")
    c = conn()
    row = c.execute("SELECT n FROM seq WHERE day=?", (day,)).fetchone()
    n = (row["n"] if row else 0) + 1
    if n > 9999:
        n = 9999
    c.execute(
        "INSERT INTO seq(day, n) VALUES(?, ?) ON CONFLICT(day) DO UPDATE SET n=excluded.n",
        (day, n),
    )
    c.commit()
    c.close()
    return f"{day}-{n:04d}"


def rows(q, args=()):
    c = conn()
    out = [dict(r) for r in c.execute(q, args).fetchall()]
    c.close()
    return out


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def _json(self, obj, code=200):
        raw = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def _body(self):
        n = int(self.headers.get("Content-Length") or 0)
        if not n:
            return {}
        return json.loads(self.rfile.read(n).decode("utf-8") or "{}")

    def do_GET(self):
        u = urlparse(self.path)
        if u.path == "/api/health":
            return self._json({"ok": True, "db": os.path.exists(DB)})
        if u.path == "/api/konto":
            q = parse_qs(u.query)
            email = (q.get("email") or [""])[0].strip()
            inq = rows(
                "SELECT * FROM inquiries WHERE email=? OR email='' OR email IS NULL ORDER BY id DESC",
                (email,),
            ) if email else rows("SELECT * FROM inquiries ORDER BY id DESC")
            if email:
                inq = [x for x in rows("SELECT * FROM inquiries ORDER BY id DESC") if (x.get("email") or "") in ("", email)]
            ord_ = rows(
                "SELECT * FROM orders WHERE email=? ORDER BY id DESC", (email,)
            ) if email else rows("SELECT * FROM orders ORDER BY id DESC")
            for o in ord_:
                try:
                    o["items"] = json.loads(o["items"] or "[]")
                except Exception:
                    o["items"] = []
            return self._json({"inquiries": inq, "orders": ord_})
        if u.path == "/api/warsztat":
            inq = rows("SELECT * FROM inquiries ORDER BY id DESC")
            ord_ = rows("SELECT * FROM orders ORDER BY id DESC")
            for o in ord_:
                try:
                    o["items"] = json.loads(o["items"] or "[]")
                except Exception:
                    o["items"] = []
            return self._json({"inquiries": inq, "orders": ord_, "seq": rows("SELECT * FROM seq")})
        return super().do_GET()

    def do_POST(self):
        u = urlparse(self.path)
        data = self._body()
        now = datetime.now().isoformat(timespec="seconds")
        if u.path == "/api/inquiry":
            syg = (data.get("syg") or "").strip() or next_syg()
            c = conn()
            c.execute(
                "INSERT OR IGNORE INTO inquiries(syg,email,name,topic,txt,sku,created) VALUES(?,?,?,?,?,?,?)",
                (
                    syg,
                    (data.get("email") or "").strip(),
                    (data.get("name") or "").strip(),
                    data.get("topic") or "",
                    data.get("txt") or "",
                    data.get("sku") or "",
                    now,
                ),
            )
            c.commit()
            c.close()
            return self._json({"ok": True, "syg": syg})
        if u.path == "/api/order":
            syg = (data.get("syg") or "").strip() or next_syg()
            items = data.get("items") or []
            c = conn()
            c.execute(
                "INSERT INTO orders(syg,email,name,uw,sum,items,created) VALUES(?,?,?,?,?,?,?)",
                (
                    syg,
                    (data.get("email") or "").strip(),
                    (data.get("name") or "").strip(),
                    data.get("uw") or "",
                    float(data.get("sum") or 0),
                    json.dumps(items, ensure_ascii=False),
                    now,
                ),
            )
            if not data.get("syg"):
                c.execute(
                    "INSERT OR IGNORE INTO inquiries(syg,email,name,topic,txt,sku,created) VALUES(?,?,?,?,?,?,?)",
                    (syg, data.get("email") or "", data.get("name") or "", "zamówienie", "Z koszyka", "zamowienie", now),
                )
            c.commit()
            c.close()
            return self._json({"ok": True, "syg": syg})
        self.send_error(404)

    def log_message(self, fmt, *args):
        print("[%s] %s" % (self.log_date_time_string(), fmt % args))


if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", "8080"))
    httpd = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    print("Studio Sygnatura test → http://0.0.0.0:%s  (SQLite %s)" % (port, DB))
    httpd.serve_forever()
