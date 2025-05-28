import React, { useEffect, useState } from "react";
import Layout from "./components/Layout";
import Hero from "./components/Hero";


import ThemeToggle from "./components/ThemeToggle";
import "./app.css";  // Asegúrate que el nombre y ruta coincidan

export default function App() {

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "gob_estatal";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);


  return (
    <div>
      <Layout>
        <Hero />
      </Layout>
    </div>
  );
}