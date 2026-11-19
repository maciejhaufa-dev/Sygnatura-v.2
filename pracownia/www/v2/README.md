# Studio Sygnatura — frontend v2 (podgląd testowy)

Nowa wersja strony: statyczny HTML + CSS + JS, bez frameworka i bez zależności
w przeglądarce. **To nie jest wersja produkcyjna** — produkcja (`studiosygnatura.pl`)
leży w katalogu `docs/` na gałęzi `arena/01a0ca92-sygnatura-v-2` i celowo nie została
tą pracą dotknięta.

```
pracownia/www/v2/
  index.html          strona główna: nagłówek, wyszukiwarka, wyróżniony kontakt,
                      hero, produkty, realizacje, pasek kontaktu, o pracowni
  sklep.html          lista produktów + informacja o braku koszyka/konta
  produkt.html        karta produktu (?id=katalog-1 | katalog-2 | pers-grawer)
  realizacje.html     wszystkie realizacje z pracowni
  pracownia.html      technika i przebieg zamówienia
  wspolpraca.html     okazje, firmy, organizatorzy
  szukaj.html         wyszukiwarka (?q=…) — produkty i realizacje
  kontakt.html        formularz zapytania + telefon/e-mail/obszar
  404.html
  assets/style.css    cały wygląd (paleta i krój z księgi znaku)
  assets/ui.js        nagłówek, stopka, karty produktów i realizacji
  assets/produkt.js   karta produktu
  assets/szukaj.js    wyszukiwarka
  assets/formularz.js formularz zapytania (walidacja + wysyłka do API)
  assets/logo*.svg    znak z pracownia/logo/WEKTORY3/SYGNET_okrag.svg
  assets/img/*.jpg    prawdziwe zdjęcia z docs/assets/media/sklep (przeskalowane)
  data/dane.js        dane strony — generowane, nie edytowane ręcznie
  tools/gen-dane.mjs  generator danych z plików produkcyjnych
  tools/serwuj.mjs    podgląd lokalny (bez zależności)
```

## Uruchomienie podglądu

```bash
cd pracownia/www/v2
node tools/serwuj.mjs 8002      # → http://localhost:8002
```

Albo dowolny serwer statyczny wskazany na ten katalog. Strona działa też po
otwarciu `index.html` z dysku, ale wtedy przeglądarka blokuje `data/dane.js`
(plik lokalny) — dlatego do podglądu używamy serwera.

## Skąd biorą się dane (bez wpisywania z ręki)

`data/dane.js` powstaje z plików gałęzi produkcyjnej:

| Dane | Źródło |
|---|---|
| produkty, ceny, dostępność | `docs/data/katalog.js` |
| grawer okolicznościowy i jego cena | `docs/assets/config.js` → `PERSONALIZACJE` |
| telefon, e-mail, API | `docs/assets/config.js` |
| realizacje (nazwy, opisy, daty) | seed bloga w `docs/assets/api.js` |
| zdjęcia | `docs/assets/media/sklep/*.jpg` |

Po zmianie źródła:

```bash
git fetch origin arena/01a0ca92-sygnatura-v-2
node tools/gen-dane.mjs        # albo: node tools/gen-dane.mjs <inny-ref>
```

**Nie dopisujemy cen, telefonów ani adresów w HTML.** Cena w karcie na stronie
głównej jest sprawdzana testem: musi zgadzać się z `data/dane.js`.

## Zasady, których pilnuje ten frontend

- **Kolejność kart:** nowość → bestseller → okolicznościowy (`data/dane.js` →
  `kolejnosc`, `odznaki`). Nowość = pierwsza pozycja katalogu; okolicznościowy =
  grawer na komunię/jubileusz.
- **Bestseller:** `odznaki.bestseller = null`, bo w danych nie ma potwierdzenia
  sprzedaży. Sekcja na stronie głównej mówi to wprost. Gdy licznik zamówień
  będzie w arkuszu — wystarczy uzupełnić generator, HTML się nie zmienia.
- **Wyszukiwarka:** działa lokalnie na `data/dane.js`, wynik ma własny adres
  (`szukaj.html?q=…`), normalizuje polskie znaki („krzyzowka” = „krzyżówka”).
- **Kontakt:** `tel:`, `mailto:` i formularz na `kontakt.html`. Formularz wysyła
  na to samo API Apps Script (`akcja=wiadomosc`), którego używa obecny serwis;
  przy błędzie pokazuje powód i awaryjny e-mail — nigdy fałszywego „wysłano”.
- **Brak atrap:** nie ma koszyka ani panelu klienta. `sklep.html` mówi wprost,
  że zamówienie idzie przez formularz/telefon.
- **Kategorie** produktów pochodzą z danych (Dekoracje świąteczne, Szyldy
  i tablice, Prezenty personalizowane) — nie zmieniamy ich struktury.

## Czego ten frontend nie rusza

- `docs/` (produkcja, CNAME `studiosygnatura.pl`) — bez zmian.
- pliki `.gs`, arkusz Google i wdrożenie `/exec` — bez zmian.
- Ustawienia GitHub Pages — bez zmian.

## Podgląd równoległy (do potwierdzenia przez właściciela)

Propozycja: **osobne, publiczne repozytorium** (np. `Sygnatura-v2-preview`) z tym
katalogiem w korzeniu, GitHub Pages ze źródła „Deploy from a branch → main / (root)”,
**bez pliku CNAME** i bez domeny własnej. Adres będzie postaci
`https://<konto>.github.io/Sygnatura-v2-preview/`. Wtedy:

- produkcja dalej działa ze starego repozytorium i `docs/` + CNAME,
- podgląd ma inny adres, więc nic nie trafia pod `studiosygnatura.pl`,
- wszystkie linki w środku są względne, więc podkatalog w adresie nie psuje nawigacji.

Repozytorium i jego ustawienia wymagają zgody właściciela — nie zostały utworzone.

## Testy wykonane w tej sesji

Uruchamiane lokalnie na `http://127.0.0.1:8002` (jsdom, prawdziwe pliki przez HTTP):

- brak martwych linków, brakujących obrazów, zduplikowanych `id`, pól bez etykiet,
- brak błędów JS na wszystkich 9 stronach,
- kolejność i odznaki kart na stronie głównej, zgodność ceny w hero z danymi,
- karta produktu (3 produkty + nieistniejące id), miniatury zdjęć, „zobacz też”,
- formularz: walidacja pól, zgoda, błąd sieci → komunikat i awaryjny `mailto:`,
- menu mobilne: `aria-expanded`, klasa `open`, zmiana etykiety na „Zamknij menu”,
- wyszukiwarka: „szopka”, „krzyzowka”, „grawer”, fraza bez wyników.

**Nie sprawdzono:** wyglądu w prawdziwej przeglądarce i na fizycznym telefonie
(w tym sandboxie nie ma przeglądarki z wymaganymi bibliotekami systemowymi),
działania wdrożonego API Apps Script ani niczego na produkcji. Test połączenia
z API trzeba zrobić z podglądu na `github.io` — wysyłka z `localhost` może być
blokowana przez CORS.
