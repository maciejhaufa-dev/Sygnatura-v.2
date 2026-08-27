# -*- coding: utf-8 -*-
"""Treść wszystkich podstron. Edytuj tutaj, potem uruchom build.py."""

def card(href, title, desc, price, note, ph, badge=None, big=False):
    b = f'<span class="badge">{badge}</span>' if badge else ''
    c = 'card big' if big else 'card'
    return f'''<a class="{c}" href="{href}">
  <div class="ph" data-ph="{ph}">{b}</div>
  <div class="bd"><h3>{title}</h3><p>{desc}</p>
  <div class="price"><b>{price}</b><span>{note}</span></div></div></a>'''

def occ(name, desc):
    return f'<div class="occ"><h4>{name}</h4><p>{desc}</p></div>'

def pkg(pid, name, style, items, old, new, ph, hot=False):
    li = ''.join(f'<li>{a}<span>{b}</span></li>' for a,b in items)
    return f'''<div class="pkg{' hot' if hot else ''}">
  <div class="pkgph" data-ph="{ph}"></div>
  <div class="pkgbd">
    <h3>{name}</h3><span class="style">{style}</span>
    <ul>{li}</ul>
    <div class="pkgprice"><span class="old">osobno {old}</span>
      <b>{new}</b><em>komplet na dobę</em></div>
    <div class="cal" data-pkg="{pid}"></div>
  </div></div>'''

def ritem(name, desc, price, unit):
    return f'''<div class="ritem"><div class="rp"></div><div class="rb">
      <h4>{name}</h4><p>{desc}</p>
      <div class="rprice"><b>{price}</b><span>{unit}</span></div></div></div>'''


