import { Link } from "react-router-dom";
import styles from "./landingPage.module.css";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  const handleClick1 = () => {
    navigate("/loginpage"); // Wstaw docelowy URL ścieżki
  };
  const handleClick2 = () => {
    navigate("/register1"); // Wstaw docelowy URL ścieżki
  };
  const handleClick3 = () => {
    window.location.href =
      "https://kolo.kt.agh.edu.pl/?fbclid=IwY2xjawEWHpVleHRuA2FlbQIxMAABHXNYE1PtuxtKkCDtd0L7Z-zqL3BvtbJRvIW1Zu2aXjiR2pd8o_ZiNa-i4Q_aem_vMgeOoYmtYuATat2l-Uy3A"; // Wstaw docelowy URL ścieżki
  };
  return (
    <div className={styles.landingPage}>
      <div className={styles.top}>
        <div style={{ textAlign: "center", marginRight: "20px" }}>
          <div className={styles.tytul}>WITAMY W SYSTEMIE</div>
          <div className={styles.tytul}>INWENTARYZACYJNYM</div>
        </div>
        <div className={styles.telephoners} />
      </div>

      {!localStorage.getItem("userToken") ? (
        <>
          <button className={styles.przycisk1} onClick={handleClick1}>
            Logowanie
          </button>
          <button
            className={styles.przycisk2}
            onClick={handleClick2}
            // style={{ marginTop: "10px", marginBottom: "10px" }}
          >
            Rejestracja
          </button>
        </>
      ) : null}

      {localStorage.getItem("userToken") ? (
        <>
          <Link
            style={{
              color: "white",
              textDecoration: "none",
              marginTop: "80px",
            }}
            to="/stanLabu"
          >
            <button
              className={styles.przycisk2}
              style={{ height: "120px", cursor: "pointer" }}
            >
              Lista Przedmiotów
            </button>
          </Link>
          <form onSubmit={() => localStorage.removeItem("userToken")}>
            <button
              type="submit"
              className={styles.przycisk2}
              style={{
                backgroundColor: "red",
                height: "120px",
                cursor: "pointer",
              }}
            >
              Wyloguj
            </button>
          </form>
        </>
      ) : null}
      <button
        className={styles.przycisk3}
        onClick={handleClick3}
        style={{ cursor: "pointer" }}
      >
        Strona Koła
      </button>
    </div>
  );
}
