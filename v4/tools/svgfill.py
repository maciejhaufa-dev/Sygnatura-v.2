#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Minimalny renderer SVG (fill) w czystym Pythonie — do wizualizacji szopki.
Obsługuje: path (M L H V C S Q T A Z + relatywne), rect, transformy (matrix,
translate, scale, rotate), wypełnianie even-odd metodą scanline (AET).
Zwraca maski PIL (0/255) — dokładna geometria wektorów użytkownika."""
import re
import math
from PIL import Image

NUM = r'[-+]?(?:\d+\.\d*|\.\d+|\d+)(?:[eE][-+]?\d+)?'
TOKEN = re.compile(rf'[a-zA-Z]|{NUM}')


# ---------------------------------------------------------------- transformy
def mat_mul(a, b):
    return (a[0]*b[0] + a[2]*b[1], a[1]*b[0] + a[3]*b[1],
            a[0]*b[2] + a[2]*b[3], a[1]*b[2] + a[3]*b[3],
            a[0]*b[4] + a[2]*b[5] + a[4], a[1]*b[4] + a[3]*b[5] + a[5])


def parse_transform(s):
    if not s:
        return (1, 0, 0, 1, 0, 0)
    m = (1, 0, 0, 1, 0, 0)
    for fn, args in re.findall(r'(\w+)\s*\(([^)]*)\)', s):
        a = [float(x) for x in re.findall(NUM, args)]
        if fn == 'matrix' and len(a) == 6:
            t = tuple(a)
        elif fn == 'translate':
            t = (1, 0, 0, 1, a[0], a[1] if len(a) > 1 else 0)
        elif fn == 'scale':
            t = (a[0], 0, 0, a[1] if len(a) > 1 else a[0], 0, 0)
        elif fn == 'rotate':
            ang = math.radians(a[0])
            c, s = math.cos(ang), math.sin(ang)
            t = (c, s, -s, c, 0, 0)
            if len(a) > 2:
                cx, cy = a[1], a[2]
                t = mat_mul(mat_mul((1, 0, 0, 1, cx, cy), t), (1, 0, 0, 1, -cx, -cy))
        else:
            continue
        m = mat_mul(m, t)
    return m


def tx_pt(m, x, y):
    return (m[0]*x + m[2]*y + m[4], m[1]*x + m[3]*y + m[5])


# ---------------------------------------------------------------- łuki
def arc_to_center(x1, y1, rx, ry, rot, large, sweep, x2, y2):
    phi = math.radians(rot)
    cosp, sinp = math.cos(phi), math.sin(phi)
    dx, dy = (x1 - x2) / 2, (y1 - y2) / 2
    x1p = cosp*dx + sinp*dy
    y1p = -sinp*dx + cosp*dy
    rx, ry = abs(rx), abs(ry)
    lam = (x1p*x1p)/(rx*rx) + (y1p*y1p)/(ry*ry)
    if lam > 1:
        rx *= math.sqrt(lam)
        ry *= math.sqrt(lam)
    num = max(0.0, rx*rx*ry*ry - rx*rx*y1p*y1p - ry*ry*x1p*x1p)
    den = rx*rx*y1p*y1p + ry*ry*x1p*x1p
    coef = math.sqrt(num/den) if den > 0 else 0.0
    if large == sweep:
        coef = -coef
    cxp, cyp = coef*(rx*y1p/ry), coef*(-ry*x1p/rx)
    cx = cosp*cxp - sinp*cyp + (x1+x2)/2
    cy = sinp*cxp + cosp*cyp + (y1+y2)/2

    def ang(ux, uy, vx, vy):
        dot = ux*vx + uy*vy
        cr = ux*vy - uy*vx
        a = math.atan2(cr, dot)
        return a % (2*math.pi)
    th1 = ang(1, 0, (x1p-cxp)/rx, (y1p-cyp)/ry)
    dth = ang((x1p-cxp)/rx, (y1p-cyp)/ry, (-x1p-cxp)/rx, (-y1p-cyp)/ry)
    if not sweep and dth > 0:
        dth -= 2*math.pi
    elif sweep and dth < 0:
        dth += 2*math.pi
    return cx, cy, rx, ry, cosp, sinp, th1, dth


def arc_pts(x1, y1, rx, ry, rot, large, sweep, x2, y2, tol=0.6):
    cx, cy, rx2, ry2, cosp, sinp, th1, dth = arc_to_center(x1, y1, rx, ry, rot, large, sweep, x2, y2)
    rmax = max(rx2, ry2)
    steps = max(8, int(abs(dth) * rmax / (tol*4)))
    out = []
    for i in range(steps + 1):
        t = th1 + dth * i / steps
        ct, st = math.cos(t), math.sin(t)
        out.append((cx + cosp*rx2*ct - sinp*ry2*st, cy + sinp*rx2*ct + cosp*ry2*st))
    return out


# ---------------------------------------------------------------- path
def parse_path(d, tol=0.6):
    """Zwraca listę podścieżek: każda = lista punktów (x,y) po wygładzeniu."""
    tokens = TOKEN.findall(d)
    subs, cur = [], []
    i = 0
    cmd = ''
    cx = cy = sx = sy = 0.0   # bieżący punkt i start podścieżki
    c1x = c1y = 0.0           # ostatnia kontrolna (dla S/T)
    first_pt = None

    def start_pt():
        nonlocal first_pt, sx, sy
        first_pt = cur[-1] if cur else None

    while i < len(tokens):
        t = tokens[i]
        if re.fullmatch(r'[a-zA-Z]', t):
            cmd = t
            i += 1
        rel = cmd.islower()
        C = cmd.upper()

        def num():
            nonlocal i
            v = float(tokens[i]); i += 1
            return v

        def cur_pt():
            return (cx, cy)

        if C == 'M':
            x, y = num(), num()
            x, y = (x+cx, y+cy) if rel else (x, y)
            if cur:
                subs.append(cur)
            cur = [(x, y)]
            cx, cy, sx, sy = x, y, x, y
            c1x, c1y = x, y
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
            i += 1
    if cur:
        subs.append(cur)
    return [s for s in subs if len(s) >= 3]


def flatten_cubic(x0, y0, x1, y1, x2, y2, x3, y3, tol):
    pts = [(x0, y0), (x1, y1), (x2, y2), (x3, y3)]

    def flat(p0, p1, p2, p3):
        # odległość punktów kontrolnych od cięciwy
        dx, dy = p3[0]-p0[0], p3[1]-p0[1]
        L2 = dx*dx + dy*dy
        if L2 == 0:
            return max(math.hypot(p1[0]-p0[0], p1[1]-p0[1]),
                       math.hypot(p2[0]-p0[0], p2[1]-p0[1])) <= tol
        t = max(0.0, min(1.0, ((p1[0]-p0[0])*dx + (p1[1]-p0[1])*dy) / L2))
        bx, by = p0[0] + t*dx, p0[1] + t*dy
        d1 = math.hypot(p1[0]-bx, p1[1]-by)
        t2 = max(0.0, min(1.0, ((p2[0]-p0[0])*dx + (p2[1]-p0[1])*dy) / L2))
        bx2, by2 = p0[0] + t2*dx, p0[1] + t2*dy
        d2 = math.hypot(p2[0]-bx2, p2[1]-by2)
        return max(d1, d2) <= tol

    stack = [(pts, 0)]
    out = [pts[0]]
    while stack:
        seg, depth = stack.pop()
        if flat(*seg) or depth > 18:
            out.append(seg[3])
            continue
        p0, p1, p2, p3 = seg
        p01 = ((p0[0]+p1[0])/2, (p0[1]+p1[1])/2)
        p12 = ((p1[0]+p2[0])/2, (p1[1]+p2[1])/2)
        p23 = ((p2[0]+p3[0])/2, (p2[1]+p3[1])/2)
        p012 = ((p01[0]+p12[0])/2, (p01[1]+p12[1])/2)
        p123 = ((p12[0]+p23[0])/2, (p12[1]+p23[1])/2)
        mid = ((p012[0]+p123[0])/2, (p012[1]+p123[1])/2)
        stack.append(((p0, p01, p012, mid), depth+1))
        stack.append(((mid, p123, p23, p3), depth+1))
    return out


def flatten_quad(x0, y0, x1, y1, x2, y2, tol):
    c1x = x0 + 2*(x1-x0)/3
    c1y = y0 + 2*(y1-y0)/3
    c2x = x2 + 2*(x1-x2)/3
    c2y = y2 + 2*(y1-y2)/3
    return flatten_cubic(x0, y0, c1x, c1y, c2x, c2y, x2, y2, tol)


# ---------------------------------------------------------------- scanline fill
def fill_mask(subpaths, W, H):
    """Wypełnienie even-odd listy podścieżek (wsp. pikselowe) do maski bytearray."""
    edges = []
    for poly in subpaths:
        for a, b in zip(poly, poly[1:]):
            x1, y1 = a
            x2, y2 = b
            if y1 == y2:
                continue
            if y1 > y2:
                x1, y1, x2, y2 = x2, y2, x1, y1
            if y2 <= 0 or y1 >= H:
                continue
            edges.append([y1, y2, x1, (x2-x1)/(y2-y1)])
    edges.sort(key=lambda e: e[0])
    mask = bytearray(W*H)
    idx = 0
    active = []
    n = len(edges)
    for y in range(H):
        while idx < n and edges[idx][0] <= y + 0.5:
            active.append(edges[idx])
            idx += 1
        if active:
            active = [e for e in active if e[1] > y + 0.5]
            if active:
                xs = [e[2] for e in active]
                xs.sort()
                row = y*W
                for k in range(0, len(xs)-1, 2):
                    xa = int(math.ceil(xs[k]))
                    xb = int(math.floor(xs[k+1]))
                    if xb >= W:
                        xb = W-1
                    if xa < 0:
                        xa = 0
                    for x in range(xa, xb+1):
                        mask[row+x] = 255
                for e in active:
                    e[2] += e[3]
    return mask


# ---------------------------------------------------------------- publiczne
def render_layer_shapes(shapes, size=2400, tol=0.5):
    """shapes: lista [(subpaths, transform)] w układzie 200×200 mm.
    Zwraca maskę PIL 'L' (0= tło, 255= drewno)."""
    W = H = size
    S = size / 200.0
    mask = bytearray(W*H)
    for subs, m in shapes:
        if m is None:
            m = (1, 0, 0, 1, 0, 0)
        poly = [[(x*S, y*S) for x, y in (tx_pt(m, px, py) for px, py in sub)] for sub in subs]
        layer = fill_mask(poly, W, H)
        # połączenie OR
        a = memoryview(mask)
        b = memoryview(layer)
        for i in range(0, len(mask), 4096):
            chunk = slice(i, min(i+4096, len(mask)))
            # bytearray nie ma vectorized OR — użyj int.from_bytes
            va = int.from_bytes(a[chunk], 'little')
            vb = int.from_bytes(b[chunk], 'little')
            mask[chunk.start:chunk.stop] = (va | vb).to_bytes(chunk.stop-chunk.start, 'little')
    return Image.frombytes('L', (W, H), bytes(mask))


def rect_poly(x, y, w, h, rx=0, ry=None):
    if ry is None:
        ry = rx
    rx = min(rx, w/2)
    ry = min(ry, h/2)
    if rx <= 0 and ry <= 0:
        return [[(x, y), (x+w, y), (x+w, y+h), (x, y+h), (x, y)]]
    pts = [(x+rx, y), (x+w-rx, y)]
    pts += arc_pts(x+w-rx, y+ry, rx, ry, 0, 0, 1, x+w-rx, y, tol=0.3)
    pts += arc_pts(x+w, y+ry, rx, ry, 0, 0, 1, x+w-rx, y, tol=0.3)[::-1]
    pts += arc_pts(x+w-rx, y+h, rx, ry, 0, 0, 1, x+w-rx, y+h-ry, tol=0.3)
    pts += arc_pts(x, y+h-ry, rx, ry, 0, 0, 1, x+rx, y+h, tol=0.3)[::-1]
    pts += arc_pts(x+rx, y+h-ry, rx, ry, 0, 0, 1, x, y+h-ry, tol=0.3)
    pts += arc_pts(x, y+ry, rx, ry, 0, 0, 1, x, y, tol=0.3)[::-1]
    pts.append(pts[0])
    return [pts]
