# ARCHITEKTURA SERWISU — mapa techniczna (fundament)

> Dokument roboczy dla Studio Sygnatura i dla kolejnych agentów AI.
> Stan: 2026-09-09 · Etap 1 (PythonAnywhere FREE) — aktualny · Etap 2 (Oracle Cloud) — planowany.
> Zasada naczelna: **system ma być LEKKI, TANI i ODZYSKIWALNY** — kod w repo, dane w bazie, media na zewnątrz, wszystko da się odtworzyć w <1 h.

---

## 1. WĘZŁY (co gdzie stoi)

| # | Węzeł | Co robi | Koszt | Uwagi |
|---|-------|---------|-------|-------|
| 1 | **PythonAnywhere FREE** (etap 1) | Serwer aplikacji: Flask + SQLite | 0 zł | Limity: 512 MB dysku, 100 CPU-s/dzień, 1 web app, **połączenia wychodzące tylko HTTP(S) do whitelisty**, brak zadań planowanych na nowych kontach, login + odnowienie app co ~miesiąc. |
| 2 | **Oracle Cloud Always Free** (etap 2) | Docelowy serwer aplikacji: Ubuntu + nginx + gunicorn + Flask | 0 zł | 2 maszyny AMD (1/8 OCPU, 1 GB RAM) LUB do 4 OCPU ARM/24 GB; 200 GB dysku; 10 TB egress/mies.; wyjście do internetu BEZ ograniczeń. Ryzyko: Oracle może usypiać/reklamować nieużywane instancje. |
| 3 | **GitHub** (cały czas) | Repozytorium kodu, PR, historia; Pages = tylko statyczna wizytówka | 0 zł | ⚠️ repo jest PUBLICZNE — żadnych haseł/tokenów w plikach (są w bazie/ustawieniach). |
| 4 | **Google Drive** | Magazyn MEDIÓW i dokumentów: zdjęcia produktów/realizacji, PDF-y (regulamin, umowy) | 0 zł (miejsce, które już macie) | Pliki udostępnione „każdy, kto ma link"; w bazie trzymamy TYLKO link. Obrazki ładuje przeglądarka klienta — serwer ich nie dotyka. |
| 5 | **Google Sheets (+ Apps Script)** | Lustro zamówień do RAPORTÓW (kwartały, podział mąż/żona do podatków) | 0 zł | NIE jest bazą — tylko kopia do czytania. Wzór: `serwis/sheets/webhook.gs`. |
| 6 | **Gmail + SMTP** (etap 1) | Wysyłka maili z aplikacji (potwierdzenia, powiadomienia, backup) | 0 zł | Na free PA jedyny działający SMTP = `smtp.gmail.com:587` + hasło aplikacji (Google jest na whitelistie). |
| 7 | **OVH — domena + poczta** | Domena `studiosygnatura.pl`, skrzynki w domenie (kontakt@…), ewentualnie hosting (etap 3) | domena ~50–80 zł/rok; MX Plan ~1–2 €/msc | DNS, MX, SPF/DKIM — patrz §5. |
| 8 | **Komputer lokalny / sandbox** | Rozwój i testy (to, co robimy teraz) | 0 zł | Ten sam kod, lokalna kopia bazy. |

**Dlaczego SQLite, a nie zewnętrzna baza?** Realne liczby z naszego systemu: baza waży **96 KB**, zdjęcia wgrane 7 MB. 1000 klientów ≈ 1–2 MB, 10 000 zamówień ≈ kilka MB. Na free PA i tak NIE da się połączyć z żadną zewnętrzną bazą (whitelist). W etapie 2 SQLite dalej wystarcza; Oracle daje 2 darmowe bazy Autonomous (20 GB) jako opcję „na wyrost".

---

## 2. PRZEPŁYW DANYCH (kto z kim rozmawia)

