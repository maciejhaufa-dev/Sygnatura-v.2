# Serwis Studio Sygnatura (Flask + SQLite)

Kompletny serwis z panelem administracyjnym: wynajem dekoracji, kalendarze per pakiet,
zgłoszenia z sygnaturami, statusy, autorespondery, katalog i zarządzanie treścią.
**Bez WordPressa, bez WooCommerce, bez kosztów** — czysty Python + HTML/CSS.

## Uruchomienie lokalne (na Twoim komputerze)

Potrzebny jest Python 3 (dowolna wersja 3.9+). W terminalu:

```bash
cd serwis
pip install flask        # tylko raz
python app.py
```

Otwórz w przeglądarce:

| Adres | Co to jest |
|---|---|
| http://127.0.0.1:8000 | strona (index, warsztat, galeria, sklep, kontakt) |
| http://127.0.0.1:8000/wynajem/ | **wynajem z kalendarzami per pakiet** |
| http://127.0.0.1:8000/admin/ | **panel administracyjny** |

**Hasło startowe do panelu: `sygnatura-2026`** — zmień od razu w zakładce *Ustawienia*.

## Co potrafi serwis (workflow wynajmu)

1. Klient wchodzi na `/wynajem/`, wybiera pakiet (komunijny / weselny / firmowy / jubileuszowy × ESENCJA/MID/FULL), każdy pakiet ma **własny kalendarz**.
2. Klika **„Zarezerwuj termin"** → formularz kontaktowy z tematem **„Rezerwacja terminu"** (rozwijana lista).
3. W formularzu: checkbox **„Nadaj nową sygnaturę"** lub **„Mam sygnaturę sprawy"** (odblokowuje pole na numer), miejsce na indywidualną wiadomość, e-mail kontaktowy klienta.
4. Przyciski: **„Zmień termin"** (powrót do kalendarza) lub **„Wyślij zapytanie"**.
5. Po wysłaniu:
   - zgłoszenie trafia do bazy z sygnaturą (np. SYG-2026-001),
   - e-mail leci do `kontakt@studiosygnatura.pl`,
   - zapytanie leci do API Google Sheets (jak podepniemy URL — na razie wyłączone),
   - **autoresponder** do klienta z podsumowaniem: treść pytania, procedura, dokumenty (kaucja w 7 dni; zapłacone = zarezerwowane).
6. W kalendarzu termin dostaje status **„wysłano zapytanie"** — nie blokuje terminu, informuje innych, że ktoś pytał (kto pierwszy, ten lepszy; priorytet stali partnerzy).
7. W panelu admina zmieniasz status: **zapytanie → płatność w toku → zarezerwowany / odrzucono**.
   - „płatność w toku" → termin wstrzymany w kalendarzu (inny kolor) + autoresponder „kaucja w drodze",
   - „zarezerwowany" → termin zablokowany na sztywno + autoresponder potwierdzający,
   - „odrzucono" → termin zwolniony + mail z powodem.

## Panel administracyjny — zakładki

| Zakładka | Do czego służy |
|---|---|
| **Pulpit** | liczniki statusów, najbliższe terminy, ostatnie maile |
| **Rezerwacje** | lista zgłoszeń, filtry statusów, szczegóły, historia zmian |
| **Kategorie** | dodawanie / edycja / usuwanie kategorii katalogu |
| **Produkty** | dodawanie / edycja / usuwanie produktów (nazwa, opis, cena/doba, dostępny) |
| **Pakiety** | pakiety wynajmu + checkbox **„Dostępny na stronie"** (odznacz = pakiet znika ze strony, np. gdy wszystkie terminy zajęte) |
| **Maile** | skrzynka nadawcza serwisu — kopia każdego maila + przycisk „Wyślij ponownie" |
| **Ustawienia** | e-mail kontaktowy, SMTP, hasło panelu, Google Sheets, dokumenty do autorespondera |

## Struktura plików (gdzie co edytować)

```
serwis/
├── app.py            # trasy, formularze, logika (Python — do zmian logiki)
├── db.py             # baza danych + dane startowe (kategorie, produkty, pakiety)
├── core.py           # statusy, sygnatury, treści e-maili, Google Sheets
├── templates/        # SZABLONY HTML (Jinja2) — tu edytujesz wygląd stron
│   ├── wynajem.html       # strona wynajmu z kalendarzami
│   ├── formularz.html     # formularz rezerwacji (checkboxy sygnatur)
│   ├── dziekuje.html      # strona po wysłaniu
│   ├── admin_*.html       # ekrany panelu administracyjnego
│   └── 404.html
├── data/             # NIE W COMMICIE: serwis.db (baza), secret.txt, dokumenty/
│   └── serwis.db     # cała baza SQLite (usunięcie pliku = reset do danych startowych)
└── static/           # (na przyszłość) style.css, grafiki
```

**Zasada:** HTML i CSS edytujesz w `templates/` (zwykły HTML + `{{ zmienne }}`),
bez Pythona. Python tylko tam, gdzie jest logika — wszystko opisane komentarzami po polsku.
Zmiany w szablonach widać od razu (tryb debug przeładowuje automatycznie).

## Co jeszcze do skonfigurowania (krok po kroku)

1. **Prawdziwe hasło** panelu — Ustawienia.
2. **SMTP** — dane poczty, żeby maile faktycznie wychodziły. Bez SMTP wszystko działa, a maile lądują w zakładce *Maile* (podgląd).
3. **Google Sheets** — skrypt Apps Script (webhook). Zgłoszenia i zmiany statusów będą dopisywać wiersze w arkuszu. Zrobimy to w kolejnym kroku.
4. **Dane demo** — w bazie są 4 zgłoszenia SYG-DEMO-*; usuń je w zakładce Rezerwacje. Aby zacząć całkiem czysto: zatrzymaj serwis, usuń `data/serwis.db`, uruchom ponownie — baza odtworzy kategorie, produkty i pakiety, a demo NIE wróci (demo ładuje się tylko przy pierwszym w historii utworzeniu bazy).

## Docelowo (hosting)

Ten sam kod działa na każdym hostingu z Pythonem: **PythonAnywhere (darmowy)**, Render,
albo tani VPS (~30 zł/mies.). GitHub Pages zostaje jako wizytówka statyczna, a ten serwis
to właściwy system z bazą — na hostingu podpięcie domeny studiosygnatura.pl.
