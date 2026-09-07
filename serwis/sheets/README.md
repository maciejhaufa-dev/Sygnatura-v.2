# Google Sheets — podpięcie arkusza (webhook) + rozliczenia kwartałowe

Arkusz Google to **lustro** rezerwacji (nie baza!): każde zgłoszenie, zmiana statusu
i zmiana rozliczenia dopisuje/aktualizuje wiersz w arkuszu. Skrypt **sam buduje drugą
zakładkę „Podsumowanie kwartałów"**: suma przychodu za kwartał z podziałem
**Mąż / Żona / Wspólne** — gotowe do rozliczeń podatkowych (limit nierejestrowanej
działalności liczysz per osoba).

## Jak podpiąć (raz, ~5 minut)

1. **Utwórz arkusz:** sheets.google.com → nowy arkusz, nazwij np. „Sygnatura — rezerwacje".
2. W arkuszu: **Rozszerzenia → Apps Script**.
3. Wklej **całą zawartość `webhook.gs`** (ten folder) zamiast domyślnego kodu. Zapisz (Ctrl+S).
4. Wybierz funkcję **`setup`** z listy u góry → kliknij **Run** → zaakceptuj uprawnienia
   (Google zapyta o dostęp do Twojego arkusza). Powstaną 2 zakładki: Rezerwacje + Podsumowanie kwartałów.
5. Kliknij **Deploy → New deployment**:
   - typ: **Web app**,
   - Execute as: **Me**,
   - Who has access: **Anyone**,
   - → **Deploy** → skopiuj URL (kończy się `/exec`).
6. W panelu serwisu: **Ustawienia → URL arkusza** → wklej URL → **Zapisz** → **Testuj webhook**.
   W zakładce „Rezerwacje" pojawi się wiersz z typem `test` — gotowe.

## Kolumny w arkuszu

Kiedy · Typ · Sygnatura · Utworzono · Status · Data imprezy · Pakiet · Temat · Imię · E-mail ·
Telefon · Treść · Najem od · Najem do · Doby · Pozycje (JSON) · Personalizacje (JSON) ·
**Rozliczenie** (Mąż/Żona/Wspólne) · **Kwota razem** · Najem · Personalizacja · Kaucja.

Rozliczenie ustawiasz w panelu (szczegóły rezerwacji → „Rozliczenie przychodu") —
skrypt poprawia kolumnę przy istniejącym wierszu (po sygnaturze) i przelicza kwartały.

## Jak to działa / aktualizacja

- Serwis wysyła POST z JSON-em (wszystkie pola rezerwacji + kwoty) na URL skryptu.
- Każda próba wysyłki jest logowana w panelu (Ustawienia → „Ostatnie próby wysyłki").
- Po zmianie kodu w Apps Script: **Deploy → Manage deployments → ołówek → Version: New → Deploy**.
  URL zostaje ten sam.

## Uwagi

- Arkusz jest kopią/widokiem — **prawdą jest baza serwisu** (plik SQLite).
- Nie kasuj ręcznie wierszy i nie zmieniaj kolejności kolumn (skrypt dopisuje po kolei).
- Kwartały liczone są po **dacie imprezy**; wiersze bez daty lub kwoty są pomijane.

