# ARCHITEKTURA SERWISU v3 — HTML + CSS + JS (decyzja właściciela, sesja 26)

> Fundament techniczny. Stan: 2026-09-11.
> WŁAŚCICIEL ZDECYDOWAŁ: serwis jest budowany wyłącznie w HTML + CSS + JavaScript (zna te języki
> i chce sam edytować strony). Python/Flask zostaje porzucony. Silnik (zapisy, maile, panel) to
> JavaScript u Google (Apps Script) z danymi w arkuszu — czyli dokładnie „arkusz Google jako baza",
> czego właściciel chciał od początku. Priorytet: SERWER OBSŁUGIWANY PRZEZ KOGOŚ INNEGO, minimalna
> praca przy utrzymaniu (stronę administruje głównie żona).

## 1. WĘZŁY (ile ich jest NAPRAWDĘ)

```
 PRZEGLĄDARKA (klient i panel admina)
      │ HTTPS
      ▼
 ┌─────────────────────────────────────────────┐
 │ HOSTING STATYCZNY (ktoś inny go utrzymuje)  │   seohost SH2 37 zł/rok — kandydat #1
 │ pliki www/ + domena studiosygnatura.pl + SSL│   (kryteria: patrz §4)
 └──────────────┬──────────────────────────────┘
                │ fetch (tylko przy wysyłce formularzy/zamówień i ładowaniu katalogu)
                ▼
 ┌─────────────────────────────────────────────┐
 │ GOOGLE — SILNIK (utrzymuje Google, nie my)  │
 │  Apps Script (JS): zapis do arkusza,        │
 │  sygnatury, maile (Gmail, Reply-To domena), │
 │  nocny backup na Dysk (SYGNATURA-Backup)    │
 │  ARKUSZ Google = baza (Zamówienia,          │
 │  Wiadomości, Katalog, Ustawienia)           │
 └─────────────────────────────────────────────┘

 OVH: domena + poczta (działa, NIE RUSZAMY — tylko A/CNAME na hosting)
 GitHub: szafa z kodem + DZIENNIK.md (backup rozmowy) + historia
```

**Dlaczego tak jest proste:** statyczna strona nie ma serwera do pilnowania — hostingodawca
utrzymuje maszynę, Google utrzymuje silnik. Awaria którejkolwiek części nie zabija pozostałych,
a całość da się odtworzyć w ~30 minut (wgrać pliki + wkleić 3 pliki .gs).

## 2. GDZIE CO JEST ZAPISYWANE

| Dane | Miejsce | Uwagi |
|------|---------|-------|
| Zamówienia (sygnatura, pozycje, kwoty, status, historia) | arkusz „Zamowienia" (kolumny + JSON) | zapis przez API; podgląd/statusy w admin.html |
| Wiadomości z formularza | arkusz „Wiadomosci" | + kopia mailowa na skrzynkę |
| Katalog (produkty, ceny, zdjęcia) | arkusz „Katalog" | edycja w arkuszu (docelowo z panelu) |
| Ustawienia, licznik sygnatur | arkusz „Ustawienia" | sygnatury z blokadą (LockService) |
| Zdjęcia | `www/assets/media/…` (lokalnie, hosting) lub pełny link https (Dysk) | obie formy działają w kodzie |
| Maile | Gmail (MailApp) z Reply-To: kontakt@studiosygnatura.pl | limit ~100/dzień — wystarczy |
| Backup | codziennie 03:00 → folder „SYGNATURA-Backup" na Dysku (JSON, retencja 30 dni) + alarm mailowy | utrzymuje Google |
| Kod + dziennik rozmowy | GitHub (repo publiczne — sekrety TYLKO w Konfig.gs/arkuszu) | |

## 3. PRZEPŁYWY (akcje API — te same w demo i w produkcji)

| Akcja | Kto | Co robi |
|-------|-----|---------|
| `katalog` | publiczna | zwraca produkty (sklep, szukaj, slider) |
| `wiadomosc` | publiczna | zapis do arkusza + mail do Studia |
| `zamowienie` | publiczna | sygnatura (SYG-2026-NNN), zapis, 2 maile (Studio + klient) |
| `zamowienia-lista` | klucz admina | panel: lista zamówień |
| `zamowienie-status` | klucz admina | panel: zmiana statusu + wpis do historii |

