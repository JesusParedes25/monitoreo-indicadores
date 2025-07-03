/**
 * Mapeo de IDs de secretarías a sus URLs de logos
 */

// Mapeo de IDs de secretarías a URLs de logos
const logoMapping = {
  // Procuraduría
  2: "https://cdn.hidalgo.gob.mx/gobierno/images/secretarias/Procuraduria/Procuraduria_vino_h.svg",
  
  // Contraloría
  3: "https://cdn.hidalgo.gob.mx/gobierno/images/secretarias/Contraloria/Contraloria_vino_h.svg",
  
  // Medio Ambiente
  4: "https://cdn.hidalgo.gob.mx/gobierno/images/secretarias/MedioAmbiente/MedioAmbiente_vino_h.svg",
  
  // Seguridad Pública
  1: "https://cdn.hidalgo.gob.mx/gobierno/images/secretarias/Seguridad/Seguridad_vino_h.svg",
};

/**
 * Obtiene la URL del logo de una secretaría por su ID
 * @param {number} secretariaId - ID de la secretaría
 * @returns {string|null} URL del logo o null si no existe
 */
export const getSecretariaLogo = (secretariaId) => {
  return logoMapping[secretariaId] || null;
};
