#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Wizualizacje szopki v3 — WYŁĄCZNIE z wektorów użytkownika: uploads/Szopka 3D.svg
Projekt z pliku: L0 niebo · L1 stajnia · L2 wzgórza/owce · L3 Maryja i Józef ·
L4 żłóbek · L5 panel frontowy z wyciętą wielką gwiazdą + 34 małe gwiazdki.
200×200 mm, odstępy 5 mm, podświetlenie we wnęce ramy."""
import os
import sys
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import svgfill

SRC = os.path.abspath(os.path.join(HERE, '..', '..', 'uploads', 'Szopka 3D.svg'))
OUT = os.path.abspath(os.path.join(HERE, '..', '..', 'pracownia', 'szopka', 'WIZUALIZACJE', 'v3'))
os.makedirs(OUT, exist_ok=True)

SIZE = 2400            # 200 mm -> 12 px/mm
PPM = SIZE / 200.0
GAP_MM = 5
LAYER_MM = 3
N_LAYERS = 6
FRAME_MM = 20          # listwa sosnowa 20 mm

FD = '/usr/share/fonts/truetype/dejavu/'
def F(name, size): return ImageFont.truetype(FD + name, size)

INK = (51, 38, 28)
CREAM = (246, 241, 231)
PINE = (201, 168, 124)
PINE_D = (156, 122, 76)
BROWN = (107, 69, 48)
LEDW = (255, 214, 130)

TONE = [(96, 74, 52), (84, 63, 43), (72, 53, 36), (60, 44, 30), (49, 36, 24), (40, 29, 19)]


def get_layers():
    tree = ET.parse(SRC)
    root = tree.getroot()
    layers = {}
    INK_NS = '{http://www.inkscape.org/namespaces/inkscape}'

    def walk(el, ctx):
        lab = el.get(INK_NS + 'label')
        if lab:
            ctx = lab
        for ch in el:
            tag = ch.tag.split('}')[-1]
            if tag == 'path' and (ch.get('id') or '').startswith('fill_'):
                subs = svgfill.parse_path(ch.get('d') or '')
                m = svgfill.parse_transform(ch.get('transform'))
                layers.setdefault(ctx, []).append((subs, m))
            elif tag == 'rect' and ctx == 'L0' and (ch.get('id') or '') == 'rect77':
                subs = svgfill.rect_poly(float(ch.get('x') or 0), float(ch.get('y') or 0),
                                         float(ch.get('width') or 200), float(ch.get('height') or 200),
                                         float(ch.get('rx') or 0))
                layers.setdefault(ctx, []).append((subs, None))
            walk(ch, ctx)
    walk(root, None)
    out = []
    for k in [f'L{i}' for i in range(6)]:
        out.append((k, layers.get(k, [])))
    return out


def render_masks():
    masks = []
    for label, shapes in get_layers():
        m = svgfill.render_layer_shapes(shapes, SIZE)
        masks.append((label, m))
    return masks


def toned(mask, color):
    tile = Image.new('RGBA', mask.size, color + (255,))
    tile.putalpha(mask)
    return tile


def with_frame(inner_rgb, night=False):
    """Dorysowuje sosnową ramę 20 mm wokół kompozycji."""
    fm = int(FRAME_MM * PPM)
    W = SIZE + 2 * fm
    comp = Image.new('RGBA', (W, W), (0, 0, 0, 0))
    d = ImageDraw.Draw(comp, 'RGBA')
    col = (92, 68, 46) if night else PINE
    col_d = (64, 47, 32) if night else PINE_D
    d.rectangle([0, 0, W, W], fill=col + (255,))
    d.rectangle([int(0.15*fm), int(0.15*fm), W - int(0.15*fm), W - int(0.15*fm)], outline=col_d + (255,), width=6)
    # cienie wnętrza okna
    d.rectangle([fm, fm, W - fm, W - fm], fill=(20, 14, 9, 120))
    d.rectangle([fm + 10, fm + 10, W - fm - 10, W - fm - 10], fill=(0, 0, 0, 60))
    comp.alpha_composite(inner_rgb.convert('RGBA'), (fm, fm))
    if night:
        # ciepła poświata na wewnętrznej krawędzi ramy (LED we wnęce)
        d = ImageDraw.Draw(comp, 'RGBA')
        d.rectangle([fm - 4, fm - 4, W - fm + 4, W - fm + 4], outline=(255, 205, 120, 130), width=12)
    return comp.convert('RGB')


def radial_warm(size, center, radius, max_alpha=200):
    try:
        return Image.radial_gradient('L').resize((size, size))
    except Exception:
        base = Image.new('L', (size, size), 0)
        d = ImageDraw.Draw(base)
        radius = int(radius)
        for rr in range(radius, 0, -24):
            a = int(max_alpha * (1 - rr / radius))
            d.ellipse([center[0]-rr, center[1]-rr, center[0]+rr, center[1]+rr], fill=a)
        return base.filter(ImageFilter.GaussianBlur(60))


def front_day(masks):
    comp = Image.new('RGBA', (SIZE, SIZE), (252, 248, 240, 255))
    for i, (label, m) in enumerate(masks):
        comp.alpha_composite(toned(m, TONE[i]))
    return with_frame(comp, night=False)


def front_night(masks):
    # ciepła poświata z wnęki (za sceną)
    glow_a = radial_warm(SIZE, (SIZE//2, SIZE//2), SIZE*0.62, 230)
    glow = Image.new('RGBA', (SIZE, SIZE), (255, 196, 110, 0))
    glow.putalpha(glow_a)
    comp = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    comp.alpha_composite(glow)
    # scena wewnętrzna L0..L4 — sylwetki, tył jaśniejszy
    n_tones = [(150, 108, 58), (126, 88, 46), (102, 70, 36), (78, 53, 28), (56, 38, 20)]
    for i in range(5):
        comp.alpha_composite(toned(masks[i][1], n_tones[i]))
    # panel frontowy L5 — ciemny, z wycięciami (gwiazda + gwiazdki)
    comp.alpha_composite(toned(masks[5][1], (34, 25, 16)))
    # blask wycięć: dziury L5 świecą
    holes = masks[5][1].point(lambda v: 255 - v)
    bloom = holes.filter(ImageFilter.GaussianBlur(34))
    bloom_rgb = Image.new('RGBA', (SIZE, SIZE), (255, 205, 120, 0))
    bloom_rgb.putalpha(bloom.point(lambda v: min(200, v * 2)))
    comp.alpha_composite(bloom_rgb)
    # delikatne światło z boku wnęki na panelu
    side = radial_warm(SIZE, (int(0.12*SIZE), SIZE//2), SIZE*0.7, 70)
    side_rgb = Image.new('RGBA', (SIZE, SIZE), (255, 190, 110, 0))
    side_rgb.putalpha(side)
    comp.alpha_composite(side_rgb)
    return with_frame(comp, night=True)


def isometric(masks, spacing_px):
    cos30, sin30 = 0.866, 0.5
    depth = spacing_px * (N_LAYERS - 1)
    W = SIZE + int(depth * cos30) + 800
    H = SIZE + int(depth * sin30) + 800
    img = Image.new('RGB', (W, H), CREAM)
    comp = img.convert('RGBA')
    ox = 200 + int(depth * cos30)
    oy = H - 300 - int(depth * sin30)
    for i, (label, m) in enumerate(masks):
        dx = ox - int(i * spacing_px * cos30)
        dy = oy - int(i * spacing_px * sin30)
        sh = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
        sh.paste((40, 25, 12, 80), (0, 0), m)
        comp.alpha_composite(sh, (dx + 20, dy + 24))
        comp.alpha_composite(toned(m, TONE[i]), (dx, dy))
    # podpis L0..L5 przy każdej warstwie
    d = ImageDraw.Draw(comp)
    fS = F('DejaVuSans-Bold.ttf', 30)
    for i in range(N_LAYERS):
        dx = ox - int(i * spacing_px * cos30)
        dy = oy - int(i * spacing_px * sin30)
        d.text((dx + SIZE + 30, dy + SIZE//2 - 20), f'L{i}', font=fS, fill=BROWN)
    # listwa dolna
    d = ImageDraw.Draw(comp, 'RGBA')
    x0 = ox - int(depth * cos30) - int(FRAME_MM * PPM)
    y0 = oy + SIZE
    d.rectangle([x0, y0 - 20, ox + SIZE, y0 + int(FRAME_MM * PPM)], fill=PINE + (255,))
    return comp.convert('RGB')


def section_view():
    W, H = 2400, 1500
    img = Image.new('RGB', (W, H), CREAM)
    d = ImageDraw.Draw(img)
    fH = F('DejaVuSans-Bold.ttf', 46)
    fT = F('DejaVuSans.ttf', 30)
    fS = F('DejaVuSans.ttf', 25)
    d.text((W//2, 46), 'PRZEKRÓJ BOCZNY — 6 warstw, odstępy 5 mm, światło we wnęce', font=fH, fill=INK, anchor='ma')
    s = 7.2
    lw = LAYER_MM * s
    gp = GAP_MM * s
    total_d = N_LAYERS * lw + (N_LAYERS - 1) * gp
    x0 = 560
    y_top, y_bot = 300, 300 + int(200 * s)
    for yy in (y_top - int(20*s), y_bot):
        d.rectangle([x0 - int(20*s), yy, x0 + int(total_d) + int(20*s), yy + int(20*s)],
                    fill=PINE, outline=PINE_D, width=3)
        d.rectangle([x0 - int(20*s) + int(6*s), yy + int(6*s), x0 - int(20*s) + int(14*s), yy + int(14*s)],
                    fill=(238, 231, 218))
    d.rectangle([x0 + int(total_d), y_top, x0 + int(total_d) + int(3*s), y_bot],
                fill=(248, 246, 240), outline=(150, 140, 122), width=2)
    labels = ['L0\nniebo', 'L1\nstajnia', 'L2\nwzgórza', 'L3\npostacie', 'L4\nżłóbek', 'L5\npanel z gwiazdą']
    for i in range(N_LAYERS):
        lx = x0 + i * (lw + gp)
        d.rectangle([lx, y_top, lx + lw, y_bot], fill=TONE[i])
        d.text((lx - 30 if i > 0 else lx + lw + 30, y_bot + 60), labels[i], font=fS, fill=BROWN, anchor='ma')
    for yy in (y_top - int(10*s), y_bot + int(10*s)):
        d.line([(x0, yy), (x0 + int(total_d), yy)], fill=LEDW, width=int(1.6*s))
        for k in range(int(total_d // (10*s)) + 1):
            lx = x0 + k * int(10*s)
            d.ellipse([lx-5, yy-5, lx+5, yy+5], fill=(255, 236, 170))
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow, 'RGBA')
    gd.rectangle([x0, y_top, x0 + int(total_d), y_bot], fill=(255, 214, 130, 45))
    img = Image.alpha_composite(img.convert('RGBA'), glow).convert('RGB')
    d = ImageDraw.Draw(img)
    d.line([(x0 - int(20*s), y_top - 80), (x0 + int(total_d) + int(20*s), y_top - 80)], fill=INK, width=3)
    d.text((x0 + int(total_d)//2, y_top - 100), '20 × 20 cm (lico ramy)', font=fT, fill=INK, anchor='ma')
    d.line([(x0 + int(total_d) + 130, y_top), (x0 + int(total_d) + 130, y_bot)], fill=INK, width=3)
    d.text((x0 + int(total_d) + 150, (y_top + y_bot)//2), '20 cm', font=fT, fill=INK, anchor='lm')
    d.line([(x0, y_bot + 140), (x0 + int(total_d), y_bot + 140)], fill=INK, width=3)
    d.text((x0 + int(total_d)//2, y_bot + 166), f'głębokość: 6×3 mm + 5×5 mm = {total_d/ s:.0f} mm', font=fT, fill=INK, anchor='ma')
    d.text((x0 + int(total_d) + 150, y_top + 40), 'PODŚWIETLENIE WE WNĘCE:', font=fT, fill=BROWN)
    d.text((x0 + int(total_d) + 150, y_top + 90),
           'drucik LED (fairy lights)\n2700 K, wokół wewnętrznego\nobwodu ramy (rowka)\n· diody nie w stronę widza\n· plecki białe matowe',
           font=fS, fill=INK)
    return img


def main():
    masks = render_masks()
    day = front_day(masks)
    day.save(os.path.join(OUT, 'WIZ3_front_dzien.png'))
    night = front_night(masks)
    night.save(os.path.join(OUT, 'WIZ3_front_noc.png'))
    iso = isometric(masks, spacing_px=int(26 * PPM))
    iso.save(os.path.join(OUT, 'WIZ3_izometria.png'))
    sec = section_view()
    sec.save(os.path.join(OUT, 'WIZ3_przekroj.png'))
    print('OK ->', OUT)


if __name__ == '__main__':
    main()
