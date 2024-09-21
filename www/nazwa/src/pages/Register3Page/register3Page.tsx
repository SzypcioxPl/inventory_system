import { Link } from "react-router-dom";
import styles from "./register3Page.module.css";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';

export default function register3Page() {
  // const [clicker,setClicker] = useState<number>(0);
  const [user, setUser] = useState({ mail: "" });


let navigate = useNavigate();
const handleClick = () => {
  navigate('/register3'); // Wstaw docelowy URL ścieżki
};
  return (
    <div className={styles.loginPage}>
      <div className={styles.background}>
        <div className={styles.naglowek}>REJESTRACJA</div>
        <div className={styles.loginSquare}>
          <div className={styles.info}>
            Dziękujemy za wypełnienie wniosku o rejestrację, zostanie ona rozpatrzona przez administratora
          </div>
          
        </div>
        <Link to="/" className={styles.linkDolny}>
          Strona Główna
        </Link>
      </div>
    </div>
  );
}
