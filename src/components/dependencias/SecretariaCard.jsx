import React from 'react';

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
        tramitesPublicados: 0,
        porcentajeAvance: 0
      };
    }
    
    const totalTramites = tramites.length;
    const tramitesPublicados = tramites.filter(t => t && t.publicado === true).length;
    
    // Calcular porcentaje de avance
    // Contar pasos completados en todos los trámites
    const totalPasos = tramites.length * 11; // 11 pasos por trámite
    let pasosCompletados = 0;
    
    tramites.forEach(tramite => {
      if (!tramite) return;
      
      if (tramite.diagnostico) pasosCompletados++;
      if (tramite.analisis_simplificacion) pasosCompletados++;
      if (tramite.rediseno_propuesta) pasosCompletados++;
      if (tramite.implementacion_simplificacion) pasosCompletados++;
      if (tramite.difusion) pasosCompletados++;
      if (tramite.interoperabilidad && tramite.expediente_digital) pasosCompletados++; // Paso 6 y 7 juntos
      if (tramite.capacitacion) pasosCompletados++;
      if (tramite.liberacion) pasosCompletados++;
      if (tramite.sistematizacion) pasosCompletados++;
      if (tramite.publicado) pasosCompletados++;
    });
    
    const porcentajeAvance = totalPasos > 0 ? (pasosCompletados / totalPasos) * 100 : 0;
    
    return {
      totalTramites,
      tramitesPublicados,
      porcentajeAvance
    };
  };
  
  const estadisticas = calcularEstadisticas();
  
  return (
    <div 
      className="cursor-pointer rounded-lg shadow-md overflow-hidden transition-all duration-300 transform hover:shadow-lg hover:scale-105"
      onClick={onClick}
    >
      <div className={`p-6 flex flex-col items-center ${cardColors.bg}`}>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${cardColors.text} mb-2`}>
          {initials}
        </div>
        <h3 className={`text-center font-bold ${cardColors.text} text-sm`}>
          {secretaria && secretaria.nombre ? 
            (secretaria.nombre.length > 30 ? secretaria.nombre.substring(0, 30) + '...' : secretaria.nombre) : 
            'Sin nombre'}
        </h3>
      </div>
      <div className="bg-white p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">Trámites:</span>
          <span className="text-sm font-bold">{estadisticas.totalTramites}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">Publicados:</span>
          <span className="text-sm font-bold text-green-600">{estadisticas.tramitesPublicados}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ width: `${estadisticas.porcentajeAvance}%` }}
          ></div>
        </div>
        <div className="text-xs text-right text-gray-500">
          {Math.round(estadisticas.porcentajeAvance)}% completado
        </div>
      </div>
    </div>
  );
};

export default SecretariaCard;
