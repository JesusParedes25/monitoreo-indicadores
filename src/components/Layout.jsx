// src/components/Layout.jsx
import React from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      {/* Navbar */}
      <header className="navbar bg-primary text-primary-content px-8">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost normal-case text-xl">Monitoreo Hidalgo</Link>
        </div>
        <div className="flex-none gap-2 items-center flex">
          <Link to="/municipios" className="btn btn-ghost btn-sm">
            Municipios
          </Link>
          <Link to="/dependencias" className="btn btn-ghost btn-sm">
            Dependencias
          </Link>
          <Link to="/contacto" className="btn btn-ghost btn-sm">
            Contacto
          </Link>
          {/* Botón toggle modo oscuro */}
          <ThemeToggle />
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="footer footer-center p-6 bg-primary text-primary-content">
        <p>© 2025 Gobierno del Estado de Hidalgo - Todos los derechos reservados</p>
      </footer>
    </div>
  );
}
