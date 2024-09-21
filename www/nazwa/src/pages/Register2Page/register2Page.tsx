import { Link } from "react-router-dom";
import styles from "./register2Page.module.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// import { v4 as uuidv4 } from "uuid";
export default function LoginPage() {
  const [user, setUser] = useState({
    mail: "",
    surname: "",
    name: "",
    username: "",
    indeks: "",
    password1: "",
    password2: "",
    type: "student",
  });

  const navigate = useNavigate();
  const registerUser = async () => {
    try {
      const res = await axios.post("http://localhost:3000/register", {
        username: user.username,
        password: user.password1,
        type: "student",
        email: sessionStorage.getItem("email"),
        numer_indeksu: user.indeks,
      });

      if (res.status === 201) {
        sessionStorage.removeItem("email");
        navigate("/loginpage");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.background}>
        <div className={styles.naglowek}>FORMULARZ</div>
        <div className={styles.naglowek}>KONTAKTOWY</div>
        <div className={styles.loginSquare}>
          <div className={styles.info}>Podaj swoje dane osobowe</div>
          <div className={styles.dane}>Imię</div>
          <input
            placeholder="Imię"
            maxLength={45}
            onChange={(e) =>
              setUser((prevUser) => ({ ...prevUser, name: e.target.value }))
            }
            className={styles.inputLogin}
          />

          <div className={styles.dane}>Nazwisko</div>
          <input
            placeholder="Nazwisko"
            maxLength={45}
            onChange={(e) =>
              setUser((prevUser) => ({ ...prevUser, surname: e.target.value }))
            }
            className={styles.inputLogin}
          />

          <div className={styles.dane}>Nazwa użytkownika</div>
          <input
            placeholder="username"
            maxLength={45}
            onChange={(e) =>
              setUser((prevUser) => ({ ...prevUser, username: e.target.value }))
            }
            className={styles.inputLogin}
          />

          <div className={styles.dane}>Numer indeksu</div>
          <input
            placeholder="000000"
            maxLength={6}
            onChange={(e) =>
              setUser((prevUser) => ({ ...prevUser, indeks: e.target.value }))
            }
            className={styles.inputLogin}
          />

          <div className={styles.dane}>Hasło</div>

          <input
            placeholder="Hasło"
            type="password"
            maxLength={45}
            onChange={(e) =>
              setUser((prevUser) => ({
                ...prevUser,
                password1: e.target.value,
              }))
            }
            className={styles.inputLogin}
          />
          <input
            placeholder="Potwierdź hasło"
            type="password"
            maxLength={45}
            onChange={(e) =>
              setUser((prevUser) => ({
                ...prevUser,
                password2: e.target.value,
              }))
            }
            className={styles.inputLogin}
          />
          <button className={styles.przycisk} onClick={registerUser}>
            Kontynuuj
          </button>
          <div className={styles.linkiDolne}>
            <Link to="/loginPage" className={styles.linkDolnyLogin}>
              Logowanie
            </Link>
          </div>
        </div>
        <Link to="/" className={styles.linkDolny}>
          Strona Główna
        </Link>
      </div>
    </div>
  );
}
