#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Wyodrębnia warstwy L0-L5 z uploads/Szopka 3D.svg i renderuje każdą
jako PNG: czarne linie na białym tle (304,8 dpi, obszar 200x200 mm).

Reguły:
  * stroke -> czarny (#000), szerokość bez zmian (z transformami elementu)
  * fill   -> biały (podkłady robocze arkusza = transform scale(0.26458333) są pomijane)
  * renderer: spłaszczenie ścieżek (M L H V C S Q T A Z + relatywne, pary bez litery)
    -> obrys miter (butt caps) -> maska even-odd per element, OR do maski warstwy
Wyjście: pracownia/szopka/WARSTWY-PNG/L0.png ... L5.png + PRZEGLAD-*.png
"""
import math
import os
import re
import sys

from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svgfill import (TOKEN, arc_pts, flatten_cubic, flatten_quad,
                     parse_transform, tx_pt)

SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'uploads', 'Szopka 3D.svg')
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'pracownia', 'szopka', 'WARSTWY-PNG')
SIZE = 2400          # 200 mm -> 2400 px (304,8 dpi)
S = SIZE / 200.0     # skala mm -> px


# ---------------------------------------------------------------- parser ścieżek
def parse_path2(d, tol=0.4):
    """Jak svgfill.parse_path, ale zachowuje też 2-punktowe linie (M..L)
    i obsługuje pary współrzędnych bez litery (powtórzenie komendy, M->L)."""
    tokens = TOKEN.findall(d)
    subs, cur = [], []
    i = 0
    cmd = ''
    cx = cy = sx = sy = 0.0
    c1x = c1y = 0.0

    def num():
        nonlocal i
        v = float(tokens[i]); i += 1
        return v

    while i < len(tokens):
        t = tokens[i]
        if re.fullmatch(r'[a-zA-Z]', t):
            cmd = t
            i += 1
            continue
        if not cmd:
            i += 1
            continue
        rel = cmd.islower()
        C = cmd.upper()

        if C == 'M':
            x, y = num(), num()
            x, y = (x+cx, y+cy) if rel else (x, y)
            if cur:
                subs.append(cur)
            cur = [(x, y)]
            cx, cy, sx, sy = x, y, x, y
            c1x, c1y = x, y
            cmd = 'l' if rel else 'L'      # kolejne pary bez litery = lineto
        elif C == 'L':
            x, y = num(), num()
            cx, cy = (x+cx, y+cy) if rel else (x, y)
            cur.append((cx, cy))
            c1x, c1y = cx, cy
        elif C == 'H':
            x = num()
            cx = x + cx if rel else x
            cur.append((cx, cy))
            c1x, c1y = cx, cy
        elif C == 'V':
            y = num()
            cy = y + cy if rel else y
            cur.append((cx, cy))
            c1x, c1y = cx, cy
        elif C == 'Z':
            if cur and len(cur) > 1 and cur[0] != cur[-1]:
                cur.append(cur[0])
            cx, cy = sx, sy
            c1x, c1y = cx, cy
            cmd = ''
        elif C == 'C':
            x1, y1 = num(), num(); x2, y2 = num(), num(); x, y = num(), num()
            x1, y1 = (x1+cx, y1+cy) if rel else (x1, y1)
            x2, y2 = (x2+cx, y2+cy) if rel else (x2, y2)
            x, y = (x+cx, y+cy) if rel else (x, y)
            cur.extend(flatten_cubic(cx, cy, x1, y1, x2, y2, x, y, tol)[1:])
            c1x, c1y = x2, y2
            cx, cy = x, y
        elif C == 'S':
            x2, y2 = num(), num(); x, y = num(), num()
            x1, y1 = 2*cx - c1x, 2*cy - c1y
            x2, y2 = (x2+cx, y2+cy) if rel else (x2, y2)
            x, y = (x+cx, y+cy) if rel else (x, y)
            cur.extend(flatten_cubic(cx, cy, x1, y1, x2, y2, x, y, tol)[1:])
            c1x, c1y = x2, y2
            cx, cy = x, y
        elif C == 'Q':
            x1, y1 = num(), num(); x, y = num(), num()
            x1, y1 = (x1+cx, y1+cy) if rel else (x1, y1)
            x, y = (x+cx, y+cy) if rel else (x, y)
            cur.extend(flatten_quad(cx, cy, x1, y1, x, y, tol)[1:])
            c1x, c1y = x1, y1
            cx, cy = x, y
        elif C == 'T':
            x, y = num(), num()
            x1, y1 = 2*cx - c1x, 2*cy - c1y
            x, y = (x+cx, y+cy) if rel else (x, y)
            cur.extend(flatten_quad(cx, cy, x1, y1, x, y, tol)[1:])
            c1x, c1y = x1, y1
            cx, cy = x, y
        elif C == 'A':
            rx, ry = num(), num(); rot = num(); large = num(); sweep = num(); x, y = num(), num()
            x, y = (x+cx, y+cy) if rel else (x, y)
            cur.extend(arc_pts(cx, cy, rx, ry, rot, large, sweep, x, y, tol)[1:])
            cx, cy = x, y
            c1x, c1y = x, y
        else:
            cmd = ''
            i += 1
    if cur:
        subs.append(cur)
    return [s for s in subs if len(s) >= 2]


# ---------------------------------------------------------------- obrys linii (miter)
def _norm(dx, dy):
    l = math.hypot(dx, dy)
    return (dx/l, dy/l) if l > 1e-12 else (1.0, 0.0)


def _miter(a1, b1, a2, b2, pc, r):
    """Punkt przecięcia linii a1->b1 i a2->b2 (join miter z limitem odległości
    od wierzchołka pc: max 4*r, jak miterlimit=4 w SVG)."""
    d1 = (b1[0]-a1[0], b1[1]-a1[1])
    d2 = (b2[0]-a2[0], b2[1]-a2[1])
    cross = d1[0]*d2[1] - d1[1]*d2[0]
    if abs(cross) < 1e-9:
        return b1
    t = ((a2[0]-a1[0])*d2[1] - (a2[1]-a1[1])*d2[0]) / cross
    m = (a1[0]+t*d1[0], a1[1]+t*d1[1])
    if math.hypot(m[0]-pc[0], m[1]-pc[1]) > 4.0 * r + 1e-9:
        return None      # zbyt długi szpic -> bevel (dwa punkty)
    return m



def stroke_loops(poly, r):
    """Zwraca listę pętli (obrysów) linii o grubości 2r — do wypełnienia even-odd."""
    pts = [tuple(map(float, p)) for p in poly]
    if len(pts) < 2:
        return []
    closed = pts[0] == pts[-1]
    if closed:
        pts = pts[:-1]
        n = len(pts)
        if n < 3:
            return []
        left, right = [], []
        for i in range(n):
            pm, pc, pn = pts[i-1], pts[i], pts[(i+1) % n]
            d_prev = _norm(pc[0]-pm[0], pc[1]-pm[1])
            d_next = _norm(pn[0]-pc[0], pn[1]-pc[1])
            n_prev = (-d_prev[1], d_prev[0])
            n_next = (-d_next[1], d_next[0])
            a_prev = (pm[0]+r*n_prev[0], pm[1]+r*n_prev[1])
            b_prev = (pc[0]+r*n_prev[0], pc[1]+r*n_prev[1])
            a_next = (pc[0]+r*n_next[0], pc[1]+r*n_next[1])
            b_next = (pn[0]+r*n_next[0], pn[1]+r*n_next[1])
            m = _miter(a_prev, b_prev, a_next, b_next, pc, r)
            if m is None:
                left.append(b_prev); left.append(a_next)
            else:
                left.append(m)
            a_prev2 = (pm[0]-r*n_prev[0], pm[1]-r*n_prev[1])
            b_prev2 = (pc[0]-r*n_prev[0], pc[1]-r*n_prev[1])
            a_next2 = (pc[0]-r*n_next[0], pc[1]-r*n_next[1])
            b_next2 = (pn[0]-r*n_next[0], pn[1]-r*n_next[1])
            m2 = _miter(a_prev2, b_prev2, a_next2, b_next2, pc, r)
            if m2 is None:
                right.append(b_prev2); right.append(a_next2)
            else:
                right.append(m2)
        return [left, right[::-1]]
    n = len(pts)
    left, right = [], []
    for i in range(n):
        if i == 0:
            d = _norm(pts[1][0]-pts[0][0], pts[1][1]-pts[0][1])
            n_ = (-d[1], d[0])
            left.append((pts[0][0]+r*n_[0], pts[0][1]+r*n_[1]))
            right.append((pts[0][0]-r*n_[0], pts[0][1]-r*n_[1]))
        elif i == n-1:
            d = _norm(pts[-1][0]-pts[-2][0], pts[-1][1]-pts[-2][1])
            n_ = (-d[1], d[0])
            left.append((pts[-1][0]+r*n_[0], pts[-1][1]+r*n_[1]))
            right.append((pts[-1][0]-r*n_[0], pts[-1][1]-r*n_[1]))
        else:
            pm, pc, pn = pts[i-1], pts[i], pts[i+1]
            d_prev = _norm(pc[0]-pm[0], pc[1]-pm[1])
            d_next = _norm(pn[0]-pc[0], pn[1]-pc[1])
            n_prev = (-d_prev[1], d_prev[0])
            n_next = (-d_next[1], d_next[0])
            m = _miter((pm[0]+r*n_prev[0], pm[1]+r*n_prev[1]), (pc[0]+r*n_prev[0], pc[1]+r*n_prev[1]),
                       (pc[0]+r*n_next[0], pc[1]+r*n_next[1]), (pn[0]+r*n_next[0], pn[1]+r*n_next[1]), pc, r)
            if m is None:
                left.append((pc[0]+r*n_prev[0], pc[1]+r*n_prev[1]))
                left.append((pc[0]+r*n_next[0], pc[1]+r*n_next[1]))
            else:
                left.append(m)
            m2 = _miter((pm[0]-r*n_prev[0], pm[1]-r*n_prev[1]), (pc[0]-r*n_prev[0], pc[1]-r*n_prev[1]),
                        (pc[0]-r*n_next[0], pc[1]-r*n_next[1]), (pn[0]-r*n_next[0], pn[1]-r*n_next[1]), pc, r)
            if m2 is None:
                right.append((pc[0]-r*n_prev[0], pc[1]-r*n_prev[1]))
                right.append((pc[0]-r*n_next[0], pc[1]-r*n_next[1]))
            else:
                right.append(m2)
    return [left + right[::-1]]


# ---------------------------------------------------------------- wypełnianie even-odd (poprawne)
def fill_evenodd(loops, W, H):
    """Wypełnienie even-odd listy pętli (wsp. pikselowe) do maski bytearray.
    Krawędzie poziome obsługiwane poprawnie (zmiana parzystości na ich końcach)."""
    mask = bytearray(W * H)
    edges = []
    for poly in loops:
        pts = list(poly)
        if pts and pts[0] != pts[-1]:
            pts.append(pts[0])          # domknij pętlę (krawędź ostatni->pierwszy)
        for a, b in zip(pts, pts[1:]):
            x1, y1, x2, y2 = a[0], a[1], b[0], b[1]
            if y1 == y2:
                continue
            if y1 > y2:
                x1, y1, x2, y2 = x2, y2, x1, y1
            if y2 <= 0 or y1 >= H:
                continue
            edges.append([y1, y2, x1, (x2-x1)/(y2-y1)])
    edges.sort(key=lambda e: e[0])
    idx = 0
    active = []
    n = len(edges)
    for y in range(H):
        while idx < n and edges[idx][0] <= y + 0.5:
            active.append(edges[idx])
            idx += 1
        if not active:
            continue
        active = [e for e in active if e[1] > y + 0.5]
        if not active:
            continue
        xs = [e[2] for e in active]
        xs.sort()
        row = y * W
        for k in range(0, len(xs) - 1, 2):
            xa = int(math.ceil(xs[k]))
            xb = int(math.floor(xs[k+1]))
            if xb >= W:
                xb = W - 1
            if xa < 0:
                xa = 0
            for x in range(xa, xb + 1):
                mask[row + x] = 255
        for e in active:
            e[2] += e[3]
    return mask


# ---------------------------------------------------------------- maski
def or_into(mask, other):
    a = memoryview(mask)
    b = memoryview(other)
    for i in range(0, len(mask), 4096):
        ch = slice(i, min(i + 4096, len(mask)))
        va = int.from_bytes(a[ch], 'little')
        vb = int.from_bytes(b[ch], 'little')
        mask[ch.start:ch.stop] = (va | vb).to_bytes(ch.stop - ch.start, 'little')


def fill_into(mask, poly_px, W, H):
    """Wypełnia jeden WYPUKŁY wielokąt (piksele) w masce (negatyw: 255=tło, 0=linia).
    Działa lokalnie (bbox wielokąta) — szybkie i bez artefaktów parzystości."""
    if len(poly_px) < 3:
        return
    xs = [p[0] for p in poly_px]
    ys = [p[1] for p in poly_px]
    x0 = max(0, int(min(xs)) - 1)
    x1 = min(W - 1, int(max(xs)) + 1)
    y0 = max(0, int(min(ys)) - 1)
    y1 = min(H - 1, int(max(ys)) + 1)
    if x0 > x1 or y0 > y1:
        return
    w = x1 - x0 + 1
    h = y1 - y0 + 1
    local = bytearray(w * h)
    edges = []
    pts = list(poly_px)
    if pts[0] != pts[-1]:
        pts.append(pts[0])
    for a, b in zip(pts, pts[1:]):
        xa, ya, xb, yb = a[0], a[1], b[0], b[1]
        if ya == yb:
            continue
        if ya > yb:
            xa, ya, xb, yb = xb, yb, xa, ya
        if yb <= y0 or ya >= y1 + 1:
            continue
        edges.append([ya, yb, xa, (xb - xa) / (yb - ya)])
    if not edges:
        return
    edges.sort(key=lambda e: e[0])
    idx = 0
    active = []
    for y in range(y0, y1 + 1):
        while idx < len(edges) and edges[idx][0] <= y + 0.5:
            active.append(edges[idx])
            idx += 1
        if not active:
            continue
        active = [e for e in active if e[1] > y + 0.5]
        if not active:
            continue
        xs2 = sorted(e[2] for e in active)
        row = (y - y0) * w
        for k in range(0, len(xs2) - 1, 2):
            xa2 = max(x0, int(math.ceil(xs2[k])) - 1)     # -1/+1 zabija 1px szwy
            xb2 = min(x1, int(math.floor(xs2[k + 1])) + 1)
            for x in range(xa2, xb2 + 1):
                local[row + x - x0] = 255
        for e in active:
            e[2] += e[3]
    for yy in range(h):
        base = (y0 + yy) * W + x0
        lb = yy * w
        for xx in range(w):
            if local[lb + xx]:
                mask[base + xx] = 0


def render_elements(elements):
    """elements: lista [(subpaths, transform, stroke_width)] w układzie 200x200 mm.
    Zwraca obraz PIL 'L': 0 = czerń (linia), 255 = biel (tło).
    Metoda: suma (OR) quadów segmentów + trójkątów mitrów (wypukłe narożniki) —
    dokładny obrys linii miter (miterlimit 4), bez samoprzecinań."""
    mask = bytearray(SIZE * SIZE)
    mask[:] = b'\xff' * (SIZE * SIZE)
    for subs, m, sw in elements:
        if m is None:
            m = (1, 0, 0, 1, 0, 0)
        # szerokość linii skaluje się z transformem elementu (jak w Inkscape)
        sc = (math.hypot(m[0], m[1]) + math.hypot(m[2], m[3])) / 2.0
        if sc <= 0:
            sc = 1.0
        r_px = max(0.4, (sw / 2.0) * sc * S)
        r_mm = r_px / S
        for sub in subs:
            poly = [tx_pt(m, px, py) for px, py in sub]
            if len(poly) < 2:
                continue
            closed = poly[0] == poly[-1]
            if closed:
                poly = poly[:-1]
                n = len(poly)
                if n < 3:
                    continue
                # quady wszystkich krawędzi
                for i in range(n):
                    a, b = poly[i], poly[(i + 1) % n]
                    d = _norm(b[0] - a[0], b[1] - a[1])
                    nrm = (-d[1], d[0])
                    quad = [(a[0] + nrm[0] * r_mm, a[1] + nrm[1] * r_mm),
                            (b[0] + nrm[0] * r_mm, b[1] + nrm[1] * r_mm),
                            (b[0] - nrm[0] * r_mm, b[1] - nrm[1] * r_mm),
                            (a[0] - nrm[0] * r_mm, a[1] - nrm[1] * r_mm)]
                    fill_into(mask, [(x * S, y * S) for x, y in quad], SIZE, SIZE)
                # mitry przy narożnikach wypukłych (obie strony)
                for i in range(n):
                    pc = poly[i]
                    pm = poly[i - 1]
                    pn = poly[(i + 1) % n]
                    d_prev = _norm(pc[0] - pm[0], pc[1] - pm[1])
                    d_next = _norm(pn[0] - pc[0], pn[1] - pc[1])
                    n_prev = (-d_prev[1], d_prev[0])
                    n_next = (-d_next[1], d_next[0])
                    bis = (n_prev[0] + n_next[0], n_prev[1] + n_next[1])
                    for sgn in (1, -1):
                        a_prev = (pm[0] + sgn * r_mm * n_prev[0], pm[1] + sgn * r_mm * n_prev[1])
                        b_prev = (pc[0] + sgn * r_mm * n_prev[0], pc[1] + sgn * r_mm * n_prev[1])
                        a_next = (pc[0] + sgn * r_mm * n_next[0], pc[1] + sgn * r_mm * n_next[1])
                        b_next = (pn[0] + sgn * r_mm * n_next[0], pn[1] + sgn * r_mm * n_next[1])
                        mm = _miter(a_prev, b_prev, a_next, b_next, pc, r_mm)
                        if mm is None:
                            continue
                        # wypukły tylko, gdy mitra wychodzi na zewnątrz narożnika
                        if (mm[0] - pc[0]) * bis[0] + (mm[1] - pc[1]) * bis[1] > 0:
                            tri = [b_prev, mm, a_next]
                            fill_into(mask, [(x * S, y * S) for x, y in tri], SIZE, SIZE)
            else:
                for a, b in zip(poly, poly[1:]):
                    d = _norm(b[0] - a[0], b[1] - a[1])
                    nrm = (-d[1], d[0])
                    quad = [(a[0] + nrm[0] * r_mm, a[1] + nrm[1] * r_mm),
                            (b[0] + nrm[0] * r_mm, b[1] + nrm[1] * r_mm),
                            (b[0] - nrm[0] * r_mm, b[1] - nrm[1] * r_mm),
                            (a[0] - nrm[0] * r_mm, a[1] - nrm[1] * r_mm)]
                    fill_into(mask, [(x * S, y * S) for x, y in quad], SIZE, SIZE)
    return Image.frombytes('L', (SIZE, SIZE), bytes(mask))


# ---------------------------------------------------------------- parsowanie SVG
TAG_RE = re.compile(r'<(path|rect|circle|ellipse|polygon|polyline|line|use|text)\b([^>]*?)(/?)>')
UNSUPPORTED = set()


def layer_body(svg, layer_tag):
    """Fragment dokumentu między <g layer> a zamykającym go </g>."""
    m = re.search(re.escape(layer_tag), svg)
    if not m:
        return ''
    rest = svg[m.end():]
    depth = 1
    for mm in re.finditer(r'<g\b|</g>', rest):
        depth += 1 if mm.group(0) == '<g' else -1
        if depth == 0:
            return rest[:mm.end()]
    return rest


def parse_layer(svg, label):
    layer_tag = None
    for m in re.finditer(r'<g\s+[^>]*inkscape:groupmode="layer"[^>]*>', svg):
        if f'inkscape:label="{label}"' in m.group(0):
            layer_tag = m.group(0)
            break
    if not layer_tag:
        return []
    body = layer_body(svg, layer_tag)
    elements = []
    for m in TAG_RE.finditer(body):
        tag, attrs = m.group(1), m.group(2)
        st = re.search(r'style="([^"]*)"', attrs)
        style = st.group(1) if st else ''
        if re.search(r'display:\s*none|visibility:\s*hidden', style):
            continue
        transform = None
        tr = re.search(r'transform="([^"]*)"', attrs)
        if tr:
            transform = parse_transform(tr.group(1))
            # podkłady arkusza roboczego (754x378 mm, skala mm->px) — pomiń
            if re.search(r'scale\(\s*0\.2645', tr.group(1)):
                continue
        stroke_m = re.search(r'stroke:([^;"]+)', style)
        stroke = stroke_m.group(1) if stroke_m else 'none'
        sw_m = re.search(r'stroke-width:([^;"]+)', style)
        sw = float(sw_m.group(1)) if sw_m else 0.3
        if stroke in ('none', 'None') or sw <= 0:
            continue
        dash_m = re.search(r'stroke-dasharray:([^;"]+)', style)
        dash = dash_m.group(1) if dash_m else 'none'
        if dash not in ('none', 'None'):
            print(f'  uwaga: {label}: stroke-dasharray={dash} — renderuję linią ciągłą')
        if tag == 'path':
            d_m = re.search(r'\bd="([^"]*)"', attrs)
            if not d_m:
                continue
            subs = parse_path2(d_m.group(1))
            elements.append((subs, transform, sw))
        elif tag == 'rect':
            x_m = re.search(r'\bx="([^"]*)"', attrs)
            y_m = re.search(r'\by="([^"]*)"', attrs)
            w_m = re.search(r'\bwidth="([^"]*)"', attrs)
            h_m = re.search(r'\bheight="([^"]*)"', attrs)
            x = float(x_m.group(1)) if x_m else 0.0
            y = float(y_m.group(1)) if y_m else 0.0
            w = float(w_m.group(1)) if w_m else 0.0
            h = float(h_m.group(1)) if h_m else 0.0
            if w <= 0 or h <= 0:
                continue
            poly = [[(x, y), (x + w, y), (x + w, y + h), (x, y + h), (x, y)]]
            elements.append((poly, transform, sw))
        else:
            UNSUPPORTED.add(tag)
    return elements


# ---------------------------------------------------------------- montaż
def montage(imgs, labels, out_path):
    cell = 800
    pad = 60
    cols, rows = 3, 2
    W = cols * cell + (cols + 1) * pad
    H = rows * cell + (rows + 1) * pad + 40
    canvas = Image.new('L', (W, H), 255)
    d = ImageDraw.Draw(canvas)
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 30)
    for k, (im, lab) in enumerate(zip(imgs, labels)):
        r_, c_ = divmod(k, cols)
        x = pad + c_ * (cell + pad)
        y = pad + r_ * (cell + pad)
        canvas.paste(im.resize((cell, cell), Image.LANCZOS), (x, y))
        d.text((x, y - 44), lab, fill=0, font=font)
    canvas.save(out_path)


def main():
    svg = open(SRC, encoding='utf-8').read()
    os.makedirs(OUT, exist_ok=True)
    layers = re.findall(r'inkscape:label="(L\d)"', svg)
    print('Warstwy w pliku:', layers)
    # Nazwy opisowe wg zawartości wskazanej przez użytkownika (30.08.2026):
    #   plik L0 = rama/niebo (panel tła)         | user: L4/L5 = rozgwieżdżone niebo (gwiazdy: plik L5)
    #   plik L1 = pasterze i 2 owce              | user: L0
    #   plik L2 = Święta Rodzina + 2 owce + 2 anioły | user: L1
    #   plik L3 = owca, koza, 2 płoty + zarys szopki | user: L2
    #   plik L4 = krowa i osioł + zarys szopki + chmury | user: L3
    #   plik L5 = rozgwieżdżone niebo            | user: L4
    names = {
        'L0': 'L0-niebo-rama',
        'L1': 'L1-pasterze-i-2-owce',
        'L2': 'L2-swieta-rodzina-2-owce-2-anioly',
        'L3': 'L3-owca-koza-2-ploty-zarys-szopki',
        'L4': 'L4-krowa-osiol-zarys-szopki-chmury',
        'L5': 'L5-rozgwiezdzone-niebo',
    }
    imgs, labels = [], []
    for label in ['L0', 'L1', 'L2', 'L3', 'L4', 'L5']:
        if label not in layers:
            print(f'{label}: BRAK w pliku — pomijam')
            continue
        elements = parse_layer(svg, label)
        print(f'{label}: {len(elements)} elementów')
        im = render_elements(elements)
        if im.getbbox() is None:
            print(f'  !!! {label}: warstwa pusta')
        out = os.path.join(OUT, f'{names[label]}.png')
        im.save(out)
        print(f'  -> {out}')
        imgs.append(im)
        labels.append(names[label])
    if UNSUPPORTED:
        print('Nieobsłużone tagi:', sorted(UNSUPPORTED))
    mont = os.path.join(OUT, 'PRZEGLAD-6-warstw.png')
    montage(imgs, labels, mont)
    print('Montaż ->', mont)


if __name__ == '__main__':
    main()
