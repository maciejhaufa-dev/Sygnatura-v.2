# Jak wrzucić stronę na GitHub Pages

Wszystko gotowe leży w katalogu **`DEPLOY-github-pages/`** (9 stron + `404.html` + `.nojekyll` + `README.md`).
Jest też spakowana paczka: **`STRONA-do-wgrania.zip`** (0,9 MB).

---

## Czy mogę wrzucić to za Ciebie?

**Nie.** Nawet mając link do repozytorium, wypchnięcie zmian wymaga uwierzytelnienia —
tokenu albo klucza SSH z prawem zapisu. **Nie podawaj mi go.** Token do GitHuba to
hasło do Twojego konta; nie należy go wklejać w czacie, bo zostaje w historii rozmowy.

Poniżej dwie drogi. Pierwsza zajmuje ok. 5 minut i nie wymaga niczego poza przeglądarką.

---

## DROGA A — przez przeglądarkę (polecana, bez instalowania niczego)

### 1. Pobierz pliki
Ściągnij z workspace **`STRONA-do-wgrania.zip`** i rozpakuj.
Potrzebna jest **zawartość** katalogu `DEPLOY-github-pages`, nie sam katalog.

### 2. Załóż repozytorium
github.com → **New repository**
- nazwa: np. `studio-sygnatura`
- widoczność: **Public** *(Pages na darmowym koncie działa tylko z publicznych)*
- ⚠️ **nie** zaznaczaj „Add a README file" — mamy własny
- **Create repository**

### 3. Wgraj pliki
Na pustym repo: **uploading an existing file** → przeciągnij **wszystkie pliki naraz**
(`index.html`, `wynajem.html`, …, `README.md`, `.nojekyll`).

> ⚠️ Jeśli `.nojekyll` nie chce się przeciągnąć (bywa ukryty jako plik z kropką):
> **Add file → Create new file**, wpisz nazwę `.nojekyll`, zostaw pustą treść, zapisz.

Na dole: **Commit changes**.

### 4. Włącz Pages
**Settings** (zakładka w repo) → **Pages** (menu po lewej)
- Source: **Deploy from a branch**
- Branch: **main**, katalog: **/ (root)**
- **Save**

### 5. Poczekaj 1–3 minuty
Odśwież stronę Settings → Pages. U góry pojawi się adres:

```
https://TWOJA-NAZWA.github.io/studio-sygnatura/
```

To jest link, który wysyłasz żonie. Działa na telefonie.

---

## DROGA B — z linii poleceń (jeśli masz gita na komputerze)

Repozytorium w `DEPLOY-github-pages/` jest **już zainicjowane, z pierwszym commitem
na gałęzi `main`**. Wystarczy podpiąć adres i wypchnąć:

```bash
cd DEPLOY-github-pages
git remote add origin https://github.com/TWOJA-NAZWA/studio-sygnatura.git
git push -u origin main
```

Potem punkt 4 powyżej (włączenie Pages w Settings).

---

## Aktualizacja po zmianach

Gdy poprawimy treść, przebuduję pliki i odświeżę `DEPLOY-github-pages/`. U Ciebie:

- **Droga A:** w repo → **Add file → Upload files** → przeciągnij nowe pliki
  (nadpisują stare) → Commit.
- **Droga B:** `git add -A && git commit -m "aktualizacja" && git push`

Pages przebudowuje się samo w ok. minutę.

---

## Zanim wyślesz link — powiedz żonie, co jest tymczasowe

Żeby nie oceniała rzeczy, które i tak wiemy, że są do zrobienia:

1. **Zdjęć nie ma.** Szare prostokąty z opisami to miejsca na fotografie z sesji 5.09 —
   każdy podpis mówi, jakie ujęcie tam wejdzie. To jest gotowa lista zdjęć do zrobienia.
2. **Formularze nic nie wysyłają.** Klikają się i pokazują potwierdzenie, ale nie ma
   jeszcze podpiętej poczty.
3. **Terminarz pokazuje dane przykładowe.** Zajęte dni są wpisane na sztywno, żeby
   było widać, jak to działa.
4. **Ceny wynajmu i pamiątek są wstępne** — nie konfrontowaliśmy ich jeszcze z rynkiem.
5. **Teksty są do czytania.** To jest właśnie moment, żeby je zakwestionować —
   zmiana słowa kosztuje minutę, zmiana po sesji zdjęciowej kosztuje więcej.

**O co konkretnie zapytać** (lepsze niż „i jak?"):
- Czy pierwsze zdanie na stronie startowej mówi to, co robimy?
- Czy przy pakietach wynajmu wiadomo, co kupujesz, bez czytania dwa razy?
- Czy sekcja „Rzemiosło" nie brzmi zbyt przechwalająco?
- Czego brakuje, żeby ona sama kliknęła „napisz do nas"?

---

## Uwaga o domenie

`studiosygnatura.pl` możesz podpiąć pod Pages później — w **Settings → Pages →
Custom domain**, plus wpis DNS u operatora domeny. Na etapie pokazania żonie
adres `github.io` w zupełności wystarczy; nie ma sensu kupować domeny przed
akceptacją treści.