```
                         ┌──────────────────────────────────────────────┐
                         │               PRZEGLĄDARKA KLIENTA            │
                         └───────┬──────────────┬───────────────┬───────┘
                                 │ HTTPS        │ HTTPS (obrazki)│ HTTPS (fonty)
                                 ▼              ▼               ▼
              ┌──────────────────────────┐   ┌────────────┐  ┌──────────────┐
              │  PYTHONANYWHERE (etap 1) │   │ Google     │  │ Google Fonts │
              │  Flask + SQLite          │   │ Drive      │  │ (Cormorant)  │
              │  ┌────────────────────┐  │   │ (media,    │  └──────────────┘
              │  │ data/serwis.db     │  │   │  PDF-y)    │
              │  │ tabele:           │  │   └────────────┘
              │  │ rezerwacje,        │  │
              │  │ klienci*,          │  │        ┌──────────────────┐
              │  │ partnerzy*,        │  │        │ OVH — POCZTA     │
              │  │ wiadomosci,        │  │        │ (odbiera maile,  │
              │  │ sklep_produkty…    │  │        │  skrzynki        │
              │  └────────────────────┘  │        │  kontakt@…)      │
              └────┬──────────┬──────────┘        └──────────────────┘
                   │ SMTP     │ HTTP(S) tylko whitelist
                   ▼          ▼
        ┌─────────────────┐  ┌────────────────────────────┐
        │ Gmail SMTP      │  │ Google Apps Script (pull)  │──▶ Google Sheets
        │ (maile + kopie  │  │ GET /api/raport?token=…    │    (raporty kwartalne)
        │  backupu bazy)  │  │ (wyzwalacz czasowy Google) │
        └─────────────────┘  └────────────────────────────┘

   ETAP 2 (docelowo) — zmienia się tylko serwer:
        OVH DNS: A → IP Oracle (domena!), MX → OVH
        Oracle VM (Ubuntu + nginx + gunicorn + Flask + SQLite)
          ├─ SMTP → OVH MX Plan (From: kontakt@studiosygnatura.pl)
          ├─ cron 03:00 → backup bazy → Google Drive (folder „Backup")
          ├─ Sheets API → webhook push (już bez kombinacji)
          └─ GitHub: git pull = wdrożenie
```

Kierunki i ich zasady:
- **Przeglądarka ↔ serwis**: wyłącznie HTTPS. To jedyne „drzwi” do aplikacji.
- **Serwis ↔ SQLite**: lokalny plik na tym samym dysku (najszybsze, najtańsze CPU).
- **Przeglądarka ↔ Google Drive**: przeglądarka sama pobiera obrazki (`drive.google.com/thumbnail?id=…&sz=w1200`) — serwer nie widzi tych bajtów, nie płaci CPU ani transferu.
- **Serwis → Gmail SMTP (etap 1)**: maile wychodzą z adresu Gmail, z `Reply-To: kontakt@studiosygnatura.pl`; treść i szablony już są w bazie.
- **Sheets**: w etapie 1 najpewniej NIE da się „pchnąć” z free PA (script.google.com może nie być na whitelistie) — dlatego **Apps Script sam ściąga** dane z publicznego endpointu (`/api/raport?token=…`) wyzwalaczem czasowym po stronie Google. Połączenia PRZYCHODZĄCE na PA nie są ograniczane.
- **GitHub → serwer**: `git pull` + Reload = wdrożenie (działa tak samo na PA i na Oracle).
- **Kopie zapasowe**: patrz §4.

---

## 3. GDZIE CO JEST ZAPISYWANE (baza danych użytkowników / kooperantów / zamówień)

Jedna baza SQLite `serwis/data/serwis.db` — wszystkie dane operacyjne w jednym miejscu (łatwy backup = jeden plik):

| Dane | Miejsce | Tabela / mechanizm | Uwagi |
|------|---------|--------------------|-------|
| **Zamówienia / rezerwacje** | SQLite | `rezerwacje` | Sygnatura, statusy (zapytanie → płatność → zarezerwowane → odrzucono), pozycje/personalizacje/kwoty jako JSON, rozliczenie mąż/żona. |
| **Klienci z kontem** (planowane) | SQLite | `klienci` | email unikalny + hash hasła (lub magic-link bez hasła); zamówienie ma `klient_id` — **gość = NULL** (zakupy bez rejestracji zostają). |
| **Kooperanci / partnerzy** (planowane) | SQLite | `partnerzy` | Nazwa, typ (dekorator/hotel/kwiaciarnia/eventy/imprezy firmowe), **indywidualna sygnatura** (np. PART-001), rabat %, status; `rezerwacje.partner_id`. |
| **Katalog** (sklep, personalizacje, pakiety) | SQLite | `sklep_produkty`, `personalizacje`, `pakiety`, `produkty` | Ceny, opisy, kolejność, dostępność, **pole obraz = nazwa pliku LUB pełny link https://**. |
| **Wiadomości z formularzy** | SQLite | `wiadomosci` | Imię, email, telefon, **temat**, treść, zgoda PKE, status. |
| **Maile** (fallback) | SQLite | `mail_outbox` | Kopia każdego maila, gdy SMTP nie działa — widoczna w panelu → Maile. |
| **Ustawienia / sekrety** | SQLite | `ustawienia` | Hasło admina (hash), kody rabatowe `KOD:procent`, dane SMTP, klucze API/Sheets. ⚠️ NIE w repo. |
| **Szablony maili** | SQLite | `szablony_maili` | Edytowalne w panelu, podstawienia %(sygnatura)s itd. |
| **Realizacje** (portfolio) | SQLite | `realizacje` | Tytuł, opis, kategoria + **link do zdjęcia** (Dysk) lub nazwa pliku. |
| **Szkice zamówień** (tymczasowe) | SQLite | `szkice` | Koszyk „w budowie” (klucz `w=`), sprzątane po 48 h. |
| **Sesje / logowanie** | SQLite | `admin_tokens` + ciasteczko Flaska | Token w URL działa bez ciasteczek (panel na telefonie). |
| **Zdjęcia produktów/realizacji** | **Google Drive** | link w bazie | `https://drive.google.com/thumbnail?id=FILE_ID&sz=w1200` (plik: „każdy, kto ma link”). |
| **Dokumenty** (regulamin PDF, umowy, protokoły) | **Google Drive** | link w bazie/ustawieniach | Do podpięcia pod zamówienie. |
| **Raporty kwartalne (mąż/żona)** | **Google Sheets** | lustro przez webhook.gs | Nie źródło prawdy — kopia do podatków. |
| **Kod, szablony, style** | **GitHub** | repo | Publiczne → zero sekretów. |
| **Pliki statyczne** (CSS, favicon, lokalne jpg) | dysk PA (małe) | `serwis/static`, `v4/assets` | Serwowane przez mapowania statyczne PA (0 CPU). |

