

---

# System Wypożyczania Rzeczy z Koła Naukowego

## Spis treści
- [Opis](#opis)
- [Instalacja](#instalacja)
- [Uruchamianie Backend](#uruchamianie-backend)
- [Dokumentacja API](#dokumentacja-api)
- [Przykłady Użycia](#przykłady-użycia)
- [Zasady Projektowania Kodów Frontendowych](#zasady-projektowania-kodów-frontendowych)
- [Przykłady Komponentów](#przykłady-komponentów)

## Opis
System służy do wypożyczania rzeczy z koła naukowego. Aplikacja podzielona jest na frontend i backend. Backend jest napisany w Node.js i korzysta z MySQL oraz Sequelize. Frontend korzysta z React. Dokumentacja API jest dostępna za pomocą Swagger UI.

## Instalacja

### Backend
1. Skopiuj repozytorium.
2. Zainstaluj wymagane zależności:
    ```bash
    npm install
    ```
3. Skonfiguruj bazę danych w pliku `config/database.js`.
4. Uruchom serwer:
    ```bash
    npm start
    ```

### Frontend
1. Skopiuj repozytorium.
2. Zainstaluj wymagane zależności:
    ```bash
    npm install
    ```
3. Uruchom serwer:
    ```bash
    npm start
    ```

## Uruchamianie Backend
Backend jest uruchamiany na porcie 3000. Dokumentacja API jest dostępna pod adresem `http://localhost:3000/api-docs`.

## Dokumentacja API

### 1. Rejestracja użytkownika

**Endpoint**: `POST /register`
- **URL**: `http://localhost:3000/register`
- **Body (JSON)**:
  ```json
  {
      "username": "student",
      "password": "password123",
      "type": "student"
  }
  ```

### 2. Logowanie użytkownika

**Endpoint**: `POST /login`
- **URL**: `http://localhost:3000/login`
- **Body (JSON)**:
  ```json
  {
      "username": "student",
      "password": "password123"
  }
  ```

### 3. Dodawanie przedmiotu (dla admina)

**Endpoint**: `POST /items`
- **URL**: `http://localhost:3000/items`
- **Header**: `Authorization: Bearer [JWT_TOKEN]`
- **Body (JSON)**:
  ```json
  {
      "name": "Laptop",
      "quantity": 10,
      "description": "Dell XPS 13"
  }
  ```

### 4. Wyświetlanie przedmiotów

**Endpoint**: `GET /items`
- **URL**: `http://localhost:3000/items`
- **Header**: `Authorization: Bearer [JWT_TOKEN]`

### 5. Zatwierdzanie zamówienia (dla admina)

**Endpoint**: `POST /approve-order/:id`
- **URL**: `http://localhost:3000/approve-order/:id`
- **Header**: `Authorization: Bearer [JWT_TOKEN]`

## Przykłady Użycia

### Rejestracja użytkownika
```javascript
const registerUser = async (username, password, type) => {
    const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, type })
    });

    if (!response.ok) {
        throw new Error('Error registering user');
    }

    const data = await response.json();
    console.log('User registered:', data);
};
```

### Logowanie użytkownika
```javascript
const loginUser = async (username, password) => {
    const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
        throw new Error('Error logging in');
    }

    const data = await response.json();
    console.log('Logged in:', data);
    localStorage.setItem('token', data.token);
};
```

### Dodawanie przedmiotu (dla admina)
```javascript
const addItem = async (name, quantity, description) => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3000/items', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, quantity, description })
    });

    if (!response.ok) {
        throw new Error('Error adding item');
    }

    const data = await response.json();
    console.log('Item added:', data);
};
```

### Wyświetlanie przedmiotów
```javascript
const fetchItems = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3000/items', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Error fetching items');
    }

    const data = await response.json();
    console.log('Items:', data);
    setItems(data);
};
```

### Zatwierdzanie zamówienia (dla admina)
```javascript
const approveOrder = async (orderId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:3000/approve-order/${orderId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Error approving order');
    }

    console.log('Order approved');
};
```

## Zasady Projektowania Kodów Frontendowych

- **Korzystaj z komponentów funkcyjnych i hooków**: Używaj React Hooks (`useState`, `useEffect`) do zarządzania stanem i efektami ubocznymi w Twoich komponentach.
- **Przechowuj token JWT**: Po zalogowaniu użytkownika, przechowuj token JWT w localStorage lub w kontekście aplikacji, aby mógł być używany w kolejnych żądaniach do API.
- **Bezpieczeństwo**: W każdym żądaniu do API wymagającym autoryzacji, dodaj nagłówek `Authorization` z tokenem JWT.
- **React Router**: Użyj `react-router-dom` do zarządzania nawigacją w aplikacji, aby stworzyć różne podstrony (np. rejestracja, logowanie, lista przedmiotów).
- **Formik i Yup**: Do zarządzania formularzami i walidacją użyj `formik` i `yup`.
- **Stylizacja**: Użyj CSS-in-JS bibliotek jak `styled-components` lub klasycznych stylów CSS/SASS do stylizacji komponentów.

## Przykłady Komponentów

### Komponent Rejestracji
```javascript
import React, { useState } from 'react';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [type, setType] = useState('student');

    const handleRegister = async () => {
        try {
            await registerUser(username, password, type);
            alert('User registered successfully');
        } catch (error) {
            alert('Error registering user: ' + error.message);
        }
    };

    return (
        <div>
            <h2>Register</h2>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
            </select>
            <button onClick={handleRegister}>Register</button>
        </div>
    );
};

export default Register;
```

### Komponent Logowania
```javascript
import React, { useState } from 'react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            await loginUser(username, password);
            alert('User logged in successfully');
        } catch (error) {
            alert('Error logging in: ' + error.message);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value

)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
};

export default Login;
```

### Komponent Wyświetlania Przedmiotów
```javascript
import React, { useState, useEffect } from 'react';

const ItemList = () => {
    const [items, setItems] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchItems();
                setItems(data);
            } catch (error) {
                alert('Error fetching items: ' + error.message);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            <h2>Items</h2>
            <ul>
                {items.map(item => (
                    <li key={item.id}>
                        {item.name} - {item.quantity} - {item.description}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ItemList;
```

---
