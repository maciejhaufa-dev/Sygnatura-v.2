# Strona Studio Sygnatura — jak to jest zbudowane

## Pliki
- `assets/style.css` — jeden arkusz dla całej strony. Kolory na górze w `:root`.
- `pages.py` — **cała treść wszystkich podstron.** Tu się pisze teksty, ceny, nazwy.
- `build.py` — skleja treść z CSS-em i logo, wypluwa gotowe `.html`.

## Jak wprowadzić zmianę
1. Edytujesz `pages.py` (tekst/cena) albo `assets/style.css` (wygląd).
2. `cd www/site && python3 build.py`
3. Gotowe `.html` nadpisują się same.

## Dlaczego tak
CSS i logo są wstrzykiwane **inline** do każdego pliku — każdy `.html` działa
samodzielnie, bez serwera i bez internetu. Wadą jest waga (~85 kB/stronę),
zaletą: wrzucasz na dowolny hosting metodą przeciągnij-i-upuść, nic się nie psuje.

## Struktura serwisu
```
index.html      Start — hero, 5 kafelków, jak to działa, dlaczego u nas
rzemioslo.html  Dwie sylwetki (on / ona), etapy pracy
metryczki.html  Karta produktu + warianty + zestaw + "inni zamawiali" + FAQ
numery.html     j.w. (wnętrze, sklejka, warstwy)
szyldy.html     j.w. (zewnątrz, lite drewno, CNC) — ODDZIELNA kategoria
wynajem.html    Okazje (6) + zasady (6) + katalog 8 poz. + pamiątki + FAQ
wspolpraca.html Dla organizatorow: warunki B2B + pamiatki okolicznosciowe + FAQ
dla-firm.html   Pakiet hotelowy, zakres, gdzie jeszcze
kontakt.html    Formularz + dane bezpośrednie
```
Pasek „Nie możesz znaleźć tego, o czym myślisz?" jest na **każdej** podstronie
poza kontaktem (tam byłby zapętleniem).

## Do zrobienia
- [ ] Podmienić placeholdery `data-ph` na realne zdjęcia (sesja 5.09)
- [ ] Podpiąć formularz (Formspree) + klauzula PKE art. 398
- [ ] Zweryfikować ceny wynajmu i pamiątek — są wstępne, do konfrontacji z rynkiem
- [ ] Ustalić realny próg rabatu B2B (dziś: od 3. imprezy w sezonie)
- [ ] Opcje (ramka/motyw) są dziś statyczne — ożywić dopiero przy konfiguratorze

## Terminarz wynajmu
- Dane: `assets/kalendarz.js`, obiekt **`ZAJETE`** na gorze pliku.
  Klucz = id pakietu (`klasyczny`, `lesny`, `rustykalny`, `komunijny`, `firmowy`, `wlasny`),
  wartosc = lista dat `RRRR-MM-DD`.
- Po dopisaniu/usunieciu daty: `python3 build.py`. Kalendarze na wynajem.html
  i wspolpraca.html aktualizuja sie razem — jedno zrodlo danych.
- Klikniecie wolnego dnia przenosi date + pakiet do formularza `#rezerwacja`
  i przewija strone do niego.
- Dni przeszle sa wygaszone, zajete ciemnozielone i nieklikalne.

### Ograniczenie (swiadome)
Bez serwera **nie da sie** zablokowac terminu automatycznie w chwili wyslania.
Obecny przeplyw: klient zglasza -> Wy potwierdzacie -> dopisujecie date do `ZAJETE`
-> przebudowa. Komunikat na stronie mowi o tym wprost ("termin trzymamy 48 h"),
wiec nikt nie jest wprowadzany w blad.

Etap 2 (gdy wolumen to uzasadni): zrodlem `ZAJETE` staje sie arkusz Google
albo Kalendarz Google — wtedy blokada jest natychmiastowa i bez przebudowy.
