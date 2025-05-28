// src/components/ParticlesBackground.jsx
import React from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { useCallback } from "react";

export default function ParticlesBackground() {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesOptions = {
    fullScreen: { enable: false }, // importante para que no ocupe toda la pantalla, solo el contenedor
    fpsLimit: 60,
    particles: {
      number: {
        value: 100,
        density: { enable: true, area: 1000 },
      },
      color: { value: "#9f2241" }, // color primary
      shape: { type: "circle" },
      opacity: { value: 0.3 },
      size: { value: { min: 2, max: 4 } },
      move: {
        enable: true,
        speed: 0.3,
        direction: "none",
        outMode: "bounce",
      },
      links: {
        enable: true,
        distance: 180,
        color: "#9f2241",
        opacity: 0.2,
        width: 1,
      },
    },
    interactivity: {
      events: {
        onHover: { enable: true, mode: "repulse" },
        onClick: { enable: true, mode: "push" },
      },
      modes: {
        repulse: { distance: 50 },
        push: { quantity: 4 },
      },
    },
    detectRetina: true,
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={particlesOptions}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
    />
  );
}
