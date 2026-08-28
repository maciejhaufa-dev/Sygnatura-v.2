# Test zamówień na kompie (SQLite)

Nie Pages, nie domena, nie MX.

```bash
cd podglad-serwisu
python3 serwer.py
```

Otwórz http://127.0.0.1:8080

## Scenariusz (zrób kilka razy)

1. Metryczki → Do koszyka (349 zł)
2. Do domu → Krzyżówka → Zapytanie + sygnatura (musi paść `RRRR-MM-DD-0001`)
3. Koszyk → imię, e-mail, wybór sygnatury → Zamów
4. Konto → ten sam e-mail → widać zapytanie i zamówienie
5. `warsztat.html` — to samo w bazie `data/zamowienia.sqlite`

Drugi klient = inny e-mail, kolejna sygnatura `0002`.

Zdjęcia produktów: Twoje JPG z `uploads/IMG_20260828_*` (nie generator).
