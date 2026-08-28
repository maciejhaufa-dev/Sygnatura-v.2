# Kontekst-WORKFLOW — Sygnatura Studio

Żywy dziennik ustaleń. Aktualizowany przy każdej sesji.  
**Nie kopiujemy tu transkryptu rozmowy.** Tylko decyzje, rezygnacje, powody, następny krok.

Data startu tego pliku: **2026-08-27**  
Gałąź sesji: `arena/01a044f6-sygnatura-v-2`

---

## 0. Meta — jak prowadzimy ten plik

- Każda sesja: data, co zrobiono, co zmieniono, z czego zrezygnowano i **dlaczego**.
- Kroki wstecz zapisujemy jawnie (nie kasujemy starej decyzji — dopisujemy „ODWOŁANE”).
- Hasła, tokeny, kody 2FA **nigdy** nie lądują tutaj ani na czacie.

---

## 1. Kontekst projektu (skrót kanoniczny)

**Co to jest:** rodzinny mikro-biznes produkcyjny.  
Ty = maszyny (laser CNC, frezarka, 3D), pliki, jakość, terminy.  
Żona = front (projekt, zdjęcia/wideo, klient, sprzedaż). ~10–15 h/tyg.

**Po co:** podreperować budżet (jeden etat), dać żonie własną markę po latach z dziećmi — nie drugi etat i nie montaż wideo na zlecenie.

**Marka:** **Studio Sygnatura** (w mowie i w polu Od). Krótko: Sygnatura. Neutralna, bez „artystyczna”.  
**„Sygnatura Studio” ODWOŁANE 27.08.2026** — angielski szyk; domena `studiosygnatura.pl` i polska mowa to **Studio Sygnatura**.  
Nazwa opisuje znak wykonania, nie niszę — przeżyje zmianę mixu produktów.

**Model v2 (obowiązujący):**
1. Wynajem weddingowy przez dekoratorki (baza + wymienny insert), nie sprzedaż parze młodej.
2. B2B firmowe: statuetki, upominki, oznakowanie; estetyka plexi/mat/ciemne drewno.
3. Q4: święta B2B z logo firmy. Halloween — odpuszczone (marża vs Pepco).

**Formalnie:** działalność nierejestrowana, sprzedaż **rzeczy** (nie usług), limit 10 813,50 zł/os./kwartał, osobne ewidencje.

**Deadliny:**
- 21.09.2026 — meta checklisty / start sprzedaży (mailing / wyjście)
- 15.10.2026 — zamknięcie listy zamówień grudniowych (NIE data startu mailingu)
- 05.12.2026 — wysyłka zamówień świątecznych

**Budżet startu:** ~680 zł (domena ~140, materiały, opakowania, wizytówki, starter).

---

## 2. Rezygnacje i zwroty (żeby nie wracać)

| Co | Status | Dlaczego |
|---|---|---|
| Żona jako montażystka wideo / YouTube | ZREZYGNOWANE | Rynek nasycony, zwrot 12–18 mies., to znowu praca na godziny |
| Żona jako operator maszyny | ZREZYGNOWANE | Jej przewaga to obraz i klient, nie CNC |
| Sprzedaż parze młodej (tablice 350 zł) | ODWOŁANE (v1→v2) | Pary tną detale; dekoratorka wynajmuje narzędzie pracy |
| Halloween | ZREZYGNOWANE | Chiński plastik, słaba marża |
| Święta detal vs Action/Pepco | ZREZYGNOWANE jako filar | Sens ma personalizacja + B2B z logo |
| Nazwa z „artystyczna” / PA-sygnatura | ZREZYGNOWANE | Sygnał ryzyka dla firm; skrót PA nieczytelny |
| Kupno sygnatura.pl z aftermarket | ZREZYGNOWANE | 1500–8000 zł, za wcześnie |
| Pięć domen na zapas, .com teraz | ZREZYGNOWANE | Dwie .pl wystarczą; .com gdy Etsy |
| Strona WWW przed towarem/zdjęciami | ŚWIADOMIE ODROCZONA | Strona będzie dopracowywana w trakcie; dziś rezerwujemy adresy |
| Cold mailing bez zgody (RODO) | OSTROŻNIE | Checklista 26 dni: wizyta osobista legalniejsza; skrypty mailowe istnieją, używać zgodnie z prawem |
| Szyk „Sygnatura Studio” | ODWOŁANE 27.08 | Nienaturalne vs domena i narracja; zostaje **Studio Sygnatura** |

