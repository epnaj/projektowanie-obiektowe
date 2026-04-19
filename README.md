
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