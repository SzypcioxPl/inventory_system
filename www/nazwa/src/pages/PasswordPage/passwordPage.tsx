import { Link } from "react-router-dom";
import styles from "./passwordPage.module.css";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  // const [clicker,setClicker] = useState<number>(0);
  const [user, setUser] = useState({ mail: "" });


  const Home = () => {
    

    // const handleClick = () => {
    //     navigate('/about'); // Wstaw docelowy URL ścieżki
    // };

    // return (
    //     <div>
    //         <button onClick={handleClick}>Przejdź do strony</button>
    //     </div>
    // );
};
let navigate = useNavigate();
const handleClick = () => {
  navigate('/passwordmsg'); // Wstaw docelowy URL ścieżki
};
  return (
    <div className={styles.loginPage}>
      <div className={styles.background}>
        <div className={styles.naglowek}>RESETOWANIE HASŁA</div>
        <div className={styles.loginSquare}>
          <div className={styles.info}>
            Aby przejść dalej, podaj swój email
          </div>
          <input
            placeholder="email@student.agh.edu.pl"
            maxLength={45}
            onChange={(e) =>
              setUser((prevUser) => ({ ...prevUser, mail: e.target.value }))
            }
            className={styles.inputLogin}
          />

          <button className={styles.przycisk} onClick={handleClick}>Kontynuuj</button>
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