---

## 3. Sesja 2026-08-27 — start v.2 w Arena

**Zadanie od użytkownika:** odtworzyć kontekst po utracie rozmowy (repo + DOCX ~6500 akapitów).  
**Ustalenie:** transkryptu nie kopiujemy. Żywy plik = ten dokument.

**Zadanie nr 1 (teraz):** wykup domeny + skrzynka mailowa. Stronę dopracowujemy później → hosting musi pozwalać na sprawne dodawanie produktów/projektów bez przebudowy całego stacku.

### Decyzja domenowa (potwierdzona do wykonania)

| Rola | Adres |
|---|---|
| Główna | **studiosygnatura.pl** |
| Ochronna + 301 | **studio-sygnatura.pl** |
| Mail | **kontakt@studiosygnatura.pl** (+ później imiona) |
| Nazwa mówiona / na wizytówce | **Studio Sygnatura** (nie „Sygnatura Studio”) |
| Mail Od | **Studio Sygnatura \<kontakt@studiosygnatura.pl\>** |
| Nie kupować | sygnatura.pl (aftermarket), pa-sygnatura.pl, pięć TLD na zapas |

**Rejestrator:** OVH (`.pl`, uczciwe odnowienie vs nazwa.pl/home.pl).  
**Poczta (aktualne):** Zimbra Starter w OVH — już w zamówieniu 256965127.  
**Zoho: ODWOŁANE 27.08.2026** — byłby drugi zestaw MX i zbędne konto. Wrócimy do Zoho tylko jeśli Zimbra nie obsłuży dwóch osób / telefonu.  
**Strona na start:** GitHub Pages (0 zł) + custom domain, pliki HTML z `pracownia/DEPLOY-github-pages/`. Produkty dodajemy jako kolejne pliki HTML / sekcje — agent edytuje w repo, Ty commitujesz albo wrzucasz zip. **Nie kupujemy hostingu WordPress teraz** (koszt, aktualizacje, wolniejszy start). Jeśli żona będzie chciała sama klikać produkty bez gita — rozważymy później prosty CMS (np. Cloudflare + folder `/produkty`); dziś nie blokuje zakupu domeny.

**DNS docelowy (po zakupie):**
- MX → Zoho (priorytet)
- WWW → GitHub Pages / Cloudflare, gdy strona gotowa do podpięcia
- studio-sygnatura.pl → przekierowanie na studiosygnatura.pl

---

### Sesja 2026-08-27 (ciąg dalszy) — koszyk OVH

Użytkownik na kroku 2/4 „Dodaj opcje”. Konto **osoba fizyczna**. Obie domeny w koszyku:

- `studiosygnatura.pl` 16,69 zł / 1 rok, **odnowienie sie 2027: 58,99 zł/rok**
- `studio-sygnatura.pl` to samo
- DNSSEC ×2 zawarte (zostawić)
- Zimbra Starter ×2 **zawarte w usłudze** (nie płacić za extra Zimbrę)
- Razem **41,06 zł brutto** (33,38 + 7,68 VAT 23%)

**Nie dodawać:** Zimbra Starter płatna, Zimbra Pro, DNS Anycast.  
Auto-renew: **nie ma na tym ekranie** — w panelu po zakupie (lub na podsumowaniu jako „odnawianie automatyczne”).

Konflikt do rozstrzygnięcia po płatności: darmowy Zimbra Starter OVH vs plan Zoho. Nie stawiać obu MX naraz.

Płatność: brak karty kredytowej, PayPal bez środków. **Rekomendacja: PayU → BLIK**, nie przelew tradycyjny (opóźnia delegację NASK). „Inne” sprawdzić tylko jeśli PayU nie pokaże BLIK. Auto-renew kartą i tak ustawimy w panelu później albo przy okazji doładowania.

---

