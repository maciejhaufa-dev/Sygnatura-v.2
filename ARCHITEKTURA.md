# ARCHITEKTURA SERWISU v2 — „JEDEN SERWER, JEDNA BAZA, JEDEN PROBLEM"

> Dokument roboczy dla Studio Sygnatura i kolejnych agentów AI. Stan: 2026-09-09.
> DECYZJA WŁAŚCICIELA (sesja 24): wszystko stawiamy na JEDNEJ maszynie pod domeną studiosygnatura.pl;
> domena + poczta w OVH już działają (Zimbra/OVH Mail). Priorytet: STABILNOŚĆ i MINIMALNA OBSŁUGA
> (stroną administracyjną zarządza głównie żona). Budżet awaryjny na serwer: do ~100–200 zł/rok.
> PythonAnywhere FREE zostaje wyłącznie jako poligon testowy (nic produkcyjnego tam nie stoi).

---

## 1. SCHEMAT DOCELOWY (ile węzłów naprawdę jest)

```
                    PRZEGLĄDARKA KLIENTA
                          │ HTTPS
                          ▼
        ┌───────────────────────────────────────────────┐
        │  OVH — DNS (domena studiosygnatura.pl)        │
        │    A  @  →  IP SERWERA   (jedyny wpis, który   │
        │    CNAME www → domena     dodajemy; MX i poczta │
        │                          zostają BEZ ZMIAN)    │
        └───────────────────────┬───────────────────────┘
                                ▼
        ┌───────────────────────────────────────────────┐
        │        JEDEN SERWER (Oracle Always Free — 0 zł │
        │        albo płatny VPS jako plan B)            │
        │  Ubuntu + nginx (SSL Let's Encrypt, auto)      │
        │    └─ gunicorn → Flask (serwis/)               │
        │         └─ SQLite data/serwis.db   ← BAZA:     │
        │            klienci, kooperanci, zamówienia,    │
        │            katalog, wiadomości, ustawienia     │
        │  ZDJĘCIA: serwis/data/uploads (dysk serwera;   │
        │  Oracle daje 200 GB) — żona wgrywa w panelu    │
        │  BACKUP: cron 03:00 → /opt/sygnatura/backup    │
        │  (30 dni) + kopia bazy na skrzynkę OVH         │
        └──────┬────────────────────┬───────────────────┘
               │ SMTP (wysyłka)     │ HTTPS (obrazki opcjonalnie zewn.)
               ▼                    ▼
        OVH POCZTA (działa)   Google Drive (TYLKO opcjonalnie)
        smtp.mail.ovh.net:587
        From: kontakt@studiosygnatura.pl

   Pozostałe „usługi" — wyjaśnienie, żeby nikt nie myślał, że to 15 serwisów:
   • GitHub = SZAFA Z KOPIĄ KODU + mechanizm aktualizacji. Niewidoczny w codziennej obsłudze
     (żona nigdy go nie otwiera). To nie jest „kolejny serwis do pilnowania" — to ubezpieczenie.
   • Google Sheets = OPCJONALNIE lustro zamówień do raportów kwartalnych (mąż/żona, podatki).
     Nie jest krytyczny: jak padnie, serwis działa dalej.
   • Google Drive = OPCJONALNIE na duże pliki (PDF-y, filmy). Domyślnie zdjęcia trzymamy LOKALNIE.
```

**Co to daje:** jedna maszyna, na której jest wszystko: aplikacja, baza, zdjęcia, dokumenty, backup.
Jak mamy serwer w ręku — mamy CAŁY biznes w ręku. Backup wychodzi na zewnątrz raz dziennie (skrzynka OVH).

---

## 2. GDZIE CO JEST ZAPISYWANE

