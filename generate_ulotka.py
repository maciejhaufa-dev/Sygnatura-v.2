import base64
import os
from reportlab.lib.pagesizes import mm
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

def get_b64(path):
    with open(path, 'rb') as f:
        return base64.b64encode(f.read()).decode('utf-8')

def build_svg():
    szyld_b64 = get_b64('www/assets/media/sklep/szyld.jpg')
    niedzwiadki_b64 = get_b64('www/assets/media/sklep/niedzwiadki.jpg')
    szopka_b64 = get_b64('www/assets/media/sklep/szopka.jpg')
    sygnet_b64 = get_b64('www/assets/sygnet.svg')
    qr_b64 = get_b64('www/assets/qr-sygnatura.svg')

    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="105mm" height="148mm" viewBox="0 0 1050 1480" version="1.1">
  <defs>
    <style type="text/css">
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400;1,600&amp;family=Montserrat:wght@400;500;600;700&amp;display=swap');
      .cormorant {{ font-family: 'Cormorant Garamond', 'Times New Roman', serif; }}
      .montserrat {{ font-family: 'Montserrat', 'Helvetica Neue', Arial, sans-serif; }}
    </style>
    <clipPath id="clip-card-1"><rect x="97" y="542" width="246" height="230" rx="8" /></clipPath>
    <clipPath id="clip-card-2"><rect x="402" y="542" width="246" height="230" rx="8" /></clipPath>
    <clipPath id="clip-card-3"><rect x="707" y="542" width="246" height="230" rx="8" /></clipPath>
  </defs>

  <!-- TŁO I RAMKA OZDOBNA Z KSIĘGI ZNAKU -->
  <rect x="0" y="0" width="1050" height="1480" fill="#FBF7F0" />
  <rect x="35" y="35" width="980" height="1410" fill="none" stroke="#C4A582" stroke-width="8" rx="14" />
  <rect x="47" y="47" width="956" height="1386" fill="none" stroke="#C4A582" stroke-opacity="0.45" stroke-width="2" rx="10" />

  <!-- NAGŁÓWEK I LOGO -->
  <g id="naglowek">
    <image href="data:image/svg+xml;base64,{sygnet_b64}" x="310" y="80" width="55" height="55" />
    <text x="380" y="122" class="cormorant" font-size="46" font-weight="700" fill="#1F3A32" letter-spacing="4">STUDIO SYGNATURA</text>
    <text x="525" y="165" class="montserrat" font-size="18" font-weight="600" fill="#6B4530" letter-spacing="3" text-anchor="middle">PRACOWNIA RZEMIOSŁA I DEKORACJI</text>
    <line x1="435" y1="190" x2="615" y2="190" stroke="#C4A582" stroke-width="2.5" />
  </g>

  <!-- PODZIĘKOWANIE (TON HQ) -->
  <g id="podziekowanie">
    <text x="525" y="248" class="cormorant" font-size="40" font-weight="600" font-style="italic" fill="#1F3A32" text-anchor="middle">Dziękujemy, że jesteś z nami</text>
    <text x="525" y="300" class="montserrat" font-size="22" font-weight="400" fill="#33261C" text-anchor="middle">Cieszymy się, że ręcznie wykonana szopka z naszej pracowni</text>
    <text x="525" y="338" class="montserrat" font-size="22" font-weight="400" fill="#33261C" text-anchor="middle">zagości w Twoim domu. Każdy egzemplarz tworzymy z naturalnego</text>
    <text x="525" y="376" class="montserrat" font-size="22" font-weight="400" fill="#33261C" text-anchor="middle">drewna, dbając o szlachetność materiału, precyzję warstw</text>
    <text x="525" y="414" class="montserrat" font-size="22" font-weight="400" fill="#33261C" text-anchor="middle">i ciepłe światło. Życzymy Wam pięknych i spokojnych świąt.</text>
  </g>

  <!-- FILARY PRACOWNI / REALIZACJE -->
  <g id="realizacje">
    <text x="525" y="495" class="montserrat" font-size="19" font-weight="700" fill="#6B4530" letter-spacing="2" text-anchor="middle">— ODKRYJ MOŻLIWOŚCI NASZEJ PRACOWNI —</text>

    <!-- KARTA 1: Ślub i Przyjęcia -->
    <g id="filar-slub">
      <rect x="85" y="530" width="270" height="360" fill="#FFFFFF" stroke="#DCC9AC" stroke-width="2" rx="12" />
      <image href="data:image/jpeg;base64,{szyld_b64}" x="97" y="542" width="246" height="230" preserveAspectRatio="xMidYMid slice" clip-path="url(#clip-card-1)" />
      <text x="220" y="812" class="montserrat" font-size="21" font-weight="700" fill="#1F3A32" text-anchor="middle">Ślub i Przyjęcia</text>
      <text x="220" y="842" class="montserrat" font-size="15" font-weight="500" fill="#6B4530" text-anchor="middle">Szyldy powitalne, plany</text>
      <text x="220" y="866" class="montserrat" font-size="15" font-weight="500" fill="#6B4530" text-anchor="middle">i numery stołów, winietki</text>
    </g>

    <!-- KARTA 2: Pamiątki z duszą -->
    <g id="filar-pamiatki">
      <rect x="390" y="530" width="270" height="360" fill="#FFFFFF" stroke="#DCC9AC" stroke-width="2" rx="12" />
      <image href="data:image/jpeg;base64,{niedzwiadki_b64}" x="402" y="542" width="246" height="230" preserveAspectRatio="xMidYMid slice" clip-path="url(#clip-card-2)" />
      <text x="525" y="812" class="montserrat" font-size="21" font-weight="700" fill="#1F3A32" text-anchor="middle">Pamiątki z duszą</text>
      <text x="525" y="842" class="montserrat" font-size="15" font-weight="500" fill="#6B4530" text-anchor="middle">Sygnaturki dziecięce,</text>
      <text x="525" y="866" class="montserrat" font-size="15" font-weight="500" fill="#6B4530" text-anchor="middle">puzzle rodzinne, metryczki</text>
    </g>

    <!-- KARTA 3: Światło i Drewno -->
    <g id="filar-swiatlo">
      <rect x="695" y="530" width="270" height="360" fill="#FFFFFF" stroke="#DCC9AC" stroke-width="2" rx="12" />
      <image href="data:image/jpeg;base64,{szopka_b64}" x="707" y="542" width="246" height="230" preserveAspectRatio="xMidYMid slice" clip-path="url(#clip-card-3)" />
      <text x="830" y="812" class="montserrat" font-size="21" font-weight="700" fill="#1F3A32" text-anchor="middle">Światło i Drewno</text>
      <text x="830" y="842" class="montserrat" font-size="15" font-weight="500" fill="#6B4530" text-anchor="middle">Warstwowe obrazy LED,</text>
      <text x="830" y="866" class="montserrat" font-size="15" font-weight="500" fill="#6B4530" text-anchor="middle">dekoracje i prezenty 3D</text>
    </g>
  </g>

  <!-- KOD VIP NA KOLEJNE ZAMÓWIENIE -->
  <g id="bilet-vip">
    <rect x="85" y="930" width="880" height="190" fill="#F4EDE2" stroke="#C4A582" stroke-width="3" rx="14" />
    <text x="525" y="972" class="montserrat" font-size="17" font-weight="600" fill="#6B4530" letter-spacing="2" text-anchor="middle">PREZENT DLA CIEBIE NA KOLEJNE ZAMÓWIENIE</text>
    <text x="525" y="1030" class="montserrat" font-size="36" font-weight="700" fill="#1F3A32" letter-spacing="4" text-anchor="middle">KOD: SYGNATURA10</text>
    <text x="525" y="1078" class="montserrat" font-size="18" font-weight="500" fill="#33261C" text-anchor="middle">10% rabatu na kolejną realizację lub darmowy projekt personalizowany</text>
  </g>

  <!-- STOPKA I DANE KONTAKTOWE + QR -->
  <g id="stopka">
    <line x1="85" y1="1160" x2="965" y2="1160" stroke="#DCC9AC" stroke-width="2" />
    
    <g transform="translate(95, 1180)">
      <text x="0" y="32" class="montserrat" font-size="25" font-weight="700" fill="#1F3A32">studiosygnatura.pl</text>
      <text x="0" y="72" class="montserrat" font-size="20" font-weight="500" fill="#33261C">✉️  kontakt@studiosygnatura.pl</text>
      <text x="0" y="110" class="montserrat" font-size="20" font-weight="500" fill="#33261C">📞  510 767 076</text>
      <text x="0" y="148" class="montserrat" font-size="20" font-weight="600" fill="#6B4530">Instagram: @studio.sygnatura</text>
      <text x="0" y="185" class="cormorant" font-size="19" font-style="italic" fill="#887A6E">Z pozdrowieniami z pracowni — Studio Sygnatura</text>
    </g>

    <g transform="translate(765, 1180)">
      <rect x="0" y="0" width="195" height="195" fill="#FFFFFF" stroke="#DCC9AC" stroke-width="2" rx="10" />
      <image href="data:image/svg+xml;base64,{qr_b64}" x="10" y="10" width="175" height="175" />
      <text x="97" y="222" class="montserrat" font-size="13" font-weight="700" fill="#6B4530" letter-spacing="1.5" text-anchor="middle">ZESKANUJ I ZOBACZ</text>
    </g>
  </g>
