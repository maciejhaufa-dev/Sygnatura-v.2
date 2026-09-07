# Google Sheets — podpięcie arkusza (webhook)

Arkusz Google to **lustro** rezerwacji (nie baza!): każde zgłoszenie i każda zmiana statusu
dopisuje wiersz do arkusza, żeby żona widziała zapytania na telefonie bez logowania do panelu.

## Jak podpiąć (raz, ~5 minut)

1. **Utwórz arkusz:** sheets.google.com → nowy arkusz, nazwij np. „Sygnatura — rezerwacje".
2. W arkuszu: **Rozszerzenia → Apps Script**.
3. Wklej **całą zawartość `webhook.gs`** (ten folder) zamiast domyślnego kodu. Zapisz (Ctrl+S).
4. Wybierz funkcję **`setup`** z listy u góry → kliknij **Run** → zaakceptuj uprawnienia
   (Google zapyta o dostęp do Twojego arkusza). Nagłówki kolumn utworzą się same.
5. Kliknij **Deploy → New deployment**:
   - typ: **Web app**,
   - Execute as: **Me**,
   - Who has access: **Anyone**,
   - → **Deploy** → skopiuj URL (kończy się `/exec`).
6. W panelu serwisu: **Ustawienia → URL arkusza** → wklej URL → **Zapisz** → **Testuj webhook**.
   W arkuszu pojawi się wiersz z typem `test` — gotowe.

## Jak to działa

- Serwis wysyła POST z JSON-em (wszystkie pola rezerwacji) na URL skryptu.
- Skrypt dopisuje wiersz w arkuszu. Statusy: `zapytanie`, `platnosc_w_toku`, `zarezerwowany`, `odrzucono`.
- Każda próba wysyłki jest logowana w panelu (Ustawienia → „Ostatnie próby wysyłki") —
  jak coś nie dojdzie, zobaczysz tam powód (np. błąd 401 = zła konfiguracja wdrożenia).

## Aktualizacja skryptu

Po zmianie kodu w Apps Script: **Deploy → Manage deployments → ołówek → Version: New → Deploy**.
URL zostaje ten sam, więc w panelu nic nie zmieniasz.

## Uwagi

- Arkusz jest kopią zapasową/widokiem — **prawdą jest baza serwisu** (plik SQLite).
- Nie kasuj ręcznie wierszy i nie zmieniaj kolejności kolumn (skrypt dopisuje po kolei).
- Limit darmowego konta Google: skrypty web app działają w limitach Google — przy kilku
  zgłoszeniach dziennie to żaden problem.