| Dane | Miejsce | Uwagi |
|------|---------|-------|
| Zamówienia / rezerwacje | SQLite `data/serwis.db` (tabela `rezerwacje`) | sygnatura, statusy, pozycje/personalizacje/kwoty JSON, rozliczenie mąż/żona |
| Klienci z kontem (planowane) | SQLite (`klienci`) | email + hash hasła (albo magic-link); **gość = NULL** → zakupy bez rejestracji |
| Kooperanci/partnerzy (planowane) | SQLite (`partnerzy`) | indywidualna sygnatura (PART-XXX), rabat, typ; `rezerwacje.partner_id` |
| Katalog (sklep, personalizacje, pakiety) | SQLite | pole `obraz` = nazwa pliku LUB pełny link https (mechanizm zostaje jako opcja) |
| Wiadomości, maile (fallback), szablony, ustawienia/sekrety, szkice | SQLite | hasła/SMTP/klucze TYLKO tu — nigdy w repo |
| Zdjęcia produktów, realizacji, hero | **lokalnie** `serwis/data/uploads/` + `serwis/static/media/sklep/` | żona wgrywa w panelu admina (przycisk „wybierz plik"), tak jak na Facebooku |
| Dokumenty (regulamin PDF, umowy) | lokalnie `serwis/data/dokumenty/` (małe) albo link do Drive (duże) | w bazie trzymamy link |
| Raporty kwartalne | Google Sheets (opcjonalnie) | kopia do podatków, nie źródło prawdy |
| Kod | GitHub (repo publiczne — zero sekretów) | wdrożenie = `git pull` + restart |

**Dlaczego SQLite:** baza waży dziś 96 KB; 10 000 zamówień ≈ kilka MB; brak osobnego
procesu bazy = mniej rzeczy do pilnowania, backup = skopiowanie jednego pliku.
(Zewnętrzna baza nic nie da — to dodatkowy węzeł, dokładnie to, czego nie chcemy.)

---

## 3. KOPIE ZAPASOWE (żona nie musi nic robić)

- **cron 03:00 codziennie** (`deploy/backup.sh`): bezpieczna kopia `.backup` (SQLite) → gzip →
  `/opt/sygnatura/backup/` (retencja 30 dni) + **kopia bazy na skrzynkę OVH** (załącznik; baza to KB).
- **Przycisk w panelu admina**: „Pobierz kopię bazy" (plik na telefon/komputer).
- **Przy każdej aktualizacji** (`deploy/aktualizuj.sh`) najpierw robi się kopia.
- **Odtworzenie po awarii**: nowy serwer → `deploy/instalacja.sh` → wgrać `serwis.db` → gotowe.
  Czas: **< 1 godzina**. To cała filozofia: kod w repo, baza w jednym pliku, media w jednym katalogu.

---

## 4. DOMENA I POCZTA (stan faktyczny + co robimy)

**Macie:** domenę studiosygnatura.pl w OVH + działającą pocztę (Zimbra/OVH Mail, MX skonfigurowane).

| Co | Kiedy | Co robimy |
|----|-------|-----------|
| Poczta (odbieranie) | działa teraz | NIC nie zmieniamy. MX zostaje w OVH. |
| Strona pod domeną | przy starcie serwera | u OVH dodajemy TYLKO: rekord **A** (`@` → IP serwera) i **CNAME** (`www` → domena). MX/SPF/DKIM nietknięte. |
| Wysyłka maili z serwisu | przy starcie | w panelu → Ustawienia wpisujemy SMTP OVH: `smtp.mail.ovh.net:587`, login/hasło skrzynki `kontakt@studiosygnatura.pl`. Maile wychodzą z adresu domeny. |
| SSL | automat | certbot (Let's Encrypt) — certyfikat odnawia się sam. |

---

## 5. OBSŁUGA CODZIENNA (perspektywa żony)

Jeden adres: **panel `/admin/`** (login + hasło). Codzienna praca to 4 czynności:
1. **Zamówienia** — otworzyć nowe (widzi sygnaturę, pozycje, rachunek), zmienić status (zapytanie → płatność → zarezerwowane); maile do klienta wysyłają się same.
2. **Wiadomości** — odczytać z formularza kontaktowego (z tematem), odpowiedzieć.
3. **Sklep / Realizacje** — dodać produkt albo wpis: tytuł, opis, cena, **zdjęcie z telefonu** (przycisk wyboru pliku).
4. **Kopie** — raz na miesiąc kliknąć „Pobierz kopię bazy" (albo wcale — robi się sama).

Wszystko inne dzieje się samo: serwis wstaje po restarcie serwera (systemd), certyfikat się odnawia,
backup robi się nocą, monitoring zewnętrzny (np. UptimeRobot, darmowy) wysyła e-mail, gdyby strona padła.
Aktualizacje robię ja (albo przycisk w panelu — do zrobienia w etapie 2).

---

## 6. RYZYKA I ICH ZABEZPIECZENIA (szczerze)

| Ryzyko | Co robimy |
|--------|-----------|
| **Oracle usypia/reklamuje nieużywaną instancję** (znany proceder Oracle) | zewnętrzny monitor pinguje stronę co 5 min (UptimeRobot, 0 zł) — to trzyma ruch; + codzienny backup POZA Oracle (skrzynka OVH), więc nawet utrata VM nic nie kosztuje; + skrypt migracji na inny serwer < 1 h |
| Oracle zablokuje konto / zmieni warunki free | to samo co wyżej + gotowy plan B |
| Serwer pada fizycznie | systemd podnosi aplikację po restarcie; backup na skrzynce |
| Żona skasuje coś przez przypadek | panel ma potwierdzenia przy usuwaniu; backup nocny pozwala cofnąć dzień |
| Wyciek sekretów przez publiczne repo | sekrety (hasła, SMTP) wyłącznie w bazie; sprawdzane przy każdym commicie |
| Ktoś zgadnie hasło panelu | hasło + w planach: logowanie 2FA / kod z e-maila |

---

## 7. PORÓWNANIE OPCJI (koszt + ile pracy przy utrzymaniu)

| Opcja | Koszt | Utrzymanie | Werdykt |
|-------|-------|------------|---------|
| **Oracle Always Free** (nasz plan) | 0 zł (wymaga karty do weryfikacji, bez obciążeń) | po jednorazowym postawieniu (skrypt gotowy w `deploy/`): ~0 h/tydzień + monitor + plan B | **START TUJ** |
| **Płatny VPS EU** (Hetzner CX22 ~€3,79/msc ≈ 200 zł/rok; OVH VPS Starter ~€3,50/msc) | ~150–220 zł/rok | takie samo jak Oracle, ale bez ryzyka „reklamacji" — **PLAN B** (kupujemy tylko, jeśli Oracle zawiedzie) | awaryjny |
| **WordPress + WooCommerce** na hostingu PHP | hosting ~150–300 zł/rok + płatne wtyczki (rezerwacje/kaucje) | ⚠️ WIĘCEJ pracy: aktualizacje WP i wtyczek, łatki bezpieczeństwa, konfiguracja wynajmu/kaucji/personalizacji od zera. **Cały nasz system (kreator A/B/C, sygnatury, rozliczenia) poszedłby do kosza i musiałby być zbudowany od nowa we wtyczkach.** | tylko gdybyśmy mieli porzucać własny system |
| **Odoo** | „One App Free" = 0 zł, ale: hosting Odoo, bez dostępu do własnego kodu; własna domena gratis tylko przez 1. rok, potem płatna; e-commerce/księgowość = płatne plany (~70–135 zł/msc+) | budowa sklepu od zera w ich builderze; nasza logika (wynajem, kaucje, sygnatury) i tak nie przeniesie się | nie dla nas |

**Budżet 50–100 zł/rok na serwer:** realnie kupimy za to tylko ultra-tanie VPS-y z USA (promocje typu RackNerd ~50–70 zł/rok) — jako produkcja dla firmy to ryzyko. Dlatego rekomendacja:
**start na Oracle (0 zł, budżet nietknięty) + plan B w kieszeni (Hetzner/OVH ~150–220 zł/rok, decyzja o zakupie dopiero, gdyby Oracle zrobił problem).** Migracja między nimi to ten sam skrypt i <1 h.

---

## 8. ETAPY (kolejność prac nad fundamentem)

| Etap | Co | Stan |
|------|----|------|
| 0 | PythonAnywhere FREE = poligon testowy (baza testowa, podgląd) | ✅ stoi, działa |
| 1 | Oracle: VM (Ubuntu) → `deploy/instalacja.sh` → DNS (A + CNAME u OVH) → certyfikat → testy pod domeną | **NASTĘPNY KROK** (skrypt gotowy w repo) |
| 2 | Stabilizacja: SMTP OVH w ustawieniach, backup nocny na skrzynkę, monitoring UptimeRobot, kopia bazy w panelu, „Pulpit" dla żony, przycisk aktualizacji | po etapie 1 |
| Plan B | Jeżeli Oracle zawiedzie: ten sam skrypt na Hetzner/OVH VPS | gotowy w każdej chwili |

---

## 9. DECYZJE DO PODJĘCIA (checklist)

1. Zakładamy konto Oracle (wymagana karta do weryfikacji — bez opłat)? Czy wolisz od razu płatny VPS (~150–220 zł/rok)?
2. Podajesz dane SMTP skrzynki OVH (login + hasło lub hasło aplikacji) do wpięcia w panel → Ustawienia, żeby maile szły z domeny?
3. Arkusz Google (raporty kwartalne mąż/żona) podpinamy teraz czy zostawiamy na później (etap 2)?
4. Potwierdzasz, że zdjęcia trzymamy LOKALNIE na serwerze (Oracle = 200 GB dysku), a Dysk Google tylko na duże pliki/opcjonalnie?

---

## 10. SŁOWNICZEK
**PA** = PythonAnywhere (poligon testowy) · **Oracle** = maszyna docelowa (Always Free) ·
**systemd** = usługa, która sama podnosi serwis po restarcie · **nginx** = front serwujący statyki i SSL ·
**gunicorn** = proces Flaska · **cron** = nocny automat backupu · **sparse-checkout** = klon repo bez ciężkich folderów ·
**A/CNAME** = wpisy DNS kierujące domenę na serwer · **MX/SPF/DKIM** = wpisy poczty (nie ruszamy) ·
**SMTP OVH** = wysyłka maili z adresu domeny · **SYG-2026-001** = sygnatura sprawy · **PART-XXX** = sygnatura partnera (planowana).
