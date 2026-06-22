
### Zadanie 1

✅ 3.0 Procedura do generowania 50 losowych liczb od 0 do 100 [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/e8f5807bd2147b1b73336881e138ed7a38eaf4b3)

✅ 3.5 Procedura do sortowania liczb [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/4c35032c437b8e1feb79f4b55540eaf4c7bf9995)

✅ 4.0 Dodanie parametrów do procedury losującej określającymi zakres losowania: od, do, ile [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/41fbb87e8572b1fdc189102638d536c53d983ab1)

✅ 4.5 5 testów jednostkowych testujące procedury [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/c022c0a1ecc465a344c57914d4849678742ef3c6)

✅ 5.0 Skrypt w bashu do uruchamiania aplikacji w Pascalu via docker; *należy uruchomić run.sh* [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/94d3cdc903c54d3630b4c778881862020f7e0961)

KOD: [LINK DO ZADANIA 1](https://github.com/epnaj/projektowanie-obiektowe/tree/main/zadanie1)

---

### Zadanie 2

✅ 3.0 Należy stworzyć jeden model z kontrolerem z produktami, zgodnie z
CRUD (JSON) [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/02a88814e44f056732ed7393d933ab45189d142e)

```bash
cd zadanie2
docker build -t zadanie2 .
./run-docker.sh zadanie2
```

> Aplikacja dostępna pod http://localhost:8000

✅ 3.5 Należy stworzyć skrypty do testów endpointów via curl (JSON) [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/4ab04d5e806862a4c4fc2500124e13ed38d502b3)

### Uruchomienie testów

```bash
cd zadanie2
./tests/run-tests.sh
```

✅ 4.0 Należy stworzyć dwa dodatkowe kontrolery wraz z modelami  (JSON) [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/4c8ee721f7679874524dec3854a9281c3bb4bddf)

> http://localhost:8000/api/products

> http://localhost:8000/api/categories

> http://localhost:8000/api/orders

✅ 4.5 Należy stworzyć widoki do wszystkich kontrolerów [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/c03502a9e82365496e3614941ba3489f95510d81)

> http://localhost:8000/products

> http://localhost:8000/categories

> http://localhost:8000/orders


❌ 5.0 Stworzenie panelu administracyjnego

KOD: [LINK DO ZADANIA 2](https://github.com/epnaj/projektowanie-obiektowe/tree/main/zadanie2)

---

### Zadanie 3

```bash
cd zadanie3
docker build -t zadanie3 .
./run-docker.sh zadanie3
```

✅ 3.0 Należy stworzyć jeden kontroler wraz z danymi wyświetlanymi z
listy na endpoint’cie w formacie JSON - Kotlin + Spring Boot [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/415eeb765bfb63dd9f4f303a115be012763e4af6)

> http://localhost:8000/users

✅ 3.5 Należy stworzyć klasę do autoryzacji (mock) jako Singleton w
formie eager [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/eecac077e0b3153b026959644e8cf9c1f2c28332)

✅ 4.0 Należy obsłużyć dane autoryzacji przekazywane przez użytkownika [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/d7ddbe4985d9d9bec8832e3b3a59d5978ccd9cd7)

> Endpoint `POST /login` przyjmuje JSON `{ "username": "...", "password": "..." }` i zwraca `{ "authenticated": true/false }`. Poprawne dane: `admin` / `admin123`.

```bash
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

✅ 4.5 Należy wstrzyknąć singleton do głównej klasy via @Autowired lub
kontruktor (constructor injection) [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/0e7bb2635c0cf29f5926f18a628ccaa7360570e0)

✅ 5.0 Obok wersji Eager do wyboru powinna być wersja Singletona w wersji
lazy [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/106c7910d29947f359f57911a3c0a4d76e323f48)

> `AuthService` został wyciągnięty jako interfejs z dwiema implementacjami: `EagerAuthService` (`@Service @Qualifier("eager")`, domyślnie eager - tworzony przy starcie kontekstu) oraz `LazyAuthService` (`@Service @Lazy @Qualifier("lazy")` - inicjalizowany przy pierwszym użyciu). `AuthController` przez constructor injection otrzymuje obie wersje (rozróżniane `@Qualifier`) i udostępnia dwa endpointy do wyboru: `POST /login/eager` i `POST /login/lazy`. Endpoint `POST /login` zachowany jako wersja domyślna (eager) dla wstecznej kompatybilności.

Obie klasy mają `init { println(...) }` pokazujące, kiedy dokładnie są tworzone:
- `EagerAuthService created` - pojawi się w logach zaraz po starcie aplikacji
- `LazyAuthService created` - pojawi się dopiero po pierwszym requeście na `/login/lazy`

```bash
# wersja eager
curl -X POST http://localhost:8000/login/eager \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# wersja lazy (przy pierwszym wywołaniu zobaczysz w logach "LazyAuthService created")
curl -X POST http://localhost:8000/login/lazy \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

KOD: [LINK DO ZADANIA 3](https://github.com/epnaj/projektowanie-obiektowe/tree/main/zadanie3)

---

### Zadanie 4

```bash
cd zadanie4
docker build -t zadanie4 .
./run-docker.sh zadanie4
```

> http://localhost:8000

✅ 3.0 Należy stworzyć aplikację we frameworki echo w j. Go, która będzie
miała kontroler Pogody, która pozwala na pobieranie danych o pogodzie
(lub akcjach giełdowych) [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/b2325bd)

> endpoint `GET/POST /weather/:location`

```bash
curl http://localhost:8000/weather/warsaw
curl -X POST http://localhost:8000/weather/krakow
```

✅ 3.5 Należy stworzyć model Pogoda (lub Giełda) wykorzystując gorm, a dane załadować z listy przy uruchomieniu [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/13475fc)

> Model `Weather` z tagami gorm (`primaryKey`, `uniqueIndex`, `not null`). Ładuje listę startową (Warsaw, Krakow, Gdansk) do SQLite

✅ 4.0 Należy stworzyć klasę proxy, która pobierze dane z serwisu zewnętrznego podczas zapytania do naszego kontrolera [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/6e6af08)

✅ 4.5 Należy zapisać pobrane dane z zewnątrz do bazy danych [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/b268ddc)

✅ 5.0 5.0 Należy rozszerzyć endpoint na więcej niż jedną lokalizację (Pogoda), lub akcje (Giełda) zwracając JSONa [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/9099735)

> Nowy multi-endpoint `GET /weather?locations=A,B,C` oraz `POST /weather` z body `{"locations":["A","B"]}`

```bash
curl "http://localhost:8000/weather?locations=Warsaw,Krakow,Tokyo"

curl -X POST http://localhost:8000/weather \
  -H "Content-Type: application/json" \
  -d '{"locations":["Warsaw","Krakow","London"]}'
```

KOD: [LINK DO ZADANIA 4](https://github.com/epnaj/projektowanie-obiektowe/tree/main/zadanie4)

---

### Zadanie 5

```bash
cd zadanie5
docker compose up --build
```

> Frontend (React + Vite): http://localhost:5173
>
> Backend (Node http): http://localhost:8000

✅ 3.0 W ramach projektu należy stworzyć komponenty Produkty oraz Płatności; komponent Produkty powinien pobierać listę produktów z aplikacji serwerowej, natomiast komponent Płatności powinien wysyłać dane płatności do aplikacji serwerowej. [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/4f7bd5d)

> Endpointy `GET /api/products`, `POST /api/payments`.

✅ 3.5 Należy dodać komponent Koszyk wraz z osobnym widokiem; aplikacja powinna umożliwiać przechodzenie pomiędzy widokami przy użyciu routingu. [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/7716124)

✅ 4.0 Dane pomiędzy komponentami, takimi jak Produkty, Koszyk i Płatności, powinny być przekazywane z wykorzystaniem React hooks, np. useState, useEffect lub useContext. [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/b322072)

> Refaktor koszyka na `CartContext` + hook `useCart()`. Eliminuje prop drilling — Products, Cart i Payments konsumują kontekst bezpośrednio. Każdy komponent dalej używa lokalnego `useState`/`useEffect` dla własnego stanu.

✅ 4.5 Należy przygotować konfigurację umożliwiającą uruchomienie aplikacji klienckiej oraz serwerowej w kontenerach Docker za pomocą docker-compose. (zrobione już wcześniej) [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/b322072)

✅ 5.0 Należy wykorzystać bibliotekę axios do komunikacji z serwerem oraz skonfigurować obsługę CORS, aby frontend mógł poprawnie komunikować się z backendem. [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/10175be)

KOD: [LINK DO ZADANIA 5](https://github.com/epnaj/projektowanie-obiektowe/tree/main/zadanie5)

---

### Zadanie 6

[![Quality gate](https://sonarcloud.io/api/project_badges/quality_gate?project=epnaj_projektowanie-obiektowe)](https://sonarcloud.io/summary/new_code?id=epnaj_projektowanie-obiektowe)

✅ 3.0 Należy skonfigurować husky + lint-staged uruchamianie lintowania przed commitem [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/26c93a3)

> Po `npm install` w roocie husky instaluje hook `.husky/pre-commit`;  
> `npx lint-staged` -> ESLint na plikach z indeksu. Commit z błędami ESLint jest blokowany.

✅ 3.5 Należy wyeliminować wszystkie bugi w kodzie w Sonarze (kod aplikacji klienckiej) [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/73c6d1a)

✅ Przeskanować oraz naprawić dowolny projekt open source narzędziem CodeQL [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/4cd6a46)

✅ 4.5 Należy usunąć problemy typu Code Smell w kodzie w Sonarze (kotlin, go, js). Należy dodać badge z Sonara [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/863eb18)

✅ Skonfigurować Github Actions z linterem oraz CodeQL [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/7b7f91a)

---

### Zadanie 8

✅ 3.0 Przetestuj formularz rejestracji użytkownika pod kątem walidacji pól obowiązkowych oraz zachowania aplikacji po wprowadzeniu niepoprawnego formatu adresu e-mail [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/7155e60)

```bash
cd zadanie8/zad-3.0
./run-docker-tests.sh
```

> Selenium (`test_register_ui.py`) sprawdza walidację pól obowiązkowych i odrzucenie błędnego formatu e-mail; `test_register.py` waliduje warstwę API rejestracji.

✅ 3.5 Przeprowadź testy bezpieczeństwa typu Cross-Site Scripting (XSS), próbując wstrzyknąć złośliwy kod JavaScript w aplikacji z Reactem [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/51e8e0f)

```bash
cd zadanie8/zad-3.5
./run-docker-tests.sh
```

> `test_xss.py` wstrzykuje payloady (`<script>`, `<img onerror=...>`) w pola formularzy i potwierdza, że React escapuje dane i nie dochodzi do wykonania JS.

✅ 4.0 Przetestuj działanie koszyka zakupowego przy jednoczesnym otwarciu aplikacji w kilku osobnych kartach tej samej przeglądarki, sprawdzając spójność stanów zamówienia [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/1af7ccc)

```bash
cd zadanie8/zad-4.0
./run-docker-tests.sh
```

✅ 4.5 Do zadania z React'a należy dodać formularz logowania. Następnie
przeprowadź testy podatności na ataki typu Cross-Site Request Forgery
(CSRF), próbując wymusić nieautoryzowaną zmianę ustawień konta
spreparowanym linkiem, podczas gdy użytkownik posiada aktywną sesję w
innej karcie. [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/89585a3)

```bash
cd zadanie8/zad-4.5
./run-docker-tests.sh
```

✅ 5.0 Scenariusz End-to-End w Playwright (minimum 50 asercji) [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/53a319d)

```bash
cd zadanie8/zad-5.0
./run-docker-tests.sh
```

> `e2e.spec.js` — pełny przepływ użytkownika (przeglądanie produktów, koszyk, zamówienie, logowanie) z ponad 50 asercjami, uruchamiany w obrazie `mcr.microsoft.com/playwright`.

KOD: [LINK DO ZADANIA 8](https://github.com/epnaj/projektowanie-obiektowe/tree/main/zadanie8)

---

### Zadanie 9

> Aplikacja na chmurze: **http://130.61.69.67:5173** (API: http://130.61.69.67:8000)

✅ 3.0 Należy stworzyć odpowiednie instancje po stronie chmury na dockerze

> Na maszynie Oracle Cloud VM działają kontenery `z9-server` (port 8000) i `z9-client` (port 5173), pobierane z `ghcr.io`

```bash
PUBLIC_IP=130.61.69.67 WATCHTOWER_TOKEN=<token> ./zadanie9/vps-setup.sh
```

✅ 3.5 Stworzyć odpowiedni pipeline w Github Actions do budowania aplikacji [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/ceb3537)

✅ 4.0 Dodać notyfikację mailową o zbudowaniu aplikacji [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/20603b0)

✅ 4.5 Dodać krok z deploymentem aplikacji serwerowej oraz klienckiej na chmurę [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/22f789d)

> Job `deploy` (po przejściu testów regresyjnych) woła HTTP API Watchtowera na VM (`POST /v1/update`, Bearer token), który pobiera nowe obrazy `latest` i restartuje kontenery `z9-server` i `z9-client`. Deployment pull-based, bez SSH.

✅ 5.0 Dodać uruchomienie regresyjnych testów automatycznych (funkcjonalnych) jako krok w Actions [LINK](https://github.com/epnaj/projektowanie-obiektowe/commit/a6b158b)

KOD: [LINK DO ZADANIA 9](https://github.com/epnaj/projektowanie-obiektowe/tree/main/zadanie9)