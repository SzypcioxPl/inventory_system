import { Link } from "react-router-dom";
import styles from "./loginPage.module.css";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
export default function LoginPage() {
  const [user, setUser] = useState({ login: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const loginUser = async () => {
    try {
      const res = await axios.post("http://localhost:3000/login", {
        username: user.login,
        password: user.password,
      });

      console.log(res.data.token);
      localStorage.setItem("userToken", res.data.token);
      setErrorMessage("");
      navigate("/");
    } catch (err) {
      console.log(err);
      if (err instanceof AxiosError && err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          setErrorMessage("Nieprawidłowe Dane Użytkownika !");
        }
      }
    }
  };

  useEffect(() => {
    console.log(user);
  }, [user]);
  return (
    <div className={styles.loginPage}>
      <div className={styles.background}>
        <div className={styles.telephoners} />
        <div className={styles.naglowekTele}>TELEPHONERS</div>
        <div className={styles.naglowek}>LOGOWANIE</div>
        <div className={styles.loginSquare}>
          <input
            placeholder="Login..."
            maxLength={50}
            onChange={(e) =>
              setUser((prevUser) => ({ ...prevUser, login: e.target.value }))
            }
            className={styles.inputLogin}
          />
          <input
            placeholder="Hasło..."
            type="password"
            onChange={(e) =>
              setUser((prevUser) => ({ ...prevUser, password: e.target.value }))
            }
            className={styles.inputLogin}
          />

          <button className={styles.przycisk} onClick={loginUser}>
            zaloguj
          </button>
          <div
            style={{
              height: "10px",
              color: "red",
              fontWeight: "bold",
              fontFamily: "Arial",
            }}
          >
            {errorMessage}
          </div>
          <div className={styles.linkiDolne}>
            <Link to="/password" className={styles.linkDolnyLogin}>
              Nie pamiętasz hasła?
            </Link>
            <Link to="/register1" className={styles.linkDolnyLogin}>
              Utwórz konto
              {/* {user.password} */}
            </Link>
          </div>
          {/* {clicker}
            <button onClick={()=>setClicker(clicker+1)}>clickme</button> */}
        </div>
        <Link to="/" className={styles.linkDolny}>
          Strona Główna
        </Link>
      </div>
    </div>
  );
}
