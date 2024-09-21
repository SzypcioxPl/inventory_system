import { Link } from "react-router-dom";
import styles from "./invList.module.css";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';

export default function InvList() {
  let navigate = useNavigate();
  const handleClick1 = () => {
    navigate('/loginPage'); // Wstaw docelowy URL ścieżki
  };
  const handleClick2 = () => {
    navigate('/register1'); // Wstaw docelowy URL ścieżki
  };
  const handleClick3 = () => {
    window.location.href = 'https://kolo.kt.agh.edu.pl/?fbclid=IwY2xjawEWHpVleHRuA2FlbQIxMAABHXNYE1PtuxtKkCDtd0L7Z-zqL3BvtbJRvIW1Zu2aXjiR2pd8o_ZiNa-i4Q_aem_vMgeOoYmtYuATat2l-Uy3A'; // Wstaw docelowy URL ścieżki  
    };
  return (
    <div className={styles.landingPage}>
      <div className={styles.top}>
        <div style={{textAlign: "center", marginRight:'20px'}}>
          <div className={styles.tytul}>WITAMY W SYSTEMIE</div>
          <div className={styles.tytul}>INWENTARYZACYJNYM</div>
        </div>
        <div className={styles.telephoners} />
      </div>
      <button className={styles.przycisk1} onClick={handleClick1}>Logowanie</button>
      <button className={styles.przycisk2} onClick={handleClick2}>Rejestracja</button>
      <button className={styles.przycisk3} onClick={handleClick3}>Strona Koła</button>
    </div>
  );
}
