import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ThemeToggle from "./components/ThemeToggle";
import HomePage from "./pages/HomePage";
import MunicipiosPage from "./pages/MunicipiosPage";
import DependenciasPage from "./pages/DependenciasPage";
import ContactoPage from "./pages/ContactoPage";
import "./app.css";  

export default function App() {

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "gob_estatal";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);


  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/municipios" element={<MunicipiosPage />} />
          <Route path="/dependencias" element={<DependenciasPage />} />
          <Route path="/contacto" element={<ContactoPage />} />
        </Routes>
      </div>
    </Router>
  );
}