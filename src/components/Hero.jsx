// src/components/Hero.jsx
import React from "react";
import SelectorSecciones from "./SelectorSecciones";
import ParticlesBackground from "./ParticlesBackground";

export default function Hero() {
  return (
    <section className="relative py-16 px-6 bg-base-100 border-b overflow-hidden">
      {/* Partículas en fondo */}
      <ParticlesBackground />

      <div className="relative max-w-6xl mx-auto z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-primary">Transparencia</span> en la Transformación Digital
          </h1>
          <p className="text-xl text-base-content/80 max-w-3xl mx-auto">
            Seguimiento integral a la simplificación y digitalización de trámites en el estado de Hidalgo
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { value: "84", label: "Municipios" },
            { value: "100+", label: "Dependencias" },
            { value: "24/7", label: "Monitoreo" },
          ].map((item, index) => (
            <div
              key={index}
              className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="card-body text-center">
                <div className="text-5xl font-bold text-primary">{item.value}</div>
                <div className="text-xl">{item.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <SelectorSecciones />
        </div>
      </div>
    </section>
  );
}
