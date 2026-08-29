# Serwis — jak to składamy (nie WooCommerce)

Decyzja 29.08.2026. **WordPress + Woo nie instalujemy.** PayU/BLIK — później, gdy idzie prawdziwa kasa; nie na test rodziny.

## Co GitHub Pages umie, a czego nie

Pages = **tylko pliki HTML/CSS/JS**.  
Działa: wygląd, mobile, koszyk w przeglądarce, regulamin, landing.  
**Nie działa:** zapis do naszej bazy, sygnatura z serwera, panel żony, PayU.

Dlatego test „czy zapytanie wpada i sygnatura się zgadza” **nie może być samym Pages**. Do tego potrzebny jest mały serwer, który już mamy: `python3 serwer.py` + SQLite `data/zamowienia.sqlite`.

## Docelowy układ (najprostszy pod DN + żonę)

```
Przeglądarka (telefon/komputer)
    → strony HTML w etap-2/www/   (to samo na Pages = podgląd wyglądu)
    → POST /api/inquiry  /api/order  /api/admin
    → serwer.py  →  SQLite (zamówienia, zapytania, sygnatury, produkty)
```

- **Klient:** koszyk, Zapytanie (personalizacja), Zamów (gotowiec + sygnatura), checkbox regulaminu, konto po e-mailu.
- **Żona:** `warsztat.html` / panel — lista zapytań i zamówień, status, **kategorie i karty produktów** (nazwa, cena, krótki opis, zdjęcie z folderu). Bez Gita, bez kodu.
- **Ty:** laser, sygnatury `RRRR-MM-DD-XXXX`, realizacja.
- **Płatność:** na testach **przelew / „zapłacę po mailu”**. PayU (BLIK) doklejamy, gdy baza i panel żyją — nie Woo, tylko bramka na „Zamów”.

## Co odrzucamy i dlaczego

| | |
|---|---|
| WooCommerce / WordPress | Hosting, aktualizacje, inny wygląd, PayPal-myślenie. Już odłożone. Żona i tak nie ma klikać w 40 wtyczek. |
| Same Pages + e-mail | Sygnatura i baza nie są nasze; nic nie „wpada” poza skrzynkę. |
| Magento / Shopify | Koszt, angielski checkout, za wcześnie. |

## Testy — dwa biegi

1. **Wygląd / mobile / rodzina klika** — Pages z folderu `etap-2/www/` (Ty włączasz z kompa, gdy będziesz chciał; **DNS domeny nie ruszamy**). Koszyk działa lokalnie w telefonie gościa; zamówienie *wygląda* jak działa.
2. **Prawdziwa baza** — u Ciebie `python3 etap-2/www/serwer.py`, telefon w tej samej Wi‑Fi albo tunel (Cloudflare Tunnel / ngrok) → rodzina wchodzi na link, zapytanie ląduje w SQLite, warsztat to pokazuje.

Dopóki (2) nie stoi, nie obiecujemy rodzinie „dostaniemy wasze zamówienie”.

## Kolejność roboty (A→Z funkcjonalności, nie katalog 200 SKU)

1. Jedna skórka, mobile, stopka, regulamin, checkbox.
2. Koszyk + sygnatura + SQLite (jest szkic).
3. Panel żony: produkty/kategorie w bazie, bez kodu.
4. Formularz kontakt = to samo API co zapytanie.
5. Test z prawdziwą bazą na LAN.
6. Pages tylko na wygląd.
7. PayU — osobna decyzja, po tym jak (2)–(4) działa tydzień.

Zdjęcia i długie opisy — w trakcie, placeholdery OK.
