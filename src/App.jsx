import React, { useEffect } from "react";
import Layout from "./components/Layout";
import Hero from "./components/Hero";
import MunicipiosSection from "./components/municipios/MunicipiosSection";
import ThemeToggle from "./components/ThemeToggle";
import "./app.css";  

export default function App() {

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "gob_estatal";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);


  return (
    <div>
      <Layout>
        <Hero />
        <MunicipiosSection />
      </Layout>
    </div>
  );
}