---

## 4. KOPIE ZAPASOWE (co, gdzie, jak często, jak odtworzyć)

**Zasada:** baza = 1 plik. Backup = skopiowanie tego pliku WYJŚCIE z serwera (na PA nigdy nie trzymamy jedynej kopii).

**Etap 1 (PythonAnywhere FREE — bez zadań planowanych):**
1. **Automat przy starcie aplikacji**: przy każdym starcie/reloadzie sprawdzamy datę ostatniego backupu; jeśli >24 h → kopia `.db` leci mailem przez Gmail SMTP na skrzynkę Studia (baza waży KB — idzie jako załącznik). PA przeładowuje aplikację przy codziennej pracy i przy każdym Reloadzie, więc kopie powstają same.
2. **Przycisk w panelu admina**: „Pobierz kopię bazy” — pobierasz plik na komputer/telefon.
3. **Ręcznie z panelu Files PA**: download `serwis/data/serwis.db`.
4. Dodatkowo: arkusz Google (raporty) jest naturalną kopią „na zewnątrz” najważniejszych pól zamówień.

**Etap 2 (Oracle — pełny automat):**
- `cron` codziennie 03:00: `sqlite3 .backup` (bezpieczne przy działającej bazie) → gzip → upload do **Google Drive/folder „SYGNATURA-Backup”** + trzymanie 30 dni + 1 snapshot miesięczny „na zawsze”.
- Odtworzenie = wgranie pliku na serwer + restart aplikacji (skrypt odtwarzania gotowy).

**Odtwarzanie po awarii (cel: <1 h):** nowy serwer → `git clone` → `pip install flask` → wgrać `serwis.db` → uruchomić. Kod przenośny, baza samodzielna — to cała filozofia.

---

## 5. DOMENA OVH + POCZTA W DOMENIE

**Etap 1 (teraz):** free PA NIE obsługuje własnych domen (to funkcja płatna). Dlatego:
- domena `studiosygnatura.pl` czeka u OVH; w międzyczasie może robić **przekierowanie 301** na `nazwa.pythonanywhere.com`,
- **pocztę w domenie uruchamiamy od razu** (MX Plan OVH, ~1–2 €/msc): skrzynki `kontakt@studiosygnatura.pl` (+ ew. `biuro@`) odbieracie w webmailu OVH/Thunderbirdzie,
- aplikacja wysyła maile z Gmaila z `Reply-To: kontakt@studiosygnatura.pl` — klient widzi adres domeny w „odpowiedz do”.

**Etap 2 (Oracle):** pełne spięcie domeny:

| Rekord DNS (u OVH) | Typ | Wartość | Po co |
|---|---|---|---|
| `@` | A | publiczne IP maszyny Oracle | strona główna |
| `www` | CNAME/A | jak wyżej | www. |
| `@` | MX | `mx1.mail.ovh.net` (mx1/mx2/mx3) | odbieranie poczty w domenie |
| `@` | TXT (SPF) | `v=spf1 include:mx.ovh.com ~all` (+ ewent. Google) | maile nie lądują w spamie |
| dkim | CNAME/TXT | wg instrukcji OVH | podpis DKIM |
| `_dmarc` | TXT | `v=DMARC1; p=none; …` | monitoring nadużyć (opcjonalnie) |

- TLS: certyfikat Let’s Encrypt (certbot) — darmowy, automatycznie odnawiany.
- Wysyłka z aplikacji w etapie 2: **SMTP OVH** (`smtp.mail.ovh.net:587`, dane skrzynki) — From = `kontakt@studiosygnatura.pl`, pełna spójność z domeną (z Oracle wolno łączyć się ze wszystkim).
- Otrzymywanie: skrzynki OVH; w przyszłości można czytać odpowiedzi przez IMAP i wiązać z sygnaturami (funkcja opcjonalna, nie na start).