Tryb demo (bez API): te same akcje zapisują do localStorage przeglądarki — strony są w 100%
testowalne lokalnie, a po wklejeniu URL wdrożenia nic się nie zmienia.

## 4. HOSTING — KRYTERIA USTALONE (nie blokują budowy — strona działa na każdym statycznym)

Kryteria dla seohost SH2 (37 zł/rok) — do potwierdzenia u supportu PRZED zakupem:
1. serwowanie statycznych plików HTML/CSS/JS + własna domena + darmowy SSL (pewnie TAK — to standard),
2. cena odnowienia po roku (promocja 37 zł vs standard 127–217 zł netto),
3. czy cokolwiek w pakiecie ogranicza czystą statykę (bez PHP) — np. wymóg indeksu,
4. (opcjonalnie) skrzynki mailowe — mamy już pocztę OVH, więc niekrytyczne.

**Nie potrzebujemy już:** Pythona, cronów, zewnętrznego SMTP, bazy SQL — silnik robi to u Google.
Dlatego wybór hostingu nie zmienia NICZEGO w kodzie: pliki `www/` wgrywa się tak samo wszędzie
(seohost / GitHub Pages / dowolny hosting statyczny). Alternatywa na „kup i zapomnij": MyDevil MD1
(~130 zł/rok, obsługa Pythona — zbędna, ale hosting pewny). Oracle/VPS: niepotrzebny na tym etapie.

## 5. OBSŁUGA CODZIENNA (żona)

1. **Zamówienia**: otworzyć `admin.html?klucz=…` (skrót na telefonie), zmienić status —
   maile o nowym zamówieniu i tak przychodzą na skrzynkę.
2. **Wiadomości**: czytane w skrzynce mailowej (kopia) i w arkuszu.
3. **Katalog**: edycja w arkuszu „Katalog" (docelowo z panelu) — zmiany widać od razu na stronie.
4. **Zdjęcia**: podmiana plików w `www/assets/media/` (przez panel hostingu) lub link z Dysku.

Nic nie wymaga terminala, gita ani programowania. Aktualizacje strony = ja (albo wgranie nowych plików).

## 6. RYZYKA I ZABEZPIECZENIA

| Ryzyko | Zabezpieczenie |
|--------|----------------|
| Google zmieni/quota'nie Apps Script | backup nocny na Dysk; arkusz jest i tak czytelny/eksportowalny; silnik do przepisania w ~1 dzień na dowolny BaaS |
| Hosting statyczny padnie | pliki są w gicie + na dowolnym innym hostingu działają identycznie (migracja = wgranie) |
| Ktoś wywoła API „z zewnątrz" | akcje admina wymagają klucza; publiczne tylko dodają wiersze (walidacja po obu stronach, honeypot) |
| Wyciek sekretów przez publiczne repo | sekrety tylko w Konfig.gs/arkuszu; sprawdzane przy commicie |
| Skasowanie arkusza | backup JSON na Dysku (30 dni) + mail |
| Limit maili Gmaila | 100/dzień wystarcza; w razie wzrostu — Workspace lub inny provider (decyzja później) |

## 7. ETAPY

| Etap | Co | Stan |
|------|----|------|
| 0 | Stary serwis Flask jako referencja (serwis/) | ✅ działa lokalnie, NIE wchodzi do nowego projektu |
| 1 | Nowy projekt www/ + silnik engine/ (demo do testów) | ✅ zbudowane (sesja 26) |
| 2 | Dokończenie ścieżek A (wynajem z kaucją) i B (personalizacja + popup pomysłu), panel pełny | w toku |
| 3 | Wdrożenie: hosting (decyzja po support seohost) + Apps Script + domena A/CNAME + SSL | po etapie 2 |
| 4 | Konta klientów/partnerów (PART-XXX), raporty kwartalne, podmiana docs/ (Pages) | plan |

## 8. SŁOWNICZEK
**Apps Script** = silnik JS u Google · **arkusz** = baza (Zakładki: Zamowienia/Wiadomosci/Katalog/Ustawienia) ·
**TRYB DEMO** = zapis do localStorage (testy bez Google) · **SYG.API** = URL wdrożonego silnika (config.js) ·
**SYG-2026-001** = sygnatura sprawy · **PART-XXX** = sygnatura partnera (planowana) · **klucz** = token admina w adresie panelu ·
**DZIENNIK.md** = backup rozmowy (github).
