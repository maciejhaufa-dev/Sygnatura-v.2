# Jak pokazać stronę żonie — z telefonu

Masz dwie drogi. **Zacznij od pierwszej** — zajmuje minutę i nie wymaga GitHuba.

---

## ⭐ DROGA 1 — jeden plik, wysyłasz jak zdjęcie (1 minuta)

Przygotowałem **`PODGLAD-Studio-Sygnatura.html`** — całą stronę sklejoną w jeden plik.
Wszystkie 9 podstron, menu, kalendarze wynajmu, formularze. Klika się normalnie,
przechodzi między zakładkami, działa **bez internetu**.

**Co robisz:**
1. Pobierz `PODGLAD-Studio-Sygnatura.html` z workspace na telefon.
2. Wyślij żonie — WhatsApp, Messenger, e-mail, dowolnie.
3. Ona otwiera i przegląda w przeglądarce telefonu.

**Zalety:** natychmiast, zero kont, zero konfiguracji, nic nie jest publiczne.
**Wada:** to załącznik, nie link — po każdej poprawce wysyłasz plik na nowo.
Na jeden wieczór z uwagami to bez znaczenia.

> ⚠️ Na Androidzie WhatsApp czasem nie chce wysłać pliku `.html` jako dokumentu.
> Wtedy najprościej: wrzuć na Dysk Google z telefonu i wyślij link do pliku.

---

## DROGA 2 — GitHub Pages z telefonu (10–15 minut)

Jeśli chcesz **prawdziwy link**, który działa zawsze i sam się aktualizuje.

### Najpierw: czego NIE robić
Widziałeś kiedyś opcję „podłączenia repo" — **nie mam takiej możliwości**.
Nie połączę się z Twoim GitHubem i nie potrzebuję tokenu. **Nie wysyłaj mi go** —
to hasło do Twojego konta, a wklejone w czat zostaje w historii rozmowy.

### Krok 1 — pobierz paczkę
Ściągnij **`STRONA-do-wgrania.zip`** (0,9 MB) i **rozpakuj na telefonie**.
Android: aplikacja Pliki → dotknij zipa → Rozpakuj.
iPhone: aplikacja Pliki → dotknij zipa → rozpakuje się sam obok.

Dostajesz katalog `DEPLOY-github-pages` z 12 plikami.

### Krok 2 — załóż repozytorium
Przeglądarka na telefonie, **github.com** (nie aplikacja — aplikacja nie ma wgrywania plików).

- zaloguj się → prawy górny róg → **New repository**
- nazwa: `studio-sygnatura`
- **Public** ← na darmowym koncie Pages działa tylko z publicznych
- ⚠️ **nie** zaznaczaj „Add a README file"
- **Create repository**

### Krok 3 — wgraj pliki
Na pustym repo dotknij **uploading an existing file**
→ **choose your files** → wskaż **wszystkie pliki naraz** z rozpakowanego katalogu.

> ⚠️ **Plik `.nojekyll` prawdopodobnie się nie pokaże** — nazwy z kropką na początku
> są ukryte w menedżerach plików telefonu. Nic nie szkodzi, dodasz go ręcznie:
> po wgraniu reszty → **Add file → Create new file** → w polu nazwy wpisz
> `.nojekyll` → treść zostaw pustą → **Commit changes**.
> Bez tego pliku GitHub czasem gubi część zawartości.

Na dole strony: **Commit changes**.

### Krok 4 — włącz Pages
W repo: **Settings** (może być schowane pod „…" na wąskim ekranie)
→ w menu po lewej **Pages**
→ Source: **Deploy from a branch**
→ Branch: **main**, folder: **/ (root)** → **Save**

### Krok 5 — poczekaj i skopiuj link
Odczekaj 1–3 minuty, odśwież Settings → Pages. U góry pojawi się:

```
https://TWOJA-NAZWA.github.io/studio-sygnatura/
```

To wysyłasz żonie.

---

## Która droga kiedy

| | Droga 1 (plik) | Droga 2 (Pages) |
|---|---|---|
| Czas | 1 minuta | 10–15 minut |
| Wymaga konta | nie | tak |
| Link czy załącznik | załącznik | **link** |
| Aktualizacja | wysyłasz plik na nowo | podmieniasz pliki w repo |
| Publiczne | nie | tak (repo publiczne) |

**Dziś, żeby zebrać uwagi:** droga 1.
**Zanim ruszycie ze sprzedażą:** droga 2, potem domena `studiosygnatura.pl`.

---

## Zanim wyślesz — jedna wiadomość do żony

Uprzedź, co jest tymczasowe, żeby uwagi nie poszły na rzeczy, które i tak wiemy:

> Zerknij na szkic naszej strony. Zdjęć jeszcze nie ma — szare prostokąty to miejsca
> na fotki z sesji, każdy ma opisane, jakie ujęcie tam wejdzie. Formularze się klikają,
> ale nic nie wysyłają. Terminarz w wynajmie pokazuje przykładowe daty.
> Ceny wynajmu są wstępne.
>
> Interesują mnie **teksty i układ**. Konkretnie:
> — czy pierwsze zdanie mówi, co robimy?
> — czy przy pakietach wynajmu wiadomo, co kupujesz, bez czytania dwa razy?
> — czy „Rzemiosło" nie brzmi zbyt przechwalająco?
> — czego brakuje, żebyś Ty sama kliknęła „napisz do nas"?

Ostatnie pytanie jest najważniejsze. **Teraz zmiana słowa to minuta** — po sesji
zdjęciowej każda zmiana pociąga za sobą zdjęcia.
