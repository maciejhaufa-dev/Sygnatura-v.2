# Stopka i kolor maili — Studio Sygnatura

## Kolory (cyfrowe, nie znak na drewnie)

Znak wypalany zostaje **brąz `#6B4530`**. Mail to osobny rejestr.

| Rola | Hex | Gdzie |
|---|---|---|
| Butelkowa pełna (NATURA + treść) | `#1A4731` | treść maila, NATURA, linki |
| SYG jaśniejszy | `#4A8B70` | tylko trzy litery SYG |
| Brąz znaku | `#6B4530` | sygnet / logo — nie przebarwiać na zieleń |

Różnica SYG vs NATURA: ten sam odcień, NATURA o ~2 stopnie ciemniejszy — zauważalny, nie krzykliwy.

## Czcionka w Zimbrze

Lista Zimbry to bezpieczne czcionki systemowe. Comic Sans odpada.

**Wybierz: Georgia.**

- Szeryfowa, ciepła, „drukarnia / etykieta”, nie korporacyjny Arial.
- Czyta się na telefonie.
- Wyróżnia od 90% maili w Calibri/Arial.

Gdy Georgia niedostępna: **Trebuchet MS** (jedyny sans z listy, który nie jest „urzędowy”).  
Nie: Times (gazeta), Courier (kod), Tahoma/Verdana (Windows 2000).

Ustawienia Zimbra: Preferencje → Edytor / Komponowanie → czcionka **Georgia**, rozmiar **13 lub 14**, kolor `#1A4731`.

## Display name

**Studio Sygnatura** — Imię `Studio`, Nazwisko `Sygnatura`.

## Gmail i obrazki

**Nie da się tego obejść.** Gmail (i Outlook) chowa obrazy od nieznanego nadawcy, aż odbiorca kliknie „Wyświetl obrazy”. To anty-tracking, nie błąd Zimbry.

Dlatego **stopka produkcyjna = HTML bez obrazka** (`stopka.html`). SYG/NATURA i zieleń widać od razu.

Obraz `stopka-mail.png` zostaje do PDF, papieru i strony — nie do pierwszego maila.

W Zimbrze: Podpisy → usuń wstawiony obraz → włącz źródło HTML / wklej z notatnika zawartość `stopka.html`.


1. Zimbra webmail → **Preferencje** (koło zębate) → **Podpisy** / Signatures.
2. Nowy podpis: nazwa `Studio Sygnatura`.
3. Włącz edytor HTML.
4. Wklej zawartość `stopka.html` (tryb źródła HTML jeśli jest).
5. Sygnet: **Wstaw obraz** z pliku `sygnet-stopka.png` (nie link z dysku C: — wklej jako osadzony).
6. Zaznacz: używaj tego podpisu w **nowych** i **odpowiedziach**.
7. Test na prywatny mail — sprawdź, czy obrazek nie jest kłódką „pobierz obrazki”.

Jeśli obraz ginie u odbiorcy: zostaw sam HTML (SYG/NATURA jako tekst) — to i tak niesie znak.
