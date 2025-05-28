// src/components/SelectorSecciones.jsx
import React from "react";
import { ArrowRightIcon } from "@heroicons/react/24/solid";

export default function SelectorSecciones() {
  return (
    <section className="w-full py-12 px-6">
      <div className="max-w-7xl mx-auto flex gap-12 justify-center bg-white/30 rounded-lg p-6">
        {/* Card Municipios */}
        <a
          href="#municipios"
          className="relative flex-shrink-0 snap-start w-[480px] rounded-lg shadow-lg overflow-hidden cursor-pointer group transition-transform hover:scale-[1.0] bg-primary"
          aria-label="Ir a sección Municipios"
        >
          <img
            src="https://images.unsplash.com/photo-1587400873582-230980eb46eb?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Vista panorámica de municipios"
            className="absolute inset-0 w-full h-full object-cover brightness-50 transition-transform group-hover:scale-105"
            loading="lazy"
          />
          <div className="relative p-10 flex flex-col h-full justify-center text-primary-content">
            <h2 className="text-4xl font-semibold mb-4 drop-shadow-md">
              Municipios
            </h2>
            <p className="text-lg leading-relaxed mb-6 drop-shadow-md">
              Consulta el avance en simplificación y digitalización en los 84 municipios de Hidalgo.
            </p>
            <div className="inline-flex items-center gap-2 text-lg font-medium underline underline-offset-4 drop-shadow-md">
              Entrar
              <ArrowRightIcon className="w-5 h-5" />
            </div>
          </div>
        </a>

        {/* Card Dependencias */}
        <a
          href="#dependencias"
          className="relative flex-shrink-0 snap-start w-[480px] rounded-lg shadow-lg overflow-hidden cursor-pointer group transition-transform hover:scale-[1.0] bg-secondary"
          aria-label="Ir a sección Dependencias"
        >
          <img
            src="https://www.eluniversalhidalgo.com.mx/resizer/v2/E6RMZWOAPJFYXLYHCCVQOLWDMY.jpg?auth=6c1bfcf8b38bcc903ad4e86b4be9760606732406e1b2e24267fc7ce566490d86&smart=true&width=1100&height=666"
            alt="Edificio institucional"
            className="absolute inset-0 w-full h-full object-cover brightness-50 transition-transform group-hover:scale-105"
            loading="lazy"
          />
          <div className="relative p-10 flex flex-col h-full justify-center text-secondary-content">
            <h2 className="text-4xl font-semibold mb-4 drop-shadow-md">
              Dependencias estatales
            </h2>
            <p className="text-lg leading-relaxed mb-6 drop-shadow-md">
              Visualiza el progreso y estado de digitalización por secretaría y dependencia estatal.
            </p>
            <div className="inline-flex items-center gap-2 text-lg font-medium underline underline-offset-4 drop-shadow-md">
              Entrar
              <ArrowRightIcon className="w-5 h-5" />
            </div>
          </div>
        </a>
      </div>
    </section>
  );
}
