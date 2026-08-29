#!/usr/bin/env python3
"""Makiety warstw szopki — czarny wypełniony kształt na białym. Nie pliki cięcia."""
from pathlib import Path

OUT = Path(__file__).resolve().parent
W, H = 194, 189  # mm jak CIECIE
SCALE = 4  # px/mm → 776×756


def svg(body, w=W, h=H):
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{w}mm" height="{h}mm" viewBox="0 0 {w} {h}">
  <rect width="{w}" height="{h}" fill="#fff"/>
  {body}
</svg>
'''


def L1():
    # plotek + 3 owce, góra pusta
    fence = []
    for x in range(8, 186, 9):
        fence.append(f'<rect x="{x}" y="118" width="2.2" height="42" fill="#000"/>')
    fence.append('<rect x="6" y="116" width="182" height="3" fill="#000"/>')
    fence.append('<rect x="6" y="136" width="182" height="2.4" fill="#000"/>')
    ground = '<path d="M0 158 C40 152 90 160 194 154 L194 189 L0 189 Z" fill="#000"/>'
    # owce — proste bryły (makieta)
    def sheep(cx, cy, s=1, flip=1):
        e = f'<g transform="translate({cx},{cy}) scale({flip*s},{s})">'
        e += '<ellipse cx="0" cy="0" rx="16" ry="11" fill="#000"/>'
        e += '<circle cx="14" cy="-4" r="6" fill="#000"/>'
        e += '<rect x="-10" y="8" width="3" height="8" fill="#000"/>'
        e += '<rect x="6" y="8" width="3" height="8" fill="#000"/>'
        e += '</g>'
        return e
    return "\n".join(fence) + ground + sheep(38, 150, 1.05, 1) + sheep(88, 148, 0.85, -1) + sheep(148, 152, 0.95, 1)


def L2():
    # ziemia, żłóbek, Maryja, Józef, chmury boki
    ground = '<path d="M0 150 C50 144 140 148 194 142 L194 189 L0 189 Z" fill="#000"/>'
    crib = '''
    <g transform="translate(97,148)">
      <path d="M-18 8 L-14 -6 L14 -6 L18 8 Z" fill="#000"/>
      <rect x="-16" y="-2" width="32" height="3" fill="#fff"/>
      <ellipse cx="0" cy="-10" rx="7" ry="4" fill="#000"/>
    </g>'''
    mary = '''
    <g transform="translate(72,128)">
      <path d="M0 38 C-16 38 -18 20 -12 8 C-18 -2 -10 -18 0 -20 C10 -18 18 -2 12 8 C18 20 16 38 0 38 Z" fill="#000"/>
      <circle cx="0" cy="-22" r="7" fill="#000"/>
    </g>'''
    jozef = '''
    <g transform="translate(124,122)">
      <path d="M0 48 C-14 48 -16 22 -10 8 C-8 -6 8 -6 10 8 C16 22 14 48 0 48 Z" fill="#000"/>
      <circle cx="0" cy="-10" r="6.5" fill="#000"/>
      <rect x="10" y="-8" width="2.4" height="52" fill="#000"/>
    </g>'''
    clouds = '''
    <g fill="#000">
      <ellipse cx="28" cy="38" rx="22" ry="10"/>
      <ellipse cx="44" cy="34" rx="16" ry="9"/>
      <ellipse cx="16" cy="34" rx="12" ry="7"/>
      <ellipse cx="166" cy="42" rx="24" ry="11"/>
      <ellipse cx="150" cy="36" rx="14" ry="8"/>
      <ellipse cx="178" cy="36" rx="12" ry="7"/>
    </g>'''
    return ground + crib + mary + jozef + clouds


def L3():
    ground = '<path d="M0 145 C70 138 130 142 194 140 L194 189 L0 189 Z" fill="#000"/>'
    ox = '''
    <g transform="translate(58,138)">
      <ellipse cx="0" cy="0" rx="28" ry="16" fill="#000"/>
      <circle cx="24" cy="-8" r="10" fill="#000"/>
      <path d="M28 -16 L38 -22 L32 -10 Z" fill="#000"/>
      <rect x="-18" y="12" width="5" height="14" fill="#000"/>
      <rect x="8" y="12" width="5" height="14" fill="#000"/>
    </g>'''
    donkey = '''
    <g transform="translate(140,140)">
      <ellipse cx="0" cy="2" rx="22" ry="13" fill="#000"/>
      <ellipse cx="20" cy="-6" rx="8" ry="7" fill="#000"/>
      <rect x="22" y="-18" width="3.2" height="12" fill="#000"/>
      <rect x="16" y="-17" width="3.2" height="10" fill="#000"/>
      <rect x="-14" y="12" width="4" height="16" fill="#000"/>
      <rect x="6" y="12" width="4" height="16" fill="#000"/>
    </g>'''
    return ground + ox + donkey


def L4():
    # stajnia — dach góruje, łuk, niebo nad okapem zostaje (białe = powietrze)
    wall = '''
    <path fill="#000" d="
      M8 178 L8 78 L97 18 L186 78 L186 178
      L148 178 L148 92
      A51 58 0 0 0 46 92
      L46 178 Z"/>
    <rect x="22" y="88" width="16" height="22" fill="#fff"/>
    <rect x="156" y="88" width="16" height="22" fill="#fff"/>
    <polygon points="97,18 97,48 88,78 106,78" fill="#000"/>
    '''
    return wall


def L5():
    stars = ['<rect width="194" height="189" fill="#000"/>']
    # bethlehem
    stars.append('<polygon fill="#fff" points="97,28 101,42 116,42 104,50 108,64 97,54 86,64 90,50 78,42 93,42"/>')
    for cx, cy, r in [
        (28, 22, 2.2), (48, 48, 1.4), (160, 26, 2), (178, 52, 1.2),
        (22, 70, 1.1), (70, 18, 1.6), (130, 16, 1.3), (150, 70, 1.0),
        (40, 100, 0.8), (170, 96, 0.9), (88, 8, 1.1), (110, 80, 0.7),
        (60, 64, 0.6), (14, 40, 0.7), (184, 80, 0.6),
    ]:
        stars.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#fff"/>')
    return "\n".join(stars)


def L6():
    return '''
    <rect width="194" height="189" fill="#000"/>
    <rect x="62" y="158" width="70" height="22" fill="#fff"/>
    <circle cx="16" cy="170" r="3" fill="#fff"/>
    <circle cx="178" cy="170" r="3" fill="#fff"/>
    '''


def L7():
    return '''
    <rect x="4" y="4" width="186" height="181" fill="#000"/>
    <rect x="62" y="150" width="70" height="28" fill="#fff"/>
    <rect x="64" y="152" width="66" height="18" fill="#000"/>
    <rect x="88" y="170" width="18" height="6" fill="#000"/>
    '''


LAYERS = [
    ("L1_front_owce-plotek", L1, "L1 front — owce + plotek, góra pusta"),
    ("L2_rodzina-chmury", L2, "L2 — Maryja, Józef, żłóbek, chmury po bokach"),
    ("L3_zwierzeta", L3, "L3 — wół i osioł (makieta, nie cięcie)"),
    ("L4_stajnia", L4, "L4 — stajnia, dach góruje, łuk na niebo"),
    ("L5_niebo", L5, "L5 — gwiazda + otwory"),
    ("L6_przegroda", L6, "L6 — przegroda, wycięcie koszyka"),
    ("L7_plecki", L7, "L7 — plecki + klapka"),
]


def labeled(name, inner, caption):
    pad = 14
    tw, th = W + pad * 2, H + pad * 2 + 16
    body = f'''
    <rect width="{tw}" height="{th}" fill="#fff"/>
    <g transform="translate({pad},{pad})">
      <rect width="{W}" height="{H}" fill="none" stroke="#ccc" stroke-width="0.4"/>
      {inner}
    </g>
    <text x="{tw/2}" y="{th-6}" text-anchor="middle" font-family="Georgia,serif" font-size="5.5" fill="#333">{caption}</text>
    '''
    return svg(body, tw, th), tw, th


def composite():
    """Nakładka z przesunięciem — podgląd głębi (szary)."""
    # draw each as group with opacity, offset
    parts = []
    # back to front
    order = [L7, L6, L5, L4, L3, L2, L1]
    colors = ["#111", "#222", "#1a1a1a", "#333", "#444", "#555", "#111"]
    # better: use fills already black; simulate by scaling opacity via gray
    # We'll embed raster later; here stacked with dx
    w, h = 240, 230
    parts.append(f'<rect width="{w}" height="{h}" fill="#e8e1d8"/>')
    # simplified: draw L5 as bg, then L4..L1
    parts.append(f'<g transform="translate(23,18)" opacity="1">{L5()}</g>')
    parts.append(f'<g transform="translate(23,18)" opacity="0.95">{L4()}</g>')
    parts.append(f'<g transform="translate(23,18)" opacity="0.92">{L3()}</g>')
    parts.append(f'<g transform="translate(23,18)" opacity="0.9">{L2()}</g>')
    parts.append(f'<g transform="translate(23,18)" opacity="1">{L1()}</g>')
    parts.append('<text x="120" y="222" text-anchor="middle" font-family="Georgia" font-size="6" fill="#6B4530">podgląd złożenia (makieta, nie render 3D)</text>')
    return svg("\n".join(parts), w, h)


def colors_strip():
    cells = [
        ("L1 ziemia", "#C4A574"),
        ("L1 owce farba", "#F4EFE6"),
        ("L2 orzech", "#6B4530"),
        ("L2 chmury", "#F7F2EA"),
        ("L3 ciemniej", "#4A3224"),
        ("L4 miód", "#B8956A"),
        ("L5 heban", "#1A1612"),
        ("L7 biel mat", "#F5F5F0"),
        ("rama znak", "#6B4530"),
    ]
    n = len(cells)
    cw, ch = 28, 40
    w = 8 + n * (cw + 4)
    h = 58
    b = [f'<rect width="{w}" height="{h}" fill="#fff"/>']
    b.append('<text x="8" y="10" font-family="Georgia" font-size="5" fill="#333">Bejca / farba — propozycja A</text>')
    x = 8
    for name, col in cells:
        b.append(f'<rect x="{x}" y="14" width="{cw}" height="{ch-18}" fill="{col}" stroke="#ccc" stroke-width="0.3"/>')
        b.append(f'<text x="{x+cw/2}" y="{h-6}" text-anchor="middle" font-family="Georgia" font-size="3.2" fill="#333">{name}</text>')
        x += cw + 4
    return svg("\n".join(b), w, h)


def main():
    for fn, fnc, cap in LAYERS:
        inner = fnc()
        raw = svg(inner)
        (OUT / f"{fn}.svg").write_text(raw)
        lab, tw, th = labeled(fn, inner, cap)
        (OUT / f"{fn}_opis.svg").write_text(lab)
        print("wrote", fn)
    (OUT / "zlozenie_podglad.svg").write_text(composite())
    (OUT / "bejca_probki.svg").write_text(colors_strip())


if __name__ == "__main__":
    main()