def build(head, phead, crumb, FREE, FOOT, HERO, CALJS):
    P = {}

    # ============================== START ==============================
    P['index.html'] = ('Rzeczy robione warstwami', head('Start','index.html') + f'''
<section class="hero">
  <div class="bg" style="background-image:url(data:image/jpeg;base64,{HERO})"></div>
  <div class="veil"></div>
  <div class="inner">
    <span class="eyebrow">Drewno · dłuto · cierpliwość</span>
    <h1>Sny z drewna,<br>robione <em>do ostatniego</em><br>płatka.</h1>
    <p class="lead">Warsztat prowadzony we dwoje. Robimy niewiele rzeczy, za to każdą z uporem — warstwa po warstwie, aż detal zacznie się bronić sam.</p>
    <div class="btns"><a class="btn btn1" href="metryczki.html">Zobacz metryczki</a>
    <a class="btn btnl" href="rzemioslo.html">Nasze rzemiosło</a></div>
  </div>
</section>

<div class="strip">
  <div><b>We dwoje</b><span>cały warsztat, bez podwykonawców</span></div>
  <div><b>Detal</b><span>liczony w dziesiątych milimetra</span></div>
  <div><b>6</b><span>warstw głębi w metryczce</span></div>
  <div><b>Projekt gratis</b><span>płacisz za wykonanie</span></div>
</div>

<section class="sec">
  <span class="tag">Co robimy</span>
  <h2>Mniej rzeczy. Więcej detalu w każdej z nich.</h2>
  <div class="grid gfeat">
    {card('metryczki.html','Metryczka podświetlana','Sześć warstw drewna tworzy tunel, który zwęża się w głąb. Na dnie prawdziwa, wywołana odbitka. Dane dziecka biegną łukiem po kolejnych warstwach, a ciepłe światło wychodzi spomiędzy nich.','349 zł','7–10 dni','METRYCZKA — UJĘCIE GŁÓWNE','Nasz flagowiec',big=True)}
    {card('numery.html','Numer na drzwi','Warstwowy numer mieszkania z wypalanym wzorem i cyfrą uniesioną nad tłem. Do czterech znaków.','od 119 zł','też komplety','NUMER NA DRZWIACH')}
    {card('szyldy.html','Szyldy rzeźbione','Nazwa firmy nad recepcją, nazwisko rodziny w przedpokoju, napis dekoracyjny na ścianę. Rzeźbione, klejone i malowane ręcznie.','od 179 zł','na zamówienie','SZYLD RZEŹBIONY WE WNĘTRZU')}
  </div>
  <div class="grid g2" style="margin-top:24px">
    {card('wynajem.html','Wynajem dekoracji','Ozdoby na ślub, wesele i event firmowy — bierzesz na jeden dzień, oddajesz po imprezie. Nie musisz nic magazynować.','od 15 zł/szt','wynajem na dobę','TABLICE I DEKORACJE WESELNE')}
    {card('dla-firm.html','Dla hoteli i firm','Numeracja pokoi, tabliczki kierunkowe i szyld do recepcji — w jednym spójnym zestawie.','wycena','pakiety','NUMERACJA POKOI HOTELOWYCH')}
  </div>
  <div class="grid g2" style="margin-top:24px">
    {card('wspolpraca.html','Dla organizatorów uroczystości','Wedding plannerki, dekoratorki, agencje. Stałe warunki, pierwszeństwo terminów i pamiątki dla klienta sygnowane Waszą marką.','warunki stałe','współpraca','WSPÓŁPRACA Z ORGANIZATORAMI')}
    {card('wspolpraca.html','Pamiątki z okazji','Panel z cytatem, rzeźbiona ramka na zdjęcie, grawer z dedykacją — na jubileusz, komunię, rocznicę.','od 89 zł','5–10 dni','PAMIĄTKA OKOLICZNOŚCIOWA')}
  </div>
</section>

<section class="sec alt">
  <span class="tag">Jak to działa</span>
  <h2>Zaczynamy od rozmowy, nie od katalogu.</h2>
  <div class="steps">
    <div class="step"><h4>Piszesz do nas</h4><p>Własnymi słowami, bez projektu i wymiarów. Wystarczy, że wiesz, na jaką okazję i dla kogo.</p></div>
    <div class="step"><h4>Dostajesz projekt</h4><p>Przygotowujemy wizualizację za darmo. Poprawiamy do skutku, zanim cokolwiek trafi pod maszynę.</p></div>
    <div class="step"><h4>Robimy</h4><p>Cięcie, składanie warstw, szlif i olejowanie ręką. Zwykle 7–10 dni roboczych.</p></div>
    <div class="step"><h4>Pakujemy i wysyłamy</h4><p>Kraft, wełna drzewna, pieczątka. Rzecz jest gotowa do wręczenia bez przepakowywania.</p></div>
  </div>
</section>

<section class="sec">
  <span class="tag">Dlaczego u nas</span>
  <h2>Bo to nie jest wydruk na sklejce.</h2>
  <div class="two">
    <div>
      <p>Rzeczy, które robimy, mają <strong>głębię</strong> — dosłownie. Warstwa nad warstwą, cień pomiędzy nimi, światło wychodzące spod krawędzi. Tego nie da się podrobić grafiką.</p>
      <p>Każdy egzemplarz powstaje <strong>pod konkretne imię, datę i miejsce</strong>. Nie mamy magazynu z gotowcami, do których dopisuje się nazwisko.</p>
      <p>I nie bierzemy więcej zleceń, niż jesteśmy w stanie dopilnować. Jeśli termin jest napięty — powiemy wprost, zamiast obiecywać.</p>
    </div>
    <div class="panel">
      <h4>Na czym nie oszczędzamy</h4>
      <ul>
        <li><b>Materiał</b>Drewno i sklejka ze sprawdzonego źródła. Każdą partię mierzymy przed cięciem.</li>
        <li><b>Detal</b>Wzór gęsty tam, gdzie ma przyciągać wzrok. Reszta zostaje cicha.</li>
        <li><b>Wykończenie</b>Szlif i olejowanie ręką — tej części nie da się przyspieszyć.</li>
        <li><b>Czas</b>Nie przyjmujemy więcej zleceń, niż jesteśmy w stanie dopilnować.</li>
      </ul>
    </div>
  </div>
</section>
''' + FREE + FOOT)

    # ============================== RZEMIOSŁO ==============================
    P['rzemioslo.html'] = ('Rzemiosło', head('Rzemiosło','rzemioslo.html')
      + crumb(('Rzemiosło', None))
      + phead('Rzemiosło','Warsztat prowadzimy we dwoje.',
              'Ja robię wióry, żona pilnuje, żeby to miało formę. Tyle nas jest — i dlatego wiecie dokładnie, kto odbierze telefon.') + '''
<section class="sec">
  <div class="person">
    <div class="pic" data-ph="ZDJĘCIE — ON PRZY PRACY, DŁONIE I DETAL"></div>
    <div class="txt">
      <span class="role">Projekt i wykonanie</span>
      <h3>Dłubię w drewnie od dziecka</h3>
      <p>I nigdy mi to nie przeszło. Zamiłowanie mam po tacie — był stolarzem i pewnie stamtąd się to wzięło — ale warsztat, który dziś robi te rzeczy, zbudowaliśmy sami.</p>
      <p>Zmieniło się jedno: dzisiaj do drewna mam narzędzia, o jakich kiedyś nie było mowy. Dzięki nim wchodzę w detal, którego ręką po prostu nie da się powtórzyć — sześć warstw składających się w tunel, wzór w setkach płatków, ten sam kształt idealnie taki sam za dziesiątym razem.</p>
      <p>Odpowiadam za to, żeby zgadzało się co do kreski.</p>
    </div>
  </div>
  <div class="person rev">
    <div class="txt">
      <span class="role">Projekt graficzny i kontakt</span>
      <h3>Żona pilnuje, żeby to miało formę</h3>
      <p>Zanim cokolwiek trafi pod maszynę, ktoś musi zdecydować, jak to ma wyglądać — jaki wzór, jaka typografia, ile pustego miejsca wokół.</p>
      <p>To jej działka. Odpowiada też za to, jak rzecz jest opowiedziana i sfotografowana, i za kontakt z Wami. Jeśli piszecie do nas — najpewniej odpisze właśnie ona.</p>
      <p class="quote">Rzecz robi się raz, a dobrze.<small>jedyna zasada, jakiej się trzymamy</small></p>
    </div>
    <div class="pic" data-ph="ZDJĘCIE — ONA PRZY PROJEKCIE / PAKOWANIU"></div>
  </div>
</section>

<section class="sec alt">
  <span class="tag">Warsztat</span>
  <h2>Co dzieje się między rozmową a paczką.</h2>
  <div class="steps">
    <div class="step"><h4>Rysunek</h4><p>Każdy wzór powstaje u nas od zera, pod konkretne wymiary i konkretną treść.</p></div>
    <div class="step"><h4>Materiał</h4><p>Drewno i sklejka ze sprawdzonego źródła. Każdą partię mierzymy przed cięciem.</p></div>
    <div class="step"><h4>Cięcie i składanie</h4><p>Warstwa po warstwie, na sucho, zanim padnie pierwsza kropla kleju.</p></div>
    <div class="step"><h4>Wykończenie</h4><p>Szlif i olejowanie ręką. To jest ta część, której nie da się przyspieszyć.</p></div>
  </div>
</section>
''' + FREE + FOOT)

    # ============================== METRYCZKI ==============================
    P['metryczki.html'] = ('Metryczka', head('Metryczki','metryczki.html')
      + crumb(('Metryczki', None)) + '''
<section class="sec">
  <div class="pgrid">
    <div class="gal">
      <div class="main" data-ph="METRYCZKA — UJĘCIE GŁÓWNE, ŚWIATŁO WŁĄCZONE"></div>
      <div class="thumbs"><div></div><div></div><div></div><div></div></div>
    </div>
    <div class="pinfo">
      <span class="tag">Nasz flagowiec</span>
      <h1>Metryczka podświetlana</h1>
      <div class="from">349 zł</div>
      <div class="note">Realizacja 7–10 dni roboczych</div>
      <p class="desc">Sześć warstw drewna tworzy tunel, który zwęża się w głąb. Na samym dnie umieszczamy <strong>prawdziwą, wywołaną odbitkę</strong> — nie wydruk. Dane dziecka biegną łukiem po kolejnych pierścieniach, a ciepłe światło wychodzi spomiędzy warstw i rysuje cienie tam, gdzie wzór jest najgęstszy.</p>
      <div class="opts">
        <span class="opt sel">Motyw: chmurki</span><span class="opt">drzewko</span><span class="opt">łąka</span>
      </div>
      <table class="specs">
        <tr><td>Wymiary</td><td>250 × 250 mm, głębokość 50 mm</td></tr>
        <tr><td>Materiał</td><td>sklejka brzozowa, rama z litej sosny</td></tr>
        <tr><td>Zdjęcie</td><td>otwór na odbitkę, wymiana bez rozbierania</td></tr>
        <tr><td>Podświetlenie</td><td>ciepłe 2700 K, zasilanie 3 × AA</td></tr>
        <tr><td>Personalizacja</td><td>imię, data, godzina, waga w gramach, wzrost</td></tr>
        <tr><td>Wykończenie</td><td>szlif i olejowanie ręką</td></tr>
      </table>
      <div class="btns"><a class="btn btn1" href="kontakt.html">Zamów metryczkę</a>
      <a class="btn btn2" href="kontakt.html">Zapytaj o wariant</a></div>
    </div>
  </div>

  <div class="bundle">
    <div>
      <h4>Kup w zestawie: metryczka + numer na drzwi pokoju</h4>
      <p>Najczęściej zamawiany duet na roczek. Ten sam wzór i ta sama typografia na metryczce i na tabliczce z imieniem na drzwiach pokoju dziecka — komplet, który wygląda jak jedna rzecz.</p>
    </div>
    <div class="sum">
      <span class="old">468 zł</span>
      <span class="new">429 zł</span>
      <a class="btn btn1" href="kontakt.html">Zamów zestaw</a>
    </div>
  </div>
</section>

<section class="sec alt">
  <span class="tag">Warianty</span>
  <h2>Ta sama konstrukcja, inny zakres pracy.</h2>
  <div class="grid g3">
    ''' + card('kontakt.html','Metryczka pełna','Sześć warstw, tunel z pierścieni, teksty po łuku, podświetlenie i otwór na odbitkę. Wersja, którą widzicie wyżej.','349 zł','7–10 dni','WARIANT PEŁNY') + '''
    ''' + card('kontakt.html','Metryczka bez podświetlenia','Ta sama głębia i ten sam detal, bez modułu LED. Dobrze wygląda przy oknie i w jasnym pokoju.','249 zł','5–7 dni','WARIANT BEZ LED') + '''
    ''' + card('kontakt.html','Metryczka bez zdjęcia','Zamiast odbitki — pełny wzór na dnie tunelu. Wybór dla tych, którzy nie chcą zdjęcia na ścianie.','229 zł','5–7 dni','WARIANT BEZ ZDJĘCIA') + '''
  </div>
</section>

<section class="sec">
  <span class="tag">Inni zamawiali również</span>
  <h2>Do metryczki najczęściej dobierają:</h2>
  <div class="grid g3">
    ''' + card('numery.html','Tabliczka z imieniem','Ten sam wzór co na metryczce, na drzwi pokoju dziecka. Do czterech znaków lub imię.','od 119 zł','5 dni','TABLICZKA Z IMIENIEM') + '''
    ''' + card('kontakt.html','Druga odbitka','Dodatkowe zdjęcie przycięte pod otwór, na zmianę po kilku miesiącach.','+15 zł','przy zamówieniu','ZAPASOWA ODBITKA') + '''
    ''' + card('kontakt.html','Metryczka bliźniacza','Dwa tunele w jednej ramie, dla bliźniąt. Osobne dane, wspólny wzór.','+120 zł','10–14 dni','WERSJA DLA BLIŹNIĄT') + '''
  </div>
</section>

<section class="sec alt">
  <span class="tag">Pytania</span>
  <h2>Zanim zamówisz</h2>
  <div class="faq">
    <details open><summary>Czy zdjęcie muszę dostarczyć sam?</summary>
      <p>Tak — potrzebujemy wywołanej odbitki albo pliku, który wywołamy za Was. Otwór jest tak zaprojektowany, żeby zdjęcie dało się wymienić później, bez rozbierania całości.</p></details>
    <details><summary>Ile świeci na jednym komplecie baterii?</summary>
      <p>Przy włączaniu na wieczór — kilka miesięcy. Zasilanie to trzy paluszki AA, bez kabla i bez zasilacza w gniazdku, więc metryczkę można powiesić gdziekolwiek.</p></details>
    <details><summary>Czy mogę zmienić motyw i układ tekstu?</summary>
      <p>Tak, i to bez dopłaty. Przygotujemy projekt pod Wasze dane i motyw, a Wy akceptujecie go zanim cokolwiek zostanie wycięte.</p></details>
    <details><summary>Jak to jest zapakowane?</summary>
      <p>Kraft, wełna drzewna, pieczątka. Metryczka jest gotowa do wręczenia bez przepakowywania.</p></details>
  </div>
</section>
''' + FREE + FOOT)

    # ============================== NUMERY ==============================
    P['numery.html'] = ('Numery na drzwi', head('Numery','numery.html')
      + crumb(('Numery na drzwi', None)) + '''
<section class="sec">
  <div class="pgrid">
    <div class="gal">
      <div class="main" data-ph="NUMER NA DRZWIACH — UJĘCIE GŁÓWNE"></div>
      <div class="thumbs"><div></div><div></div><div></div><div></div></div>
    </div>
    <div class="pinfo">
      <span class="tag">Do wnętrza</span>
      <h1>Numer na drzwi</h1>
      <div class="from">od 119 zł</div>
      <div class="note">Realizacja 5–7 dni roboczych</div>
      <p class="desc">Numer mieszkania złożony z warstw: gęsty wzór wypalony w jasnym drewnie, a nad nim <strong>cyfra uniesiona na dystansie</strong>, rzucająca własny cień. Całość zamknięta w ramce. Mała rzecz, którą widzi każdy, kto stanie pod Waszymi drzwiami.</p>
      <div class="opts">
        <span class="opt sel">Ramka: kwadrat</span><span class="opt">koło</span><span class="opt">owal</span>
      </div>
      <div class="opts">
        <span class="opt sel">Tło: łąka</span><span class="opt">liście</span><span class="opt">geometryczne</span><span class="opt">gładkie</span>
      </div>
      <table class="specs">
        <tr><td>Wymiary</td><td>150 × 150 mm (koło — średnica 160 mm)</td></tr>
        <tr><td>Treść</td><td>do 4 znaków — cyfry, litera, imię</td></tr>
        <tr><td>Materiał</td><td>sklejka, wzór wypalany, cyfra bejcowana</td></tr>
        <tr><td>Montaż</td><td>taśma montażowa lub dwa wkręty</td></tr>
        <tr><td>Zastosowanie</td><td>wnętrza — klatka schodowa, korytarz, pokój</td></tr>
      </table>
      <div class="btns"><a class="btn btn1" href="kontakt.html">Zamów numer</a>
      <a class="btn btn2" href="dla-firm.html">Zamawiam komplet</a></div>
    </div>
  </div>

  <div class="bundle">
    <div>
      <h4>Komplet dla całego piętra lub pensjonatu</h4>
      <p>Numery w jednym wzorze, cięte z jednej partii materiału, w jednym odcieniu. Przy zamówieniu od 6 sztuk cena spada, a projekt i tak przygotowujemy raz. Najczęściej zamawiają to pensjonaty, apartamenty na wynajem i wspólnoty w kamienicach.</p>
    </div>
    <div class="sum">
      <span class="old">119 zł / szt.</span>
      <span class="new">od 89 zł / szt.</span>
      <a class="btn btn1" href="dla-firm.html">Zapytaj o komplet</a>
    </div>
  </div>
</section>

<section class="sec alt">
  <span class="tag">Warianty</span>
  <h2>Trzy formaty, ta sama konstrukcja.</h2>
  <div class="grid g3">
    ''' + card('kontakt.html','Sam numer','Jeden lub dwa znaki na wzorzystym tle, w ramce. Wersja podstawowa.','119 zł','5 dni','SAM NUMER') + '''
    ''' + card('kontakt.html','Numer z imieniem','Cyfra plus nazwisko lub imię pod spodem, w jednej ramce.','149 zł','5–7 dni','NUMER Z NAZWISKIEM') + '''
    ''' + card('kontakt.html','Tabliczka na pokój','Bez numeru — samo imię dziecka albo nazwa pokoju. Ten sam wzór co w metryczce.','129 zł','5 dni','TABLICZKA NA POKÓJ') + '''
  </div>
</section>

<section class="sec">
  <span class="tag">Inni zamawiali również</span>
  <h2>Do numeru najczęściej dobierają:</h2>
  <div class="grid g3">
    ''' + card('szyldy.html','Szyld rzeźbiony','Nazwisko rodziny albo napis dekoracyjny na ścianę — rzeźbiony w litym drewnie.','od 179 zł','na zamówienie','SZYLD RZEŹBIONY') + '''
    ''' + card('metryczki.html','Metryczka','Warstwowa, podświetlana, z prawdziwą odbitką na dnie tunelu.','349 zł','7–10 dni','METRYCZKA') + '''
    ''' + card('dla-firm.html','Numeracja pokoi','Komplet dla hotelu lub pensjonatu, razem z tabliczkami kierunkowymi.','wycena','pakiet','NUMERACJA HOTELOWA') + '''
  </div>
</section>

<section class="sec alt">
  <span class="tag">Pytania</span>
  <h2>Zanim zamówisz</h2>
  <div class="faq">
    <details open><summary>Czy mogę powiesić go na zewnątrz?</summary>
      <p>Nie polecamy. Ten numer jest ze sklejki i jest zaprojektowany do wnętrz — na klatkę schodową, korytarz, drzwi mieszkania. Na elewację robimy <a href="szyldy.html">rzeźbione szyldy z litego drewna</a> w wersji zabezpieczonej na zewnątrz.</p></details>
    <details><summary>Czy wzór mogę wybrać własny?</summary>
      <p>Możecie wybrać z naszych wzorów albo opisać, o czym myślicie — przygotujemy projekt za darmo. Nie przyjmujemy gotowych grafik z internetu ze względu na prawa autorskie.</p></details>
    <details><summary>Jak się to montuje?</summary>
      <p>Domyślnie na mocnej taśmie montażowej — bez wiercenia, więc nadaje się na wynajmowane mieszkanie. Na życzenie dokładamy otwory pod dwa wkręty.</p></details>
  </div>
</section>
''' + FREE + FOOT)

    # ============================== SZYLDY ==============================
    P['szyldy.html'] = ('Szyldy i emblematy', head('Szyldy','szyldy.html')
      + crumb(('Szyldy rzeźbione', None))
      + phead('Rzeźbione w drewnie','Szyldy, napisy i litery przestrzenne.',
              'Nazwa firmy nad recepcją, nazwisko rodziny przy wejściu, napis dekoracyjny na ścianę salonu. Rzeźbione, klejone i malowane ręcznie — inna kategoria niż numery na drzwi: większy format, grubszy materiał, inna technika.') + '''
<section class="sec">
  <div class="pgrid">
    <div class="gal">
      <div class="main" data-ph="SZYLD RZEŹBIONY — UJĘCIE GŁÓWNE"></div>
      <div class="thumbs"><div></div><div></div><div></div><div></div></div>
    </div>
    <div class="pinfo">
      <span class="tag">Do wnętrza</span>
      <h1>Szyld rzeźbiony</h1>
      <div class="from">od 229 zł</div>
      <div class="note">Realizacja 10–14 dni roboczych</div>
      <p class="desc">Napis rzeźbiony w litym drewnie — nazwa firmy, nazwisko rodziny albo słowo, które ma zawisnąć na ścianie. Litery wychodzą z płaszczyzny, dostają <strong>fazowaną krawędź i ręczne malowanie</strong>, a tło zostaje surowe albo bejcowane. Robimy to jako rzecz do oglądania z bliska, więc wykończenie krawędzi ma tu takie samo znaczenie jak sam kształt liter.</p>
      <div class="opts">
        <span class="opt sel">Wykończenie: olej naturalny</span><span class="opt">bejca</span><span class="opt">litery malowane</span>
      </div>
      <table class="specs">
        <tr><td>Wymiary</td><td>300 × 150 mm do 900 × 300 mm</td></tr>
        <tr><td>Materiał</td><td>lite drewno / klejonka, grubość 18–20 mm</td></tr>
        <tr><td>Gatunki</td><td>dąb, jesion, buk, lipa</td></tr>
        <tr><td>Technika</td><td>rzeźbienie, klejenie warstw, malowanie ręczne</td></tr>
        <tr><td>Wykończenie</td><td>olej lub lakier matowy, szlif ręką</td></tr>
        <tr><td>Montaż</td><td>na płasko lub na dystansach 15 mm</td></tr>
      </table>
      <div class="btns"><a class="btn btn1" href="kontakt.html">Zapytaj o wycenę</a>
      <a class="btn btn2" href="dla-firm.html">Szyld dla firmy</a></div>
    </div>
  </div>
</section>

<section class="sec alt">
  <span class="tag">Rodzaje</span>
  <h2>Cztery zastosowania, jedna technika.</h2>
  <div class="grid g2">
    ''' + card('dla-firm.html','Szyld firmowy nad recepcję','Nazwa firmy i logo w drewnie, na ścianę za ladą albo nad wejściem do lokalu. Format i głębokość liter dobieramy pod odległość, z jakiej ma być czytany.','od 349 zł','10–14 dni','SZYLD NAD RECEPCJĄ','Najczęściej zamawiane') + '''
    ''' + card('kontakt.html','Nazwisko rodziny','Na ścianę w przedpokoju albo na drzwi wewnętrzne. Nazwisko, rok albo krótkie motto — rzecz oglądana codziennie z bliska.','od 229 zł','10–14 dni','NAZWISKO RODZINY') + '''
  </div>
  <div class="grid g2" style="margin-top:24px">
    ''' + card('kontakt.html','Napis dekoracyjny','Słowo lub zdanie na ścianę salonu, sypialni albo pokoju dziecka. Litery przestrzenne, montowane na dystansach, rzucające cień.','od 199 zł','7–10 dni','NAPIS DEKORACYJNY') + '''
    ''' + card('kontakt.html','Napis powitalny','Do przedpokoju, tuż za drzwiami wejściowymi. Ta sama technika, mniejszy format.','od 179 zł','7 dni','NAPIS POWITALNY') + '''
  </div>
</section>

<section class="sec">
  <span class="tag">Na zewnątrz</span>
  <h2>Ten sam szyld, dodatkowe zabezpieczenie.</h2>
  <div class="two">
    <div>
      <p>Wykonanie jest identyczne — rzeźbienie, klejenie, malowanie. Różnica leży w <strong>doborze gatunku i w wykończeniu</strong>: na elewację bierzemy drewno odporniejsze na wilgoć i pokrywamy je lakierem zewnętrznym albo olejem tarasowym, także od tyłu i po krawędziach.</p>
      <p>Mówimy jednak wprost: <strong>drewno na zewnątrz żyje.</strong> Ciemnieje, pracuje, po kilku sezonach wymaga odnowienia. Przy szyldzie pod zadaszeniem — nad drzwiami, na tarasie, w wiacie — trzyma się latami. Na pełnym słońcu i deszczu bez osłony trzeba liczyć się z odświeżaniem co dwa lata.</p>
      <p>Dopłata za wersję zewnętrzną to zwykle 15–20 % ceny, w zależności od gatunku. Olej i instrukcję pielęgnacji dokładamy do przesyłki.</p>
    </div>
    <div class="panel">
      <h4>Wersja zewnętrzna — co się zmienia</h4>
      <ul>
        <li><b>Gatunek</b>Dąb, modrzew lub robinia zamiast lipy i buka.</li>
        <li><b>Impregnacja</b>Lakier zewnętrzny lub olej tarasowy, nakładany na wszystkie strony.</li>
        <li><b>Krawędzie</b>Zaokrąglone, żeby woda spływała, a nie zbierała się w narożniku.</li>
        <li><b>Montaż</b>Na dystansach, z prześwitem — drewno musi obsychać od tyłu.</li>
        <li><b>Pielęgnacja</b>Odświeżenie olejem co ok. 2 lata. Olej w komplecie.</li>
      </ul>
    </div>
  </div>
</section>

<section class="sec">
  <span class="tag">Inni zamawiali również</span>
  <h2>Do szyldu najczęściej dobierają:</h2>
  <div class="grid g3">
    ''' + card('numery.html','Numer na drzwi','Warstwowy numer mieszkania — inna technika, ta sama stylistyka.','od 119 zł','5 dni','NUMER WNĘTRZOWY') + '''
    ''' + card('dla-firm.html','Szyld + numeracja','Szyld do recepcji i komplet numerów pokoi w jednej stylistyce.','wycena','pakiet','ZESTAW DLA HOTELU') + '''
    ''' + card('kontakt.html','Tabliczka kierunkowa','Strzałki i opisy pomieszczeń, dopasowane do szyldu głównego.','od 79 zł','7 dni','TABLICZKA KIERUNKOWA') + '''
  </div>
</section>

<section class="sec alt">
  <span class="tag">Pytania</span>
  <h2>Zanim zamówisz</h2>
  <div class="faq">
    <details open><summary>Czy zmieścicie logo firmy?</summary>
      <p>Tak. Potrzebujemy pliku wektorowego albo czytelnego znaku do odrysowania. Projekt szyldu z Waszym logo przygotujemy bez opłat — zobaczycie wizualizację, zanim cokolwiek zamówicie.</p></details>
    <details><summary>Czy szyld wewnętrzny nadaje się na zewnątrz?</summary>
      <p>W tej samej formie tak, ale z innym wykończeniem — inny gatunek drewna i lakier zewnętrzny na wszystkie strony. Dopłata to zwykle 15–20 %. Powiedzcie od razu, gdzie ma wisieć, a dobierzemy materiał.</p></details>
    <details><summary>Jak długo wytrzyma na elewacji?</summary>
      <p>Pod zadaszeniem — nad drzwiami, na tarasie, w wiacie — latami. Na otwartym słońcu i deszczu drewno wymaga odświeżenia olejem mniej więcej co dwa lata. Nie ukrywamy tego: to materiał żywy i tak się zachowuje.</p></details>
    <details><summary>Jakie są ograniczenia wielkości?</summary>
      <p>Pojedynczy element robimy do ok. 900 × 300 mm. Większe napisy składamy z segmentów albo z osobnych liter montowanych na ścianie — wtedy wielkość ogranicza tylko ściana.</p></details>
    <details><summary>Litery malowane czy w naturalnym drewnie?</summary>
      <p>Obie wersje robimy. Malowane czytają się lepiej z odległości i sprawdzają w szyldach firmowych; naturalne z fazowaną krawędzią wyglądają szlachetniej z bliska i lepiej pasują do wnętrz mieszkalnych.</p></details>
  </div>
</section>
''' + FREE + FOOT)

    # ============================== WYNAJEM ==============================
    P['wynajem.html'] = ('Wynajem dekoracji', head('Wynajem','wynajem.html')
      + crumb(('Wynajem dekoracji', None))
      + phead('Wynajem','Dekoracje na jeden dzień. Bez kupowania i bez magazynowania.',
              'Wesele, komunia, chrzciny, jubileusz, urodziny, event firmowy — tablice powitalne, plany stołów, numery stolików i drobne ozdoby. Bierzecie na czas imprezy i oddajecie po niej. Personalizację, którą trzeba zachować, robimy na wymiennych wkładkach.') + '''
<section class="sec tight">
  <span class="tag">Dlaczego wynajem</span>
  <h2>Dekoracja jest potrzebna przez jeden dzień. Stoi potem latami w piwnicy.</h2>
  <p class="sub">Kupujecie tablicę powitalną i plan stołów za kilkaset złotych, używacie ich przez osiem godzin, a potem szukacie miejsca w szafie. Wynajem rozwiązuje to w całości: dostajecie komplet w jednej stylistyce, oddajecie po uroczystości, a jedyne, co zostaje na pamiątkę, to wymienna tabliczka z Waszymi imionami i datą.</p>
  <div class="occs">
    ''' + occ('Wesele','Tablica powitalna, plan stołów, numery stolików, znaki kierunkowe.') + '''
    ''' + occ('Komunia i chrzciny','Tablica z imieniem dziecka, oznaczenia stołów, dekoracja wejścia.') + '''
    ''' + occ('Jubileusz','Rocznica ślubu, okrągłe urodziny, złote gody — z datą i liczbą lat.') + '''
    ''' + occ('Urodziny i imprezy rodzinne','Mniejszy komplet, ta sama stylistyka. Także dla dzieci.') + '''
    ''' + occ('Event firmowy','Konferencja, integracja, jubileusz firmy. Wkładki z Waszym logo.') + '''
    ''' + occ('Coś innego','Nie widzicie swojej okazji? Napiszcie — zwykle da się złożyć komplet.') + '''
  </div>
  <div class="rules">
    <div><h4>Rezerwacja</h4><p>Rezerwujecie termin z wyprzedzeniem. Zadatek 30 % blokuje datę, resztę płacicie przy odbiorze.</p></div>
    <div><h4>Odbiór</h4><p>Dzień przed imprezą, osobiście w Poznaniu lub dowozimy na miejsce w okolicy.</p></div>
    <div><h4>Zwrot</h4><p>W ciągu trzech dni po uroczystości. Bez czyszczenia i bez pakowania na nowo — dostajecie skrzynki transportowe.</p></div>
    <div><h4>Kaucja</h4><p>Zwrotna, ustalana od wartości kompletu. Wraca w całości, jeśli dekoracje są bez uszkodzeń.</p></div>
    <div><h4>Personalizacja</h4><p>Imiona i datę robimy na wymiennych wkładkach. Wkładka zostaje u Was na pamiątkę.</p></div>
    <div><h4>Cennik</h4><p>Stawka za dobę, komplet taniej niż pojedyncze sztuki. Wszystko widoczne z góry, bez dopłat na miejscu.</p></div>
  </div>
</section>

<section class="sec alt" id="pakiety">
  <span class="tag">Pakiety</span>
  <h2>Zacznij od terminu. Potem wybierz styl.</h2>
  <p class="sub">Każdy pakiet to komplet w jednej stylistyce — taniej niż te same rzeczy pojedynczo. Pod każdym jest terminarz: ciemne dni są już zajęte, jasne wolne. Kliknij datę, a przeniesiemy ją do zgłoszenia.</p>
  <div class="pkgs">
    ''' + pkg('klasyczny','Pakiet Klasyczny','Jasne drewno · serif · minimalizm',
        [('Tablica powitalna','1 szt.'),('Plan stołów','1 szt.'),
         ('Numery stolików','10 szt.'),('Znaki kierunkowe','4 szt.'),
         ('Wkładka personalizowana','w cenie')],
        '215 zł','169 zł','PAKIET KLASYCZNY — ARANŻACJA',hot=True) + '''
    ''' + pkg('lesny','Pakiet Leśny','Ciemne drewno · liście · mech',
        [('Tablica powitalna','1 szt.'),('Plan stołów','1 szt.'),
         ('Numery stolików','10 szt.'),('Tabliczki na krzesła','2 szt.'),
         ('Litery przestrzenne','para'),('Wkładka personalizowana','w cenie')],
        '270 zł','209 zł','PAKIET LEŚNY — ARANŻACJA') + '''
    ''' + pkg('rustykalny','Pakiet Rustykalny','Surowe deski · sznurek · len',
        [('Tablica powitalna','1 szt.'),('Plan stołów','1 szt.'),
         ('Numery stolików','10 szt.'),('Skrzynka na koperty','1 szt.'),
         ('Ramka na zdjęcia','1 szt.'),('Wkładka personalizowana','w cenie')],
        '285 zł','219 zł','PAKIET RUSTYKALNY — ARANŻACJA') + '''
  </div>
  <div class="pkgs" style="margin-top:24px">
    ''' + pkg('komunijny','Pakiet Komunijny','Biel · jasny dąb · drobny wzór',
        [('Tablica z imieniem','1 szt.'),('Oznaczenia stołów','6 szt.'),
         ('Dekoracja wejścia','1 kpl.'),('Wkładka personalizowana','w cenie')],
        '150 zł','119 zł','PAKIET KOMUNIJNY — ARANŻACJA') + '''
    ''' + pkg('firmowy','Pakiet Firmowy','Ciemne drewno · Wasze logo',
        [('Tablica powitalna z logo','1 szt.'),('Oznaczenia sal','4 szt.'),
         ('Numeracja stanowisk','12 szt.'),('Znaki kierunkowe','6 szt.'),
         ('Wkładki z logo','w cenie')],
        '320 zł','249 zł','PAKIET FIRMOWY — ARANŻACJA') + '''
    ''' + pkg('wlasny','Zestaw własny','Składasz sam, z pojedynczych sztuk',
        [('Wybierasz pozycje z listy niżej','—'),('Cena','suma pozycji'),
         ('Rabat','od 5 pozycji −10%'),('Wkładka personalizowana','w cenie')],
        '—','od 15 zł','ZESTAW SKŁADANY SAMODZIELNIE') + '''
  </div>
</section>

<section class="sec" id="rezerwacja">
  <span class="tag">Rezerwacja</span>
  <h2>Zgłoś termin, a zablokujemy go dla Ciebie.</h2>
  <p class="sub" id="rez-info">Wybierz datę w terminarzu przy wybranym pakiecie — pojawi się tutaj. Zgłoszenie potwierdzamy w ciągu jednego dnia roboczego; dopiero wtedy termin znika z kalendarza.</p>
  <form class="form" id="rez-form">
    <div><label for="rez-data">Termin</label><input id="rez-data" type="text" placeholder="wybierz w terminarzu wyżej" readonly></div>
    <div><label for="rez-pakiet">Pakiet</label><input id="rez-pakiet" type="text" placeholder="wybierz w terminarzu wyżej" readonly></div>
    <div><label for="rez-imie">Imię i nazwisko</label><input id="rez-imie" type="text" placeholder="Jak się do Ciebie zwracać"></div>
    <div><label for="rez-mail">E-mail</label><input id="rez-mail" type="email" placeholder="adres@poczta.pl"></div>
    <div><label for="rez-tel">Telefon</label><input id="rez-tel" type="tel" placeholder="opcjonalnie"></div>
    <div><label for="rez-typ">Okazja</label>
      <select id="rez-typ"><option>Wesele</option><option>Komunia lub chrzciny</option>
      <option>Jubileusz</option><option>Urodziny</option><option>Event firmowy</option>
      <option>Inna</option></select></div>
    <div class="full"><label for="rez-uw">Imiona i data na wkładkę, uwagi</label>
      <textarea id="rez-uw" placeholder="Co ma być wygrawerowane, gdzie się odbywa impreza, czy potrzebny dowóz."></textarea></div>
    <div class="full"><button class="btn btn1" type="submit">Zgłoś rezerwację terminu</button></div>
  </form>
  <div id="rez-ok" style="display:none;border:1px solid var(--accent);background:var(--accent-soft);padding:22px 26px;margin-top:22px;max-width:760px">
    <b style="font-family:var(--serif);font-size:19px;color:var(--brown)">Zgłoszenie przyjęte — termin wstępnie zablokowany.</b>
    <p style="font-size:14.5px;line-height:1.75;color:#4E463F;margin-top:8px">Odpowiemy w ciągu jednego dnia roboczego z potwierdzeniem i danymi do zadatku. Termin trzymamy dla Ciebie przez 48 godzin.</p>
  </div>
  <p class="legal">To wersja demonstracyjna formularza — na razie nic nie zostaje wysłane. Po podpięciu obsługi poczty zgłoszenie trafi na kontakt@studiosygnatura.pl.</p>
</section>

<section class="sec alt">
  <span class="tag">Pojedyncze sztuki</span>
  <h2>Albo złóż zestaw po swojemu.</h2>
  <p class="sub">Jeśli żaden pakiet nie pasuje, wybierz pozycje osobno. Od pięciu pozycji naliczamy 10 % rabatu, a dostępność sprawdzamy przy zgłoszeniu.</p>
  <div class="rent">
    ''' + ritem('Tablica powitalna','Duża, stojąca, z wymienną wkładką na imiona i datę.','60 zł','doba') + '''
    ''' + ritem('Plan stołów','Rozpiska gości na drewnianej płycie, litery wycinane.','80 zł','doba') + '''
    ''' + ritem('Numery stolików','Komplet 10 sztuk, stojące, w jednym wzorze.','45 zł','komplet') + '''
    ''' + ritem('Tabliczki na krzesła','„Państwo młodzi", „Rodzice" — para lub komplet.','25 zł','komplet') + '''
    ''' + ritem('Ramka na zdjęcia','Stojak z klipsami na fotografie gości.','35 zł','doba') + '''
    ''' + ritem('Skrzynka na koperty','Zamykana, z grawerowanym wieczkiem.','50 zł','doba') + '''
    ''' + ritem('Litery przestrzenne','Inicjały pary, wysokość 40 cm, do postawienia.','55 zł','para') + '''
    ''' + ritem('Znaki kierunkowe','Strzałki: sala, szatnia, parking, palarnia.','30 zł','komplet') + '''
  </div>
  <div class="btns"><a class="btn btn2" href="#rezerwacja">Zgłoś zestaw własny</a></div>
</section>

<section class="sec">
  <span class="tag">Do zapamiętania</span>
  <h2>Dekoracja wraca do nas. Pamiątka zostaje u Was.</h2>
  <p class="sub">Przy każdym wynajmie można domówić rzecz, która nie wraca — grawer z datą, warstwowy panel z cytatem albo rzeźbioną ramkę na zdjęcie z uroczystości. Najczęściej zamawiają to jubilaci i organizatorzy, którzy chcą zostawić gościom albo solenizantowi coś trwałego.</p>
  <div class="grid g3">
    ''' + card('wspolpraca.html','Panel z cytatem','Warstwowy panel z sentencją, imionami i datą. Do powieszenia na ścianie.','od 149 zł','7 dni','PANEL Z CYTATEM') + '''
    ''' + card('wspolpraca.html','Ramka rzeźbiona','Na zdjęcie z uroczystości. Rzeźbiona ramka z datą i okazją na dole.','od 169 zł','7–10 dni','RAMKA RZEŹBIONA') + '''
    ''' + card('wspolpraca.html','Grawer okolicznościowy','Tabliczka z dedykacją — na jubileusz, rocznicę albo pożegnanie pracownika.','od 89 zł','5 dni','GRAWER Z DEDYKACJĄ') + '''
  </div>
  <div class="bundle">
    <div>
      <h4>Organizujesz uroczystości zawodowo?</h4>
      <p>Dla wedding plannerek, dekoratorek i agencji eventowych mamy osobne warunki: stałe rabaty, pierwszeństwo terminów i pamiątki dla klienta z Waszą marką. Szczegóły na osobnej stronie.</p>
    </div>
    <div class="sum">
      <a class="btn btn1" href="wspolpraca.html">Zobacz warunki współpracy</a>
    </div>
  </div>
</section>

<section class="sec alt">
  <span class="tag">Pytania</span>
  <h2>Zanim zarezerwujesz</h2>
  <div class="faq">
    <details open><summary>Co, jeśli coś się uszkodzi na imprezie?</summary>
      <p>Drobne ślady użytkowania są wliczone w wynajem i nie wpływają na kaucję. Przy poważniejszym uszkodzeniu potrącamy koszt naprawy — zawsze pokazujemy wycenę, zanim cokolwiek rozliczymy.</p></details>
    <details><summary>Czy dekoracje będą miały nasze imiona?</summary>
      <p>Tak. Personalizowane elementy robimy na wymiennych wkładkach, które zostają u Was po imprezie. Konstrukcja wraca do nas, pamiątka zostaje z Wami.</p></details>
    <details><summary>Z jakim wyprzedzeniem rezerwować?</summary>
      <p>W sezonie ślubnym najlepiej dwa–trzy miesiące wcześniej. Poza sezonem zwykle wystarczy kilka tygodni.</p></details>
    <details><summary>Można kupić zamiast wynająć?</summary>
      <p>Można. Przy większości pozycji cena zakupu to kilkukrotność stawki za dobę — napiszcie, a podamy konkretną kwotę.</p></details>
  </div>
</section>
''' + FREE + '<script>' + CALJS + '</script>' + FOOT)

    # ============================== DLA FIRM ==============================
    P['dla-firm.html'] = ('Dla firm', head('Dla firm','dla-firm.html')
      + crumb(('Dla firm', None))
      + phead('Dla firm','Hotele, pensjonaty i lokale — cała numeracja w jednej stylistyce.',
              'Numery pokoi, tabliczki kierunkowe i szyld do recepcji zaprojektowane jako jeden zestaw, cięte z jednej partii materiału. Projekt przygotowujemy bez opłat, jeszcze przed decyzją.') + '''
<section class="sec">
  <span class="tag">Pakiet hotelowy</span>
  <h2>Goście oceniają wnętrze zanim wejdą do pokoju.</h2>
  <div class="two">
    <div>
      <p>Numeracja pokoi to jeden z pierwszych detali, jaki widzi gość — i jeden z ostatnich, o jakich się myśli przy urządzaniu. Plastikowa tabliczka z hurtowni potrafi zniweczyć wrażenie z całego korytarza.</p>
      <p>Robimy <strong>komplet w jednej stylistyce</strong>: numery pokoi, oznaczenia pięter, tabliczki kierunkowe i szyld do recepcji. Jeden wzór, jeden odcień drewna, jedna typografia — cięte z tej samej partii materiału, więc wszystko do siebie pasuje.</p>
      <p>Jeśli macie własny znak, wprowadzamy go w całą serię. Jeśli nie — możemy zaprojektować oznaczenia od zera.</p>
    </div>
    <div class="panel">
      <h4>Jak wygląda współpraca</h4>
      <ul>
        <li><b>1. Rozmowa</b>Ile pokoi, jakie piętra, jaki charakter wnętrza. Zdjęcia korytarza w zupełności wystarczą.</li>
        <li><b>2. Projekt gratis</b>Wizualizacja całej serii, zanim cokolwiek zamówicie.</li>
        <li><b>3. Próbka</b>Jeden numer wykonany na próbę — oceniacie na miejscu, w swoim świetle.</li>
        <li><b>4. Seria</b>Reszta kompletu z jednej partii materiału, w jednym terminie.</li>
      </ul>
    </div>
  </div>
</section>

<section class="sec alt">
  <span class="tag">Zakres</span>
  <h2>Co składa się na komplet.</h2>
  <div class="grid g3">
    ''' + card('kontakt.html','Numery pokoi','Podstawa zestawu. Od 6 sztuk cena za sztukę spada, a projekt i tak robimy raz.','od 89 zł/szt','5–10 dni','NUMERY POKOI') + '''
    ''' + card('kontakt.html','Tabliczki kierunkowe','Recepcja, śniadania, wyjście, piętra. Ten sam wzór co numery.','od 79 zł','7 dni','TABLICZKI KIERUNKOWE') + '''
    ''' + card('kontakt.html','Szyld do recepcji','Duży znak za ladą albo nad wejściem. Z Waszym logo.','wycena','10–14 dni','SZYLD RECEPCYJNY') + '''
  </div>
  <div class="bundle">
    <div>
      <h4>Pakiet: numeracja + szyld recepcyjny</h4>
      <p>Najczęściej zamawiany zestaw przez pensjonaty i apartamenty na wynajem. Numery pokoi, komplet tabliczek kierunkowych i szyld do recepcji — jeden projekt, jedna dostawa, jedna faktura.</p>
    </div>
    <div class="sum">
      <span class="new">Wycena w 1 dzień</span>
      <a class="btn btn1" href="kontakt.html">Zapytaj o pakiet</a>
    </div>
  </div>
</section>

<section class="sec">
  <span class="tag">Nie tylko hotele</span>
  <h2>Gdzie jeszcze to działa.</h2>
  <div class="grid g3">
    ''' + card('kontakt.html','Gabinety i pracownie','Szyld nad wejście plus oznaczenia pomieszczeń. Spójnie, bez plastiku.','wycena','na zamówienie','GABINET') + '''
    ''' + card('kontakt.html','Apartamenty na wynajem','Numer, tabliczka powitalna i instrukcja na ścianie w jednej stylistyce.','wycena','na zamówienie','APARTAMENT') + '''
    ''' + card('kontakt.html','Prezenty firmowe','Upominki dla klientów lub zespołu, personalizowane po nazwisku.','od 69 zł/szt','ustalany','PREZENTY FIRMOWE') + '''
  </div>
</section>
''' + FREE + FOOT)

    # ============================== KONTAKT ==============================
    P['kontakt.html'] = ('Kontakt', head('Kontakt','kontakt.html')
      + crumb(('Kontakt', None))
      + phead('Kontakt','Opisz swój pomysł. Projekt przygotujemy za darmo.',
              'Nie musisz mieć rysunku ani wymiarów — wystarczy, że wiesz, na jaką okazję i dla kogo. Odpowiadamy w ciągu jednego dnia roboczego i mówimy wprost, czy da się to zrobić.') + '''
<section class="sec">
  <div class="two">
    <div>
      <span class="tag">Formularz</span>
      <h2 style="font-size:28px">Napisz, o czym myślisz</h2>
      <form class="form" onsubmit="return false">
        <div><label for="n">Imię</label><input id="n" type="text" placeholder="Jak się do Ciebie zwracać"></div>
        <div><label for="e">E-mail</label><input id="e" type="email" placeholder="adres@poczta.pl"></div>
        <div class="full"><label for="t">Czego dotyczy</label>
          <select id="t">
            <option>Metryczka</option><option>Numer na drzwi</option>
            <option>Szyld lub emblemat</option><option>Wynajem dekoracji</option>
            <option>Zamówienie dla firmy</option><option>Coś zupełnie innego</option>
          </select></div>
        <div class="full"><label for="w">Opisz swój pomysł</label>
          <textarea id="w" placeholder="Na jaką okazję, dla kogo, na kiedy. Im więcej szczegółów, tym trafniejszy będzie pierwszy projekt."></textarea></div>
        <div class="full"><button class="btn btn1" type="submit">Wyślij zapytanie</button></div>
      </form>
      <p class="legal">Wysyłając formularz, zgadzasz się na kontakt w sprawie tego zapytania. Danych nie wykorzystujemy do niczego innego i nie przekazujemy ich dalej.</p>
    </div>
    <div class="panel">
      <h4>Bezpośrednio</h4>
      <ul>
        <li><b>E-mail</b>kontakt@studiosygnatura.pl</li>
        <li><b>Strona</b>studiosygnatura.pl</li>
        <li><b>Gdzie jesteśmy</b>Poznań i okolice. Odbiór osobisty po ustaleniu, wysyłka w całej Polsce.</li>
        <li><b>Czas odpowiedzi</b>Jeden dzień roboczy. Jeśli nie odpiszemy — sprawdź folder ze spamem.</li>
      </ul>
    </div>
  </div>
</section>
''' + FOOT)

    # ============================== WSPÓŁPRACA ==============================
    P['wspolpraca.html'] = ('Współpraca', head('Współpraca','wspolpraca.html')
      + crumb(('Współpraca', None))
      + phead('Dla organizatorów','Wedding plannerki, dekoratorki, agencje eventowe.',
              'Jeśli organizujecie uroczystości zawodowo, jesteśmy zapleczem, którego nie musicie magazynować. Stałe warunki, pierwszeństwo terminów i pamiątki dla Waszego klienta — sygnowane Waszą marką, nie naszą.') + '''
<section class="sec">
  <span class="tag">Co z tego macie</span>
  <h2>Wy odpowiadacie za wrażenie. My za to, żeby było z czego je zbudować.</h2>
  <div class="two">
    <div>
      <p>Dekoracje kupione na własność trzeba przechowywać, transportować i odnawiać. Przy kilkunastu imprezach w sezonie to <strong>osobny magazyn i osobny problem</strong>.</p>
      <p>U nas bierzecie komplet na konkretny termin. Personalizację robimy na wymiennych wkładkach, więc <strong>ta sama tablica obsługuje kolejne pary i kolejnych jubilatów</strong>, a każdy dostaje swoje imiona i swoją datę.</p>
      <p>Możemy też wykonać rzeczy, których nie ma w katalogu — jeśli macie pomysł na dekorację pod konkretną koncepcję sali, <strong>projekt przygotujemy bez opłat</strong>.</p>
    </div>
    <div class="panel">
      <h4>Warunki dla stałych partnerów</h4>
      <ul>
        <li><b>Rabat</b>Stała zniżka od trzeciej imprezy w sezonie, naliczana od razu.</li>
        <li><b>Pierwszeństwo</b>Wasze terminy rezerwujemy przed zapytaniami od klientów indywidualnych.</li>
        <li><b>Bez kaucji</b>Po trzech zrealizowanych zleceniach rezygnujemy z kaucji.</li>
        <li><b>Rozliczenie</b>Zbiorczo na koniec miesiąca, nie po każdej imprezie.</li>
        <li><b>Wasza marka</b>Nie oznaczamy dekoracji naszym znakiem. Klient widzi Waszą robotę.</li>
      </ul>
    </div>
  </div>
</section>

<section class="sec alt">
  <span class="tag">Pamiątki dla klienta</span>
  <h2>Rzecz, która zostaje, gdy dekoracja już wróci.</h2>
  <p class="sub">Coraz częściej organizator dokłada do imprezy upominek — dla pary, jubilata albo solenizanta. Robimy je pod konkretną okazję, z datą i dedykacją, i możemy wysłać bezpośrednio do Waszego klienta jako prezent od Was.</p>
  <div class="grid g3">
    ''' + card('kontakt.html','Panel z cytatem','Warstwowy panel z sentencją, imionami i datą. Ta sama technika co w metryczce — głębia i cień, nie nadruk.','od 149 zł','7 dni','PANEL Z CYTATEM','Najczęściej wybierane') + '''
    ''' + card('kontakt.html','Ramka rzeźbiona','Na zdjęcie z uroczystości. Rzeźbiona w litym drewnie, z okazją i datą na dolnej listwie.','od 169 zł','7–10 dni','RAMKA RZEŹBIONA') + '''
    ''' + card('kontakt.html','Grawer z dedykacją','Tabliczka okolicznościowa — jubileusz, rocznica, pożegnanie pracownika, podziękowanie dla świadków.','od 89 zł','5 dni','GRAWER Z DEDYKACJĄ') + '''
  </div>
  <div class="grid g3" style="margin-top:24px">
    ''' + card('kontakt.html','Podziękowania dla gości','Drobiazgi w większej serii — magnesy, zawieszki, tabliczki z imionami przy nakryciach.','od 12 zł/szt','od 20 sztuk','PODZIĘKOWANIA DLA GOŚCI') + '''
    ''' + card('kontakt.html','Upominek dla rodziców','Warstwowy panel albo ramka z datą ślubu i podziękowaniem. Wręczany przy toaście.','od 149 zł','7 dni','UPOMINEK DLA RODZICÓW') + '''
    ''' + card('kontakt.html','Coś pod koncepcję','Macie własny pomysł na upominek? Opiszcie go — projekt przygotujemy za darmo.','wycena','indywidualnie','PROJEKT INDYWIDUALNY') + '''
  </div>
</section>

<section class="sec" id="terminarz">
  <span class="tag">Terminarz</span>
  <h2>Sprawdźcie, co jest wolne, zanim złożycie klientowi obietnicę.</h2>
  <p class="sub">Ten sam terminarz, który widzą klienci indywidualni — ale Wasze zgłoszenia rozpatrujemy w pierwszej kolejności. Jeśli termin jest zajęty, a sprawa pilna, napiszcie: często da się przesunąć zestaw albo złożyć zamiennik z pojedynczych sztuk.</p>
  <div class="pkgs">
    ''' + pkg('klasyczny','Pakiet Klasyczny','Jasne drewno · serif · minimalizm',
        [('Komplet podstawowy','5 pozycji'),('Cena partnerska','od 3. imprezy'),
         ('Wkładka z Waszą marką','w cenie')],
        '215 zł','169 zł','PAKIET KLASYCZNY') + '''
    ''' + pkg('lesny','Pakiet Leśny','Ciemne drewno · liście · mech',
        [('Komplet rozszerzony','6 pozycji'),('Cena partnerska','od 3. imprezy'),
         ('Wkładka z Waszą marką','w cenie')],
        '270 zł','209 zł','PAKIET LEŚNY') + '''
    ''' + pkg('firmowy','Pakiet Firmowy','Ciemne drewno · logo klienta',
        [('Komplet eventowy','5 pozycji'),('Cena partnerska','od 3. imprezy'),
         ('Wkładki z logo','w cenie')],
        '320 zł','249 zł','PAKIET FIRMOWY') + '''
  </div>
  <div class="btns"><a class="btn btn1" href="wynajem.html#rezerwacja">Zgłoś termin</a>
  <a class="btn btn2" href="kontakt.html">Zapytaj o warunki stałe</a></div>
</section>

<section class="sec alt">
  <span class="tag">Jak zaczynamy</span>
  <h2>Bez umowy na start i bez zobowiązań.</h2>
  <div class="steps">
    <div class="step"><h4>Poznajemy się</h4><p>Piszecie, jaki typ imprez obsługujecie i w jakiej stylistyce pracujecie.</p></div>
    <div class="step"><h4>Pierwsze zlecenie</h4><p>Na zwykłych warunkach — sprawdzacie jakość, terminowość i to, czy się dogadujemy.</p></div>
    <div class="step"><h4>Warunki stałe</h4><p>Od trzeciej imprezy wchodzą rabaty, pierwszeństwo terminów i rozliczenie miesięczne.</p></div>
    <div class="step"><h4>Rzeczy na wyłączność</h4><p>Przy dłuższej współpracy projektujemy dekoracje tylko dla Was — nikt inny ich nie dostanie.</p></div>
  </div>
</section>

<section class="sec">
  <span class="tag">Pytania</span>
  <h2>Zanim się odezwiecie</h2>
  <div class="faq">
    <details open><summary>Czy klient dowie się, że to nie Wasze dekoracje?</summary>
      <p>Nie od nas. Nie oznaczamy wynajmowanych dekoracji swoim znakiem i nie kontaktujemy się z Waszymi klientami bez Waszej wiedzy. Jeśli chcecie, pamiątki wysyłamy w neutralnym opakowaniu albo z Waszą wkładką.</p></details>
    <details><summary>Ile trwa wykonanie rzeczy spoza katalogu?</summary>
      <p>Projekt zwykle dwa–trzy dni, wykonanie od tygodnia w górę, zależnie od złożoności. Przy większych seriach umawiamy termin z wyprzedzeniem — najlepiej na początku sezonu.</p></details>
    <details><summary>Obsłużycie kilka imprez w jeden weekend?</summary>
      <p>Powiemy wprost, ile jesteśmy w stanie udźwignąć. Wolimy odmówić czwartego terminu, niż przywieźć na trzeci coś zrobionego w pośpiechu.</p></details>
    <details><summary>Pracujecie poza Poznaniem?</summary>
      <p>Wysyłkowo w całej Polsce. Dowóz i odbiór dekaracji osobiście — Poznań i okolice, dalsze lokalizacje do ustalenia.</p></details>
  </div>
</section>
''' + FREE + '<script>' + CALJS + '</script>' + FOOT)

    return P
