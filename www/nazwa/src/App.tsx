import "./App.css";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage/landingPage";
import LoginPage from "./pages/LoginPage/loginPage";
import Register1Page from "./pages/Register1Page/register1Page";
import Register2Page from "./pages/Register2Page/register2Page";
import Register3Page from "./pages/Register3Page/register3Page";
import PasswordPage from "./pages/PasswordPage/passwordPage";
import PasswordmsgPage from "./pages/PasswordmsgPage/passwordmsg";
import InvList from "./pages/InvList/invList";
import StanLabu from "./pages/stanLabu/stanLabu";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/loginPage" element={<LoginPage />} />
        <Route path="/register1" element={<Register1Page />} />
        <Route path="/register2" element={<Register2Page />} />
        <Route path="/register3" element={<Register3Page />} />
        <Route path="/password" element={<PasswordPage />} />
        <Route path="/passwordmsg" element={<PasswordmsgPage />} />
        <Route path="/invlist" element={<InvList />} />
        <Route path="/stanLabu" element={<StanLabu />} />
      </Routes>
    </div>
  );
}

export default App;