## 4. Procedura zadania 1 — domena + mail (do odhaczania)

Szczegółowe kliknięcia: w rozmowie + poniżej skrót.

- [x] OVH + obie domeny, zamówienie 256965127, 41,06 zł, do 27.08.2027
- [x] Poczta: Zimbra org **Sygnatura Studio**, skrzynka `kontakt@studiosygnatura.pl` (Starter). DNS/MX ustawione przez OVH automatycznie (kreator nie pytał).
- [ ] Test wysyłki/odbioru webmail Zimbra
- [ ] Nie ruszać: E-mail Pro, Exchange, 365, „E-maile” na myślniku
- [ ] Test wysyłki/odbioru
- [ ] Przekierowanie WWW myślnika + GitHub Pages — później

**Koszt orientacyjny:** 2 × ~20 zł rok 1, odnowienie ~70–75 zł/szt./rok u OVH; mail 0 zł. Razem rok 1 ~40–50 zł, rok 2+ ~140–150 zł.

---

### Stopka maila 27.08 (na dobranoc)

- Treść maili: **Georgia**, kolor **`#1A4731`** (butelkowa).
- Logotyp w stopce: **SYG `#4A8B70`** / **NATURA `#1A4731`**. Sygnet zostaje brąz `#6B4530` (nie zielony).
- Gmail blokuje obraz w podpisie — **nie obchodzimy**. Stopka mailowa = HTML bez obrazka (`stopka.html`). PNG tylko poza pocztą.
- Jutro: nicki social.

---

### Sesja 2026-08-28 (telefon)

Zdjęcia referencyjne (serwetnik, krzyżówka, obręcz, misie). Pakiet „do domu” — TAK. Nazwa: **Krzyżówka na ścianę** / kafelki (nie Scrabble). Zdjęcia z telefonu na WWW nie idą.

**28.08 WWW look:** `etap-2/www/` — index, do-domu, krzyzowka, misie, serwetniki, makrama, kontakt. Mobile-first, placeholdery. Deploy Pages z kompa później.

---

### 28.08 zamknięcie sesji (commit+push)

Stan na gałęzi `arena/01a044f6-sygnatura-v-2`: `etap-2/` (www, landing, dziennik), `WIZYTOWKA/` 90×50. DNS/MX/Pages nietknięte. Uploadów z telefonu w korzeniu repo **nie** commitujemy (nie idą na WWW). Wrócimy: laser (szopka → metryczka), szept 1–2.

### 28.08 — laser, regulamin, landing

Kolejność stołu: **szopka 20×20** (CIECIE: L0–L3 + żłóbek; owce/wół nie z obecnych SVG) → **metryczka** 6 pierścieni (spec jest, SVG brak). Prezenty: **1–2** szperaczom, nie seria.

Regulamin: `etap-2/www/regulamin.html` — DN na wstępie, art. 38 pkt 3 (brak odstąpienia przy personalizacji), rękojmia zostaje, checkbox przed Zamów w `shop.js`. Link w stopce.

Landing: `etap-2/landing/index.html` (zieleń + sygnet WEKTORY3). **DNS/Pages/MX nie ruszane.**

Wizytówka 90×50 zaakceptowana (`WIZYTOWKA/`); QR na breloczek, nie na kartę.

### 28.08 wieczór — wizytówki, nie nju

Numer nju 9 zł: **nie drukować tel. na wizytówce**, dopóki karta nie jest w ręku. Wizytówka 85×55: znak WEKTORY3, mail, strona, Poznań. Szkic: `etap-2/wizytowki/index.html`.

---

## 5. Następny krok po zadaniu 1

Checklista 26 dni, Faza 1: starter na kartę, test wypału logo, metryczka, pieczątki, nicki social, sobota 29.08 strona na Pages.

---

## 6. Otwarte pytania (nie blokują domeny)

- Karencja 60 mies. DG — jeden czy dwa limity DN?
- Ile sztuk/dzień na maszynach (limit zamówień 16.10–30.11)?
- Nick IG: sygnatura.studio → sygnaturastudio → …
- Czy grafiki warstw szopki przerysowane (blocker sesji 5.09)?
