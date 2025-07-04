/**
 * Mapeo de IDs de secretarías a sus URLs de logos
 */

// Mapeo de IDs de secretarías a URLs de logos
const logoMapping = {
  // Seguridad Pública
  1: "https://cdn.hidalgo.gob.mx/gobierno/images/secretarias/Seguridad/Seguridad_vino_h.svg",

  // Procuraduría
  2: "https://cdn.hidalgo.gob.mx/gobierno/images/secretarias/Procuraduria/Procuraduria_vino_h.svg",
  
  // Contraloría
  3: "https://cdn.hidalgo.gob.mx/gobierno/images/secretarias/Contraloria/Contraloria_vino_h.svg",
  
  // Medio Ambiente
  4: "https://cdn.hidalgo.gob.mx/gobierno/images/secretarias/MedioAmbiente/MedioAmbiente_vino_h.svg",

  // Secretaría de Gobierno
  5: "https://cdn.hidalgo.gob.mx/gobierno/images/secretarias/Gobierno/Gobierno_vino_h.svg",

  // Secretaría de Movilidad
  6: "https://cdn.hidalgo.gob.mx/gobierno/images/secretarias/Movilidad/Movilidad_vino_h.svg",

  // Sistema de Transporte Convencional Hidalgo
  7: "https://cdn.hidalgo.gob.mx/gobierno/images/secretarias/default_logo.svg",

  // Sistema de Transporte Masivo Hidalgo
  8: "https://cdn.hidalgo.gob.mx/gobierno/images/secretarias/default_logo.svg",

  // Secretaría de Desarrollo Económico
  9: "https://cdn.hidalgo.gob.mx/gobierno/images/secretarias/Economia/Economia_vino_h.svg",

  // Secretaría de Infraestructura Pública y Desarrollo Urbano Sostenible
  10: "https://cdn.hidalgo.gob.mx/gobierno/images/secretarias/Infraestructura/Infraestructura_vino_h.svg",

  // Oficialía Mayor
  11: "https://cdn.hidalgo.gob.mx/gobierno/images/secretarias/OficialiaMayor/OficialiaMayor_vino_h.svg",

  // Secretaría de Agricultura
  12: "https://cdn.hidalgo.gob.mx/gobierno/images/secretarias/Campo/Campo_vino_h.svg",
};

/**
 * Obtiene la URL del logo de una secretaría por su ID
 * @param {number} secretariaId - ID de la secretaría
 * @returns {string|null} URL del logo o null si no existe
 */
export const getSecretariaLogo = (secretariaId) => {
  return logoMapping[secretariaId] || null;
};
