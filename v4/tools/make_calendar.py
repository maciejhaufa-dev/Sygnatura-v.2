#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Kartka z kalendarza: wrzesień–październik 2026, zadania per dzień z właścicielami.
A4 poziomy 300 dpi (3508x2480) — do wydruku.
Kolor tekstu = właściciel: zielony TY · brązowy ŻONA · złoty OBOJE (legenda na dole)."""
from PIL import Image, ImageDraw, ImageFont

W, H = 3508, 2480
CREAM   = (251, 247, 240)
BOTTLE  = (31, 58, 50)
BROWN   = (107, 69, 48)
GOLD    = (196, 165, 130)
GOLD_D  = (154, 123, 79)
INK     = (43, 33, 24)
MIL     = (140, 47, 27)
DONE_C  = (31, 58, 50)
GRAY    = (160, 149, 132)
CELL    = (255, 255, 255)
WEEKEND = (243, 234, 217)
SPILL   = (235, 228, 211)
MILEBG  = (239, 227, 203)
BORDER  = (212, 197, 173)

FD = '/usr/share/fonts/truetype/dejavu/'
def F(name, size): return ImageFont.truetype(FD + name, size)
f_brand  = F('DejaVuSans-Bold.ttf', 40)
f_title  = F('DejaVuSans-Bold.ttf', 82)
f_sub    = F('DejaVuSans.ttf', 34)
f_month  = F('DejaVuSans-Bold.ttf', 58)
f_dow    = F('DejaVuSans-Bold.ttf', 30)
f_num    = F('DejaVuSans-Bold.ttf', 40)
f_task   = F('DejaVuSans.ttf', 22)
f_taskB  = F('DejaVuSans-Bold.ttf', 22)
f_banner = F('DejaVuSans-Bold.ttf', 29)
f_banner2= F('DejaVuSans.ttf', 27)
f_leg    = F('DejaVuSans.ttf', 27)
f_legB   = F('DejaVuSans-Bold.ttf', 27)
f_small  = F('DejaVuSans.ttf', 22)

img = Image.new('RGB', (W, H), CREAM)
d = ImageDraw.Draw(img)

# ---------- nagłówek ----------
d.rectangle([0, 0, W, 158], fill=BOTTLE)
d.text((92, 44), 'S T U D I O   S Y G N A T U R A', font=f_brand, fill=GOLD)
d.text((W - 92 - d.textlength('harmonogram 09–10.2026 · wydruk A4', font=f_small), 62),
       'harmonogram 09–10.2026 · wydruk A4', font=f_small, fill=GOLD)

d.text((92, 196), 'WEJŚCIE NA RYNEK — KARTKA Z KALENDARZA', font=f_title, fill=BOTTLE)
d.text((92, 296), 'wrzesień – październik 2026 · plan przygotowań i startu sprzedaży · wg PLAN-7-TYGODNI + CHECKLISTA-26-dni',
       font=f_sub, fill=BROWN)

def wrap(text, font, maxw):
    words, lines, cur = text.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=font) <= maxw: cur = t
        else:
            if cur: lines.append(cur)
            cur = w
    if cur: lines.append(cur)
    return lines

def ctext(cx, y, text, font, fill, anchor='ma'):
    d.text((cx, y), text, font=font, fill=fill, anchor=anchor)

# dane: (dzień, [(właściciel|rodzaj, tekst), ...])
# właściciel: TY / ŻONA / OBOJE (kolor tekstu) ; rodzaj: 'free', 'done', 'star'
SEP = {
 1:  [('done','nazwa · domena · logo'), ('TY','karencja 60 mies.'),
      ('ŻONA','kawa z dekoratorką'), ('OBOJE','8 wzorów świąt.')],
 2:  [('TY','pieczątki 2 szt.'), ('ŻONA','wizytówki, ulotki'),
      ('OBOJE','starter telefoniczny')],
 3:  [('TY','test wypału logo'), ('ŻONA','nicki: 4 serwisy'),
      ('OBOJE','opakowania kraft')],
 4:  [('TY','metryczka: szablon + wzór'), ('ŻONA','zgoda rodziców'),
      ('OBOJE','strona www (w toku)')],
 5:  [('star','DZIEŃ ZDJĘCIOWY'),
      ('TY','warstwy szopki — Inkscape'), ('OBOJE','zdjęcia: szopka, bombki')],
 6:  [('free','wolne — rodzina')],
 7:  [('TY','pliki 8 wzorów (6 h)')],
 8:  [('TY','pliki cd.'), ('ŻONA','Instagram: bio + 3 posty')],
 9:  [('TY','próbki 8 szt. (8 h)'), ('ŻONA','baza 60 firm (5 h)')],
 10: [('TY','próbki cd.'), ('ŻONA','baza firm cd.')],
 11: [('TY','zakup materiału (~700 zł)'), ('OBOJE','6 elementów wedding')],
 12: [('TY','seria: bombki, świeczniki, kartki'), ('TY','kalendarz adwentowy — prototyp')],
 13: [('free','wolne — rodzina')],
 14: [('TY','bazy weddingowe 6 szt.'), ('ŻONA','sesja zdjęciowa próbek (30+)')],
 15: [('TY','bazy weddingowe'), ('ŻONA','obróbka zdjęć')],
 16: [('TY','bazy weddingowe'), ('ŻONA','katalog PDF — roboczy')],
 17: [('TY','inserty weddingowe'), ('ŻONA','baza → 120 firm')],
 18: [('TY','rachunki i umowy (wzory)'), ('ŻONA','profile: Allegro + OLX')],
 19: [('TY','zapas: 3 szopki, 20 bombek'),
      ('ŻONA','5 ofert Allegro + 5 OLX'), ('ŻONA','IG + Pinterest: 5 postów')],
 20: [('free','wolne — rodzina')],
 21: [('star','START SPRZEDAŻY'),
      ('ŻONA','wizualizacje TOP 20'), ('ŻONA','przygotowanie mailingu')],
 22: [('ŻONA','MAILING FALA #1: 10–15 maili')],
 23: [('ŻONA','fala #1 cd.'), ('ŻONA','arkusz CRM')],
 24: [('ŻONA','fala #1 — 60 maili wysłane')],
 25: [('ŻONA','sesja wedding (2 warianty)'), ('TY','inserty wedding (4 h)')],
 26: [('OBOJE','wizyty z próbką #1–5')],
 27: [('free','wolne — rodzina')],
 28: [('ŻONA','follow-up #1 (fala 1)')],
 29: [('ŻONA','MAILING FALA #2 — 60 firm')],
 30: [('ŻONA','fala #2 cd.'), ('OBOJE','zgłoszenie na jarmark!')],
}
OCT = {
 1:  [('ŻONA','fala #2 cd.'), ('ŻONA','oferta partnerska: 15+10')],
 2:  [('ŻONA','telefony: 3–5 dziennie'), ('OBOJE','zapytania = PRIORYTET')],
 3:  [('OBOJE','wizyty z próbką #6–10')],
 4:  [('free','wolne — rodzina')],
 5:  [('ŻONA','follow-up #2 + telefony')],
 6:  [('ŻONA','MAILING FALA #3')],
 7:  [('ŻONA','fala #3 cd.'), ('TY','próbki dla firm (6 h)')],
 8:  [('TY','próbki dla firm'), ('ŻONA','telefony')],
 9:  [('OBOJE','negocjacje, zaliczki')],
 10: [('TY','produkcja zapasu')],
 11: [('free','wolne — rodzina')],
 12: [('ŻONA','mail «ostatnia szansa»')],
 13: [('TY','harmonogram maszyn'), ('ŻONA','potwierdzenia zamówień')],
 14: [('OBOJE','akceptacje projektów')],
 15: [('star','ZAMKNIĘCIE LISTY ZAMÓWIEŃ (MILESTONE)')],
 16: [('TY','PRODUKCJA SERYJNA — START'), ('ŻONA','wynajem: sezon 2027')],
 17: [('TY','produkcja (sobota — opcja)')],
 18: [('free','wolne — regeneracja')],
 19: [('TY','produkcja seryjna'), ('ŻONA','pakowanie · kontakt')],
 20: [('TY','produkcja seryjna'), ('ŻONA','pakowanie · akceptacje')],
 21: [('TY','produkcja seryjna'), ('ŻONA','pakowanie · akceptacje')],
 22: [('TY','produkcja seryjna'), ('ŻONA','pakowanie · akceptacje')],
 23: [('TY','produkcja seryjna'), ('ŻONA','pakowanie · akceptacje')],
 24: [('TY','produkcja (sobota — opcja)')],
 25: [('free','wolne — regeneracja')],
 26: [('TY','produkcja seryjna'), ('ŻONA','pakowanie · kontakt')],
 27: [('TY','produkcja seryjna'), ('ŻONA','pakowanie · akceptacje')],
 28: [('TY','produkcja seryjna'), ('ŻONA','pakowanie · akceptacje')],
 29: [('TY','produkcja seryjna'), ('ŻONA','pakowanie · akceptacje')],
 30: [('TY','produkcja seryjna'), ('ŻONA','pakowanie · akceptacje')],
 31: [('TY','produkcja (sobota — opcja)')],
}
OWN_COL = {'TY': BOTTLE, 'ŻONA': BROWN, 'OBOJE': GOLD_D}

def grid(x0, y0, gw, rh, title, days, spill_before, spill_after, star_days, wave_days):
    ctext(x0 + gw/2, y0 - 26, title, f_month, BROWN)
    dows = ['Pn','Wt','Śr','Cz','Pt','So','Nd']
    cw = gw / 7
    for i, name in enumerate(dows):
        col = BROWN if i >= 5 else GOLD_D
        ctext(x0 + cw*i + cw/2, y0 + 24, name, f_dow, col)
    gy = y0 + 52
    row0 = spill_before + list(range(1, 8 - len(spill_before)))
    rows = [row0]
    nxt = rows[0][-1] + 1
    while nxt <= max(days):
        rows.append(list(range(nxt, min(nxt+7, max(days)+1))))
        nxt += 7
    for r, row in enumerate(rows):
        for c, day in enumerate(row):
            cx, cy = x0 + c*cw, gy + r*rh
            is_weekend = (r*7 + c) % 7 >= 5
            is_spill = day in spill_before or day in spill_after
            is_star = day in star_days
            is_wave = day in wave_days
            bg = SPILL if is_spill else (MILEBG if is_star else (WEEKEND if is_weekend else CELL))
            d.rectangle([cx, cy, cx+cw-6, cy+rh-6], fill=bg, outline=GOLD if is_star else BORDER,
                        width=4 if is_star else 1)
            ncol = GRAY if is_spill else (BROWN if is_weekend else BOTTLE)
            num = str(day)
            ny = cy + 34
            if is_star:
                d.ellipse([cx+14, cy+14, cx+14+52, cy+14+52], fill=BOTTLE)
                ctext(cx+40, ny, num, f_num, GOLD)
                d.text((cx+62, cy+22), '★', font=f_taskB, fill=MIL)
            else:
                ctext(cx+30, ny, num, f_num, ncol)
                if is_wave:
                    d.ellipse([cx+16, cy+38, cx+16+14, cy+38+14], fill=GOLD)
            ty = cy + (86 if is_star else 70)
            for kind, text in days.get(day, []):
                if kind == 'free':
                    ctext(cx+14, ty+10, text, f_task, GRAY)
                    ty += 28
                    continue
                if kind == 'star':
                    for ln in wrap(text, f_taskB, cw-28):
                        d.text((cx+14, ty), ln, font=f_taskB, fill=MIL)
                        ty += 28
                    continue
                if kind == 'done':
                    for ln in wrap('✓ ' + text, f_task, cw-28):
                        d.text((cx+14, ty), ln, font=f_task, fill=DONE_C)
                        ty += 28
                    continue
                col = OWN_COL[kind]
                for ln in wrap(f'{kind} · {text}', f_task, cw-28):
                    d.text((cx+14, ty), ln, font=f_task, fill=col)
                    ty += 28
    return gy + len(rows)*rh

MG, GW = 92, 1634
gap = 60
grid_y = 470
rh = 324

end1 = grid(MG, grid_y, GW, rh, 'WRZESIEŃ 2026', SEP, [31], [1,2,3,4], {5, 21}, {22, 29})
end2 = grid(MG+GW+gap, grid_y, GW, rh, 'PAŹDZIERNIK 2026', OCT, [28,29,30], [1], {15}, {6})

# ---------- pas „po deadlinie" ----------
by = end1 + 34
d.rectangle([MG, by, W-MG, by+132], fill=BOTTLE)
ctext(MG+40, by+26, 'PO DEADLINE · 16.10–30.11: produkcja seryjna zamówień (TY) · pakowanie, akceptacje, kontakt (ŻONA) · równolegle: wynajem — sezon 2027 (ŻONA)',
      f_banner, GOLD, 'lm')
ctext(MG+40, by+68, '★ 05.12 — WYSYŁKA WSZYSTKICH ZAMÓWIEŃ (MILESTONE)   ·   limit mocy: szt./dzień × ~33 dni robocze − 25% zapasu',
      f_banner, CREAM, 'lm')
ctext(MG+40, by+104, 'Budżet startu: 680 zł  ·  cel: 3–6 zamówień B2B × ~2 500 zł = 7 500–15 000 zł  ·  działalność nierejestrowana: 10 813,50 zł/kwartał na osobę',
      f_banner2, GOLD, 'lm')

# ---------- legenda ----------
ly = by + 172
def legend_square(x, y, col, label, rest):
    d.rectangle([x, y+4, x+18, y+22], fill=col)
    d.text((x+28, y), label, font=f_legB, fill=col)
    d.text((x+28+d.textlength(label, font=f_legB), y), rest, font=f_leg, fill=INK)

legend_square(MG, ly, BOTTLE, 'TY', '  — produkcja · pliki · maszyny · formalności')
w1 = d.textlength('TY', font=f_legB) + d.textlength('  — produkcja · pliki · maszyny · formalności', font=f_leg) + 28
x2 = MG + w1 + 70
legend_square(x2, ly, BROWN, 'ŻONA', '  — sprzedaż · social · baza · klienci')
w2 = d.textlength('ŻONA', font=f_legB) + d.textlength('  — sprzedaż · social · baza · klienci', font=f_leg) + 28
x3 = x2 + w2 + 70
legend_square(x3, ly, GOLD_D, 'OBOJE', '  — wspólne decyzje · wizyty z próbką')
ly2 = ly + 46
d.text((MG, ly2), '★', font=f_taskB, fill=MIL)
d.text((MG+26, ly2), '= kluczowa data / milestone', font=f_leg, fill=INK)
x4 = MG + 26 + d.textlength('= kluczowa data / milestone', font=f_leg) + 60
d.text((x4, ly2), '✓', font=f_taskB, fill=DONE_C)
d.text((x4+26, ly2), '= już zrobione', font=f_leg, fill=INK)
x5 = x4 + 26 + d.textlength('= już zrobione', font=f_leg) + 60
d.ellipse([x5, ly2+6, x5+14, ly2+20], fill=GOLD)
d.text((x5+24, ly2), '= fala mailingu', font=f_leg, fill=INK)
x6 = x5 + 24 + d.textlength('= fala mailingu', font=f_leg) + 60
d.text((x6, ly2), 'Zero zimnych maili i telefonów (PKE art. 398) — tylko wizyty osobiste i zgody.', font=f_leg, fill=BROWN)

d.text((W-MG-10, H-30), 'Studio Sygnatura · kartka z kalendarza 09–10.2026 · wygenerowano 31.08.2026',
       font=f_small, fill=GRAY, anchor='rs')

out = 'pracownia/WEJSCIE-NA-RYNEK-kalendarz-09-10-2026.png'
img.save(out)
print('zapisano', out, img.size)
