# Platforma treningowa CTF – Analiza bezpieczeństwa systemów

## Opis projektu

Aplikacja webowa w modelu CTF (Capture The Flag) służąca do nauki praktycznych aspektów cyberbezpieczeństwa. Użytkownicy rejestrują się, rozwiązują zadania z kategorii OWASP Top 10, zdobywają punkty i rywalizują w rankingu.

---

## Stack technologiczny

| Warstwa | Technologia |
|---|---|
| Backend | Node.js + Express 5 |
| Baza danych | MariaDB 12 |
| Frontend | HTML + Vanilla JS (bez frameworków) |
| Styl | CSS (własny) |

---

## Struktura projektu

```
bezpieczenstwo_projekt/
├── server.js               # Serwer Express – wszystkie endpointy API
├── package.json
├── projekt2.sql            # Dump bazy danych (schema + dane testowe)
├── secrets/
│   └── admin_creds.txt     # Plik używany w zadaniu Path Traversal
└── public/                 # Pliki statyczne serwowane przez Express
    ├── index.html          # Strona logowania / rejestracji
    ├── mainpage.html       # Strona główna z rankingiem
    ├── excercises.html     # Lista zadań (zakładki per kategoria)
    ├── notes/              # Katalog używany w zadaniu Path Traversal
    └── excercises/         # Pliki poszczególnych zadań
        ├── SQLinjection1.html / .js
        ├── SQLinjection2.html / .js
        ├── SQLinjection3.html / .js
        ├── HTMLInjection1.html / .js
        ├── HTMLInjection2.html / .js
        ├── HTMLInjection3.html / .js
        ├── Adminview.html / .js
        ├── XSS1.html / .js
        ├── IDOR1.html / .js
        ├── BrokenAuth1.html / .js
        └── PathTraversal1.html / .js
        ├── CommandInjection1.html / .js
        ├── CommandInjection2.html / .js
        └── CommandInjection3.html / .js
```

---

## Instrukcja uruchomienia

### Wymagania

- macOS / Linux
- Node.js ≥ 18
- MariaDB ≥ 10

### Instalacja (macOS – Homebrew)

```bash
# 1. Zainstaluj Node.js i MariaDB
brew install node mariadb

# 2. Uruchom MariaDB
brew services start mariadb

# 3. Utwórz bazę danych i załaduj schemat
mariadb -u root -proot -e "CREATE DATABASE IF NOT EXISTS projekt;"
mariadb -u root -proot projekt < projekt2.sql

# 4. Zainstaluj zależności Node
npm install

# 5. Uruchom serwer
node server.js
```

Aplikacja działa pod adresem: **http://localhost:3000**

### Dane testowe

| Login | Hasło | Uwagi |
|---|---|---|
| admin | SuperSecretPassword2137 | Konto administratora |
| user2 | pass | |
| user3 | pass | |

### Zatrzymanie serwera

```bash
pkill -f "node server.js"
```

---

## Schemat bazy danych

```
users            – konta użytkowników (user_id, user_name, password)
excercises       – lista zadań (ex_id, ex_type, ex_title)
excerciseTypes   – kategorie zadań (type_id, type)
excercisesPoints – ukończone zadania i punkty (ex_id, user_id, points)
comments         – komentarze używane w zadaniu HTML injection
```

---

## Zadania

### SQL Injection

| Zadanie | Podatny endpoint | Cel | Sposób rozwiązania |
|---|---|---|---|
| SQL injection 1 | `POST /getSQL1` | Wyciągnąć dane więcej niż jednego użytkownika | Wpisać `1 OR 1=1` w pole User ID |
| SQL injection 2 | `POST /updateUsername` | Zmodyfikować rekordy więcej niż jednego użytkownika | Wpisać `hacked' WHERE user_id > 0 -- ` jako nową nazwę |
| SQL injection 3 | `POST /searchUsers` | Wyciągnąć kolumnę `password` przez UNION | Wpisać `' UNION SELECT user_id, password FROM users -- ` |

**Podatność:** endpointy używają interpolacji template literals zamiast parametryzowanych zapytań.

---

### HTML Injection

| Zadanie | Podatny mechanizm | Cel | Sposób rozwiązania |
|---|---|---|---|
| HTML injection 1 | `innerHTML` przy renderowaniu komentarzy | Wstrzyknąć kod HTML | Wysłać komentarz zawierający tagi HTML, np. `<b>test</b>` lub `<img src=x onerror=alert(1)>` |
| HTML injection 2 | `innerHTML` przy podglądzie profilu | Wstrzyknąć własny nagłówek HTML | Wpisać `<h1>HACKED PROFILE</h1>` |
| HTML injection 3 | `innerHTML` przy podglądzie ogłoszenia | Wstrzyknąć formularz logowania | Wpisać `<form><input placeholder="login"><input placeholder="password"></form>` |


**Podatność:** komentarze wyświetlane przez `innerHTML` zamiast `textContent`.

---

### XSS (Cross-Site Scripting)

| Zadanie | Podatny mechanizm | Cel | Sposób rozwiązania |
|---|---|---|---|
| XSS 1 | `innerHTML` przy reflektowaniu parametru URL `?q=` | Wykonać kod JavaScript | Wpisać `<img src=x onerror=alert(1)>` i kliknąć Search |