</svg>
'''
    with open('www/ulotka-a6.svg', 'w', encoding='utf-8') as f:
        f.write(svg)
    print('Generated www/ulotka-a6.svg')

def build_pdf():
    # A6 is 105mm x 148mm
    w, h = 105 * mm, 148 * mm
    c = canvas.Canvas("www/ulotka-a6.pdf", pagesize=(w, h))

    # Background
    c.setFillColor(HexColor('#FBF7F0'))
    c.rect(0, 0, w, h, fill=1, stroke=0)

    # Borders
    c.setStrokeColor(HexColor('#C4A582'))
    c.setLineWidth(1.8)
    c.roundRect(3.5 * mm, 3.5 * mm, w - 7 * mm, h - 7 * mm, 3 * mm, fill=0, stroke=1)

    c.setLineWidth(0.6)
    c.setStrokeColor(HexColor('#DCC9AC'))
    c.roundRect(4.7 * mm, 4.7 * mm, w - 9.4 * mm, h - 9.4 * mm, 2 * mm, fill=0, stroke=1)

    # Header Logo icon (Circle with S)
    c.setStrokeColor(HexColor('#C4A582'))
    c.setFillColor(HexColor('#1F3A32'))
    c.setLineWidth(1)
    c.circle(28 * mm, h - 14.5 * mm, 3.8 * mm, fill=1, stroke=1)
    c.setFillColor(HexColor('#C4A582'))
    c.setFont("Times-BoldItalic", 9.5)
    c.drawCentredString(28 * mm, h - 17 * mm, "S")

    c.setFillColor(HexColor('#1F3A32'))
    c.setFont("Helvetica-Bold", 11)
    c.drawString(35 * mm, h - 15.5 * mm, "STUDIO SYGNATURA")

    c.setFillColor(HexColor('#6B4530'))
    c.setFont("Helvetica-Bold", 6)
    c.drawCentredString(w / 2, h - 20 * mm, "PRACOWNIA RZEMIOSŁA I DEKORACJI")

    c.setStrokeColor(HexColor('#C4A582'))
    c.setLineWidth(0.8)
    c.line(42 * mm, h - 22.5 * mm, w - 42 * mm, h - 22.5 * mm)

    # Thank you
    c.setFillColor(HexColor('#1F3A32'))
    c.setFont("Times-BoldItalic", 12.5)
    c.drawCentredString(w / 2, h - 29 * mm, "Dziękujemy, że jesteś z nami")

    c.setFillColor(HexColor('#33261C'))
    c.setFont("Helvetica", 6.8)
    c.drawCentredString(w / 2, h - 34 * mm, "Cieszymy się, że ręcznie wykonana szopka z naszej pracowni zagości")
    c.drawCentredString(w / 2, h - 37.5 * mm, "w Twoim domu. Każdy egzemplarz tworzymy z naturalnego drewna,")
    c.drawCentredString(w / 2, h - 41 * mm, "dbając o szlachetność materiału, precyzję warstw i ciepłe światło.")
    c.drawCentredString(w / 2, h - 44.5 * mm, "Mamy nadzieję, że wniesie do Waszych świąt wiele spokoju i magii.")

    # Section title
    c.setFillColor(HexColor('#6B4530'))
    c.setFont("Helvetica-Bold", 6.5)
    c.drawCentredString(w / 2, h - 51.5 * mm, "— ODKRYJ MOŻLIWOŚCI NASZEJ PRACOWNI —")

    # 3 Cards
    card_w = 28 * mm
    card_h = 37 * mm
    gap = 3.5 * mm
    y_card = h - 92 * mm
    x1 = (w - (3 * card_w + 2 * gap)) / 2
    x2 = x1 + card_w + gap
    x3 = x2 + card_w + gap

    cards = [
        (x1, "www/assets/media/sklep/szyld.jpg", "Ślub i Przyjęcia", "Szyldy powitalne, plany", "i numery stołów, winietki"),
        (x2, "www/assets/media/sklep/niedzwiadki.jpg", "Pamiątki z duszą", "Sygnaturki dziecięce,", "puzzle rodzinne, metryczki"),
        (x3, "www/assets/media/sklep/szopka.jpg", "Światło i Drewno", "Warstwowe obrazy LED,", "dekoracje i prezenty 3D")
    ]

    for cx, img, tit, sub1, sub2 in cards:
        c.setFillColor(HexColor('#FFFFFF'))
        c.setStrokeColor(HexColor('#DCC9AC'))
        c.setLineWidth(0.6)
        c.roundRect(cx, y_card, card_w, card_h, 2 * mm, fill=1, stroke=1)

        # Image
        c.drawImage(img, cx + 1.2 * mm, y_card + 13.5 * mm, width=card_w - 2.4 * mm, height=22 * mm, mask='auto', preserveAspectRatio=True)

        c.setFillColor(HexColor('#1F3A32'))
        c.setFont("Helvetica-Bold", 6.8)
        c.drawCentredString(cx + card_w / 2, y_card + 9 * mm, tit)

        c.setFillColor(HexColor('#6B4530'))
        c.setFont("Helvetica", 5.2)
        c.drawCentredString(cx + card_w / 2, y_card + 5.5 * mm, sub1)
        c.drawCentredString(cx + card_w / 2, y_card + 2.8 * mm, sub2)

    # VIP Box
    vip_y = h - 114 * mm
    vip_h = 19 * mm
    c.setFillColor(HexColor('#F4EDE2'))
    c.setStrokeColor(HexColor('#C4A582'))
    c.setLineWidth(0.8)
    c.roundRect(8.5 * mm, vip_y, w - 17 * mm, vip_h, 2 * mm, fill=1, stroke=1)

    c.setFillColor(HexColor('#6B4530'))
    c.setFont("Helvetica-Bold", 5.8)
    c.drawCentredString(w / 2, vip_y + 14 * mm, "PREZENT DLA CIEBIE NA KOLEJNE ZAMÓWIENIE")

    c.setFillColor(HexColor('#1F3A32'))
    c.setFont("Helvetica-Bold", 10.5)
    c.drawCentredString(w / 2, vip_y + 8 * mm, "KOD: SYGNATURA10")

    c.setFillColor(HexColor('#33261C'))
    c.setFont("Helvetica", 5.8)
    c.drawCentredString(w / 2, vip_y + 3 * mm, "10% rabatu na kolejną realizację lub darmowy projekt personalizowany")

    # Footer
    c.setStrokeColor(HexColor('#DCC9AC'))
    c.setLineWidth(0.5)
    c.line(8.5 * mm, h - 118 * mm, w - 8.5 * mm, h - 118 * mm)

    c.setFillColor(HexColor('#1F3A32'))
    c.setFont("Helvetica-Bold", 8)
    c.drawString(10 * mm, h - 124 * mm, "studiosygnatura.pl")

    c.setFillColor(HexColor('#33261C'))
    c.setFont("Helvetica", 6.2)
    c.drawString(10 * mm, h - 128.5 * mm, "kontakt@studiosygnatura.pl")
    c.drawString(10 * mm, h - 132.5 * mm, "tel. 510 767 076")

    c.setFillColor(HexColor('#6B4530'))
    c.setFont("Helvetica-Bold", 6.2)
    c.drawString(10 * mm, h - 137 * mm, "IG: @studio.sygnatura")

    c.setFillColor(HexColor('#887A6E'))
    c.setFont("Times-Italic", 6)
    c.drawString(10 * mm, h - 141.5 * mm, "Z pozdrowieniami z pracowni — Studio Sygnatura")

    # QR Code
    qr_x = w - 28.5 * mm
    qr_y = h - 142.5 * mm
    c.setFillColor(HexColor('#FFFFFF'))
    c.setStrokeColor(HexColor('#DCC9AC'))
    c.setLineWidth(0.6)
    c.roundRect(qr_x, qr_y, 19 * mm, 22 * mm, 1.5 * mm, fill=1, stroke=1)

    c.drawImage("www/assets/qr-sygnatura.png", qr_x + 1 * mm, qr_y + 4 * mm, width=17 * mm, height=17 * mm, mask='auto')

    c.setFillColor(HexColor('#6B4530'))
    c.setFont("Helvetica-Bold", 4.2)
    c.drawCentredString(qr_x + 9.5 * mm, qr_y + 1.5 * mm, "ZESKANUJ I ZOBACZ")

    c.save()
    print('Generated www/ulotka-a6.pdf')

if __name__ == '__main__':
    build_svg()
    build_pdf()