---

## 6. ETAPY WDROŻENIA (kryteria przejścia)

| Etap | Serwer | Domena | Poczta | Media | Backup | Kryterium przejścia dalej |
|------|--------|--------|--------|-------|--------|---------------------------|
| **1 — teraz** | PythonAnywhere FREE | redirect na PA | odbiór: OVH MX Plan; wysyłka: Gmail SMTP | Dysk Google (linki) | przy starcie + przycisk + ręcznie | realne zamówienia/ruch i/lub boli brak domeny/CPU |
| **1.5 — opcjonalnie** | PA „Hacker” (~5 $/msc) | CNAME na PA | jak wyżej | jak wyżej | jak wyżej | jeśli chcemy domenę na PA zanim przejdziemy na Oracle |
| **2 — docelowo** | Oracle Cloud Always Free (nginx+gunicorn) | A → IP Oracle | odbiór: OVH; wysyłka: SMTP OVH | Dysk Google + wgrywanie opcjonalne | cron → Drive codziennie | system produkcyjny z domeną i pocztą |
| **3 — awaryjnie** | OVH VPS/Cloud Web | — | — | — | — | jeśli Oracle nie zda egzaminu (kod przenosi się bez zmian) |

---

## 7. LIMITY, RYZYKA I ZABEZPIECZENIA

| Ryzyko/limit | Skutek | Zabezpieczenie |
|---|---|---|
| PA free: 512 MB | koniec miejsca | odchudzone repo (sparse-checkout: tylko `serwis/`+`v4/` ≈ 5 MB), media na Drive, baza rośnie ~MB/rok |
| PA free: 100 CPU-s/dzień | przerwa w działaniu po przekroczeniu | statyki przez mapowania PA (0 CPU), lekkie zapytania, Gmail SMTP to czas sieci nie CPU; > kilka tys. wejść/dzień → przejście na Oracle |
| PA free: whitelist wychodząca | zewnętrzne API mogą być zablokowane | nie potrzebujemy ich w etapie 1 (obrazki ładuje przeglądarka; Sheets ciągnie Apps Script; maile przez Gmail) |
| PA free: aplikacja „wygasa” co ~miesiąc | strona pada | login + odnowienie (przypominajka); backup mailowy i tak istnieje |
| Oracle: reklamowanie nieużywanych instancji | serwer wyłączony | monitoring (ping z zewnątrz + cron), backup na Drive, skrypt deploy w repo (odtworzenie <1 h) |
| Publiczne repo GitHub | wyciek sekretów | sekrety wyłącznie w bazie/ustawieniach (hasła, SMTP, tokeny) — sprawdzane przy każdym commicie |
| Utrata konta Google | znikają media | foldery udostępnione drugiemu kontu (mąż/żona), linki w bazie wskazują stabilne ID plików |
| Kradzież/skasowanie bazy | utrata zamówień | backup poza serwerem (mail/Drive) + arkusz Google jako kopia robocza |

---

## 8. DECYZJE DO PODJĘCIA (checklist)

1. **Poczta w domenie**: uruchamiamy OVH MX Plan od razu (koszt ~1–2 €/msc)? Czy na razie zostajemy przy kontakt@studiosygnatura.pl na Gmailu?
2. **Etap 1.5**: czy w ogóle rozważamy płatny PA „Hacker” (~5 $/msc) dla domeny na PA, czy czekamy prosto na Oracle?
3. **Sheets w etapie 1**: podpinamy raporty przez Apps Script (pull), czy odpuszczamy do etapu 2?
4. **Baza w etapie 2**: zostajemy przy SQLite (rekomendacja) czy przechodzimy na Oracle Autonomous (tylko jeśli kiedyś >1 serwer)?
5. **Foldery Google**: nazwy/struktura (SYGNATURA-MEDIA: produkty/, realizacje/, dokumenty/; SYGNATURA-Backup) — akceptujecie?

---

## 9. SŁOWNICZEK (dla szybkiego startu kolejnego agenta)

- **PA** = PythonAnywhere (etap 1) · **Oracle** = docelowy serwer (etap 2) · **whitelist** = lista domen, do których free PA może wychodzić · **sparse-checkout** = klonowanie repo bez ciężkich folderów (pracownia/uploads) · **webhook.gs** = skrypt Apps Script ładujący zamówienia do arkusza · **obrazek** = filtr Jinja, który przepuszcza linki zewnętrzne do zdjęć · **SYG-2026-001** = sygnatura sprawy · **PART-XXX** = indywidualna sygnatura partnera (planowana).
