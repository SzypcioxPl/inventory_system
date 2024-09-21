import { Link } from "react-router-dom";
import styles from "./register1Page.module.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [user, setUser] = useState({ mail: "" });

  const navigate = useNavigate();
  const handleClick = () => {
    sessionStorage.setItem("email", user.mail);
    navigate("/register2"); // Wstaw docelowy URL ścieżki
  };
  return (
    <div className={styles.loginPage}>
      <div className={styles.background}>
        <div className={styles.naglowek}>REJESTRACJA</div>
        <div className={styles.loginSquare}>
          <div className={styles.info}>
            Aby dokonać rejestracji, podaj swój email
          </div>
          <input
            placeholder="email@student.agh.edu.pl"
            maxLength={45}
            onChange={(e) =>
              setUser((prevUser) => ({ ...prevUser, mail: e.target.value }))
            }
            className={styles.inputLogin}
          />

          <button className={styles.przycisk} onClick={handleClick}>
            Kontynuuj
          </button>
          <div className={styles.linkiDolne}>
            <Link to="/loginPage" className={styles.linkDolnyLogin}>
              Logowanie
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
