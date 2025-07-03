import React from 'react';
import { getSecretariaLogo } from '../../utils/secretariaLogos';

const SecretariaCard = ({ secretaria, tramites, onClick, colors }) => {
  // Obtener los colores para el logo de la secretaría (placeholder)
  const getSecretariaColors = (secretariaId) => {
    // Colores predefinidos para las secretarías
    const colors = [
      { bg: 'bg-blue-500', text: 'text-white' },
      { bg: 'bg-green-500', text: 'text-white' },
      { bg: 'bg-purple-500', text: 'text-white' },
      { bg: 'bg-yellow-500', text: 'text-white' },
      { bg: 'bg-red-500', text: 'text-white' },
      { bg: 'bg-indigo-500', text: 'text-white' },
      { bg: 'bg-pink-500', text: 'text-white' },
      { bg: 'bg-teal-500', text: 'text-white' },
    ];
    
    // Asignar un color basado en el ID de la secretaría
    return colors[secretariaId % colors.length];
  };

  // Obtener iniciales de la secretaría para el logo
  const getSecretariaInitials = (nombre) => {
    if (!nombre) return 'N/A';
    
    const palabras = nombre.split(' ');
    if (palabras.length === 1) {
      return palabras[0].substring(0, 2).toUpperCase();
    }
    
    // Tomar la primera letra de las dos primeras palabras significativas
    const palabrasSignificativas = palabras.filter(p => 
      p.length > 3 && !['de', 'la', 'los', 'las', 'del', 'y', 'e', 'o'].includes(p.toLowerCase())
    );
    
    if (palabrasSignificativas.length >= 2) {
      return (palabrasSignificativas[0][0] + palabrasSignificativas[1][0]).toUpperCase();
    } else if (palabrasSignificativas.length === 1) {
      return palabrasSignificativas[0].substring(0, 2).toUpperCase();
    } else {
      // Si no hay palabras significativas, usar las dos primeras letras
      return palabras[0].substring(0, 2).toUpperCase();
    }
  };

  // Usar colores pasados como prop o generar colores por defecto
  const cardColors = colors || getSecretariaColors(secretaria?.id || 0);
  const initials = getSecretariaInitials(secretaria?.nombre || '');
  
  // Calcular estadísticas a partir de los trámites
  const calcularEstadisticas = () => {
    // Verificar que tramites sea un array
    if (!Array.isArray(tramites)) {
      return {
        totalTramites: 0,
        porcentajeAvanceSimplificacion: 0,
        nivelDigitalizacionPromedio: 0
      };
    }
    
    const totalTramites = tramites.length;
    const totalTramitesDisponibles = totalTramites; // En SecretariaDetail hay una prop totalTramitesSecretaria
    
    // Calcular nivel de digitalización promedio
    let sumaDigitalizacion = 0;
    tramites.forEach(tramite => {
      if (tramite && typeof tramite.nivel_digitalizacion === 'number') {
        sumaDigitalizacion += tramite.nivel_digitalizacion;
      }
    });
    const nivelDigitalizacionPromedio = totalTramites > 0 ? sumaDigitalizacion / totalTramites : 0;
    
    // Calcular el porcentaje de avance de simplificación exactamente como en SecretariaDetail
    let porcentajeAvanceSimplificacion = 0;
    
    if (totalTramitesDisponibles > 0) {
      // Calcular el avance individual de cada trámite basado en los pasos completados
      const avancesPorTramite = tramites.map(tramite => {
        if (!tramite) return 0;
        
        // Contar puntos acumulados para este trámite
        let puntosTramite = 0;
        
        // Pasos 1-6 (valor 0.5 cada uno)
        if (tramite.capacitacion_modulo1) puntosTramite += 0.5;
        if (tramite.boceto_modelado) puntosTramite += 0.5;
        if (tramite.bizagi_modelado) puntosTramite += 0.5;
        if (tramite.vo_bo_bizagi) puntosTramite += 0.5;
        if (tramite.capacitacion_modulo2) puntosTramite += 0.5;
        if (tramite.acciones_reingenieria) puntosTramite += 0.5;
        
        // Pasos 7-11 (valor 1 cada uno)
        if (tramite.vo_bo_acciones_reingenieria) puntosTramite += 1;
        if (tramite.capacitacion_modulo3) puntosTramite += 1;
        if (tramite.boceto_acuerdo) puntosTramite += 1;
        if (tramite.vo_bo_acuerdo) puntosTramite += 1;
        if (tramite.publicado) puntosTramite += 1;
        
        // Calcular porcentaje de avance para este trámite (sobre 8 puntos posibles)
        return (puntosTramite / 8) * 100;
      });
      
      // Calcular la suma de todos los avances individuales
      const sumaAvancesIndividuales = avancesPorTramite.reduce((sum, avance) => sum + avance, 0);
      
      // Para el porcentaje total, consideramos el avance de todos los trámites disponibles
      porcentajeAvanceSimplificacion = sumaAvancesIndividuales / totalTramitesDisponibles;
    }
    
    return {
      totalTramites,
      porcentajeAvanceSimplificacion,
      nivelDigitalizacionPromedio
    };
  };
  
  const estadisticas = calcularEstadisticas();
  
  // Asegurarse de que cardColors existe y tiene la propiedad bg
  const defaultColor = '#047857'; // Color verde por defecto
  const borderColor = colors && colors.primary ? colors.primary : defaultColor;
  const bgColor = colors && colors.lightBackground ? colors.lightBackground : '#f9fafb';
  
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105"
      onClick={onClick}
    >
      <div className="p-6 flex flex-col justify-center items-center bg-gradient-to-br from-gray-50 to-gray-100 border-b-4" style={{ borderColor }}>
        {getSecretariaLogo(secretaria?.id) ? (
          <img 
            src={getSecretariaLogo(secretaria?.id)} 
            alt={secretaria?.nombre || 'Logo de la secretaría'} 
            className="h-24 object-contain mb-3" 
          />
        ) : (
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mb-3 shadow-md" style={{ backgroundColor: borderColor, color: 'white' }}>
            {initials}
          </div>
        )}
        <h3 className="text-center font-medium text-gray-700 text-sm mt-2 line-clamp-2">{secretaria?.nombre}</h3>
      </div>
    </div>
  );
};

export default SecretariaCard;