**Podatność:** parametr URL wstrzykiwany bezpośrednio do `innerHTML` bez sanitizacji.

---

### IDOR (Insecure Direct Object Reference)

| Zadanie | Podatny endpoint | Cel | Sposób rozwiązania |
|---|---|---|---|
| IDOR 1 | `GET /getUser?user_id=X` | Odczytać dane innego użytkownika | Podać user_id różny od własnego, np. `1` |

**Podatność:** brak weryfikacji czy zalogowany użytkownik ma prawo dostępu do żądanego zasobu.

---

### Broken Authentication

| Zadanie | Podatny mechanizm | Cel | Sposób rozwiązania |
|---|---|---|---|
| Broken Auth 1 | Token zakodowany w klienckiej logice JS | Znaleźć i użyć tokenu | Otworzyć DevTools → Sources → `BrokenAuth1.js`, znaleźć `SECRET_TOKEN = "opensesame"` |

**Podatność:** sekret przechowywany w kodzie JavaScript widocznym dla klienta.

---

### Path Traversal

| Zadanie | Podatny endpoint | Cel | Sposób rozwiązania |
|---|---|---|---|
| Path Traversal 1 | `GET /readNote?file=X` | Odczytać plik poza katalogiem `notes/` | Wpisać `../../secrets/admin_creds.txt` |

**Podatność:** brak sanitizacji ścieżki – sekwencja `../` pozwala wyjść poza przeznaczony katalog.

### Command Injection

| Zadanie | Podatny endpoint | Cel | Sposób rozwiązania |
|---|---|---|---|
| Command Injection 1 | POST /ping | Pozyskać nazwę użytkownika systemowego | 127.0.0.1; whoami |
| Command Injection 2 | POST /ping | Odczytać plik z danymi administratora | 127.0.0.1; cat secrets/admin_creds.txt |
| Command Injection 3 | POST /ping | Wyświetlić zawartość katalogu aplikacji | 127.0.0.1; ls |

Flagi:

- FLAG{command_injection_user}
- FLAG{command_injection_creds}
- FLAG{command_injection_listing}

**Podatność:** dane wejściowe są bezpośrednio przekazywane do polecenia systemowego bez walidacji, co umożliwia wykonanie dodatkowych poleceń systemowych.

---

### Admin view

| Zadanie | Podatny mechanizm | Cel | Sposób rozwiązania |
|---|---|---|---|
| Admin view | Sprawdzenie `localStorage.is_admin` po stronie klienta | Ominąć kontrolę dostępu | Otworzyć DevTools → Console → `localStorage.setItem("is_admin", "true")`, odświeżyć stronę |

**Podatność:** weryfikacja uprawnień odbywa się po stronie klienta, który może ją zmodyfikować.

---

## Architektura bezpieczeństwa platformy

Platforma jest **celowo podatna** w ściśle określonych miejscach:

| Podatność | Lokalizacja
|---|---|---|
| SQL injection | `/getSQL1`, `/updateUsername`, `/searchUsers`
| Brak autoryzacji (IDOR) | `/getUser`, `/adminData`
| Path traversal | `/readNote`
| Command Injection | `/ping` 
| XSS/HTML injection | `innerHTML` w JS klienta 
| Sekret w kodzie klienta | `BrokenAuth1.js` 
| Weryfikacja po stronie klienta | `Adminview.js` 

Pozostałe endpointy (`/login`, `/register`, `/successExcercise`, `/checkSuccessExcercise`, `/leaderboard`, `/resetDB`) używają parametryzowanych zapytań.

**Ochrona przed destrukcyjnymi operacjami:** podatne endpointy SQL blokują słowa kluczowe `DROP`, `TRUNCATE`, `CREATE`, `ALTER` — zapobiegając usunięciu tabel przez ćwiczących.

---

## Endpointy API

| Metoda | Ścieżka | Opis |
|---|---|---|
| POST | `/login` | Logowanie |
| POST | `/register` | Rejestracja |
| GET | `/leaderboard` | Ranking użytkowników |
| GET | `/getExcerciseTypes` | Lista kategorii zadań |
| POST | `/getExcerciseByType` | Lista zadań danej kategorii |
| POST | `/getSQL1` | **[PODATNY]** Sprawdzenie punktów po user_id |
| POST | `/updateUsername` | **[PODATNY]** Zmiana nazwy użytkownika |
| POST | `/searchUsers` | **[PODATNY]** Wyszukiwanie użytkowników |
| POST | `/postComment` | Dodanie komentarza |
| GET | `/getComments` | Pobranie komentarzy |
| GET | `/getUser` | **[PODATNY]** Pobranie profilu użytkownika |
| GET | `/readNote` | **[PODATNY]** Odczyt pliku notatki |
| GET | `/adminData` | **[PODATNY]** Dane użytkowników (brak auth) |
| POST | `/ping` | **[PODATNY]** Wykonanie polecenia systemowego |
| POST | `/successExcercise` | Zapis ukończonego zadania |
| POST | `/checkSuccessExcercise` | Sprawdzenie czy zadanie ukończone |
| POST | `/resetDB` | Reset bazy do stanu początkowego |

