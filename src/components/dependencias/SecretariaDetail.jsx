import React from 'react';
import { FaClipboardCheck, FaTools, FaChartLine, FaSearch, FaArrowLeft, FaSignal } from 'react-icons/fa';
import TramiteCard from './TramiteCard';
import { getSecretariaLogo } from '../../utils/secretariaLogos';

const SecretariaDetail = ({ 
  secretaria, 
  tramites, 
  searchTerm, 
  setSearchTerm, 
  expandedTramites, 
  toggleTramiteExpanded, 
  onBack,
  colors,
  totalTramitesSecretaria // Total de trámites que tiene la secretaría (no solo los que están en proceso de simplificación)
}) => {
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

  // Calcular estadísticas a partir de los trámites
  const calcularEstadisticas = () => {
    // Verificar que tramites sea un array
    if (!Array.isArray(tramites)) {
      return {
        totalTramites: 0,
        tramitesEnProceso: 0,
        tramitesPublicados: 0,
        nivelDigitalizacionPromedio: 0,
        porcentajeAvance: 0,
        porcentajeTramitesEnProceso: 0,
        totalTramitesDisponibles: totalTramitesSecretaria || 0,
        porcentajeAvanceSimplificacion: 0
      };
    }
    
    const totalTramites = tramites.length;
    const tramitesPublicados = tramites.filter(t => t && t.publicado === true).length;
    const tramitesEnProceso = totalTramites - tramitesPublicados;
    
    // Calcular nivel de digitalización promedio
    let sumaDigitalizacion = 0;
    tramites.forEach(tramite => {
      if (tramite && tramite.nivel_digitalizacion) {
        // Asegurar que nivel_digitalizacion sea un número
        const nivelDigitalizacion = parseFloat(tramite.nivel_digitalizacion);
        if (!isNaN(nivelDigitalizacion)) {
          sumaDigitalizacion += nivelDigitalizacion;
        }
      }
    });
    const nivelDigitalizacionPromedio = totalTramites > 0 ? sumaDigitalizacion / totalTramites : 0;
    
    // Calcular porcentaje de avance con ponderación
    // Pasos 1-6 valen 0.5 cada uno, pasos 7-11 valen 1 cada uno
    // Total de puntos posibles por trámite: 6*0.5 + 5*1 = 3 + 5 = 8
    const puntosMaximosPorTramite = 8; // 3 puntos de los primeros 6 pasos + 5 puntos de los últimos 5 pasos
    const puntosMaximosTotales = tramites.length * puntosMaximosPorTramite;
    let puntosTotales = 0;
    
    tramites.forEach(tramite => {
      if (!tramite) return;
      
      // Pasos 1-6 (valor 0.5 cada uno)
      if (tramite.capacitacion_modulo1) puntosTotales += 0.5;
      if (tramite.boceto_modelado) puntosTotales += 0.5;
      if (tramite.bizagi_modelado) puntosTotales += 0.5;
      if (tramite.vo_bo_bizagi) puntosTotales += 0.5;
      if (tramite.capacitacion_modulo2) puntosTotales += 0.5;
      if (tramite.acciones_reingenieria) puntosTotales += 0.5;
      
      // Pasos 7-11 (valor 1 cada uno)
      if (tramite.vo_bo_acciones_reingenieria) puntosTotales += 1;
      if (tramite.capacitacion_modulo3) puntosTotales += 1;
      if (tramite.boceto_acuerdo) puntosTotales += 1;
      if (tramite.vo_bo_acuerdo) puntosTotales += 1;
      if (tramite.publicado) puntosTotales += 1;
    });
    
    const porcentajeAvance = puntosMaximosTotales > 0 ? (puntosTotales / puntosMaximosTotales) * 100 : 0;
    
    // Calcular el porcentaje de trámites en proceso respecto al total de trámites de la secretaría
    const totalTramitesDisponibles = totalTramitesSecretaria || totalTramites;
    const porcentajeTramitesEnProceso = totalTramitesDisponibles > 0 ? (totalTramites / totalTramitesDisponibles) * 100 : 0;
    
    // Calcular el porcentaje de avance de simplificación
    // Este porcentaje considera el avance individual de cada trámite y cuántos están en proceso
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
      // Por ejemplo, si hay 8 trámites totales pero solo 4 están en proceso con 50% de avance cada uno,
      // el porcentaje total sería (4 * 50%) / 8 = 25%
      porcentajeAvanceSimplificacion = sumaAvancesIndividuales / totalTramitesDisponibles;
    }
    
    return {
      totalTramites,
      tramitesEnProceso,
      tramitesPublicados,
      nivelDigitalizacionPromedio,
      porcentajeAvance,
      porcentajeTramitesEnProceso,
      totalTramitesDisponibles,
      porcentajeAvanceSimplificacion
    };
  };
  
  // Calcular estadísticas
  const estadisticas = calcularEstadisticas();
  
  // Filtrar trámites por término de búsqueda
  const tramitesFiltrados = Array.isArray(tramites) ? tramites.filter(tramite => 
    tramite && tramite.tramite && tramite.tramite.toLowerCase().includes((searchTerm || '').toLowerCase())
  ) : [];

  const cardColors = colors || getSecretariaColors(secretaria?.id || 0);
  const initials = getSecretariaInitials(secretaria?.nombre || '');
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack}
          className="p-2 mr-3 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Volver"
        >
          <FaArrowLeft className="text-lg" />
        </button>
        <div className="flex items-center">
          {secretaria?.id && getSecretariaLogo(secretaria.id) ? (
            <img 
              src={getSecretariaLogo(secretaria.id)} 
              alt={`Logo de ${secretaria.nombre}`} 
              className="h-16" 
            />
          ) : (
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${cardColors.bg} ${cardColors.text}`}>
              {initials}
            </div>
          )}
        </div>
      </div>
      
      {/* Estadísticas de la secretaría - Diseño mejorado y compacto */}
      <div className="mb-4">
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-xl shadow-sm">
          <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center">
            <span className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-1.5 rounded-lg mr-2">
              <FaChartLine className="text-lg" />
            </span>
            Estadísticas de Simplificación
          </h3>
          
          {/* KPI Principal - Porcentaje de avance de simplificación */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-3 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Porcentaje de avance de simplificación</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-bold text-green-600">{Math.round(estadisticas.porcentajeAvanceSimplificacion)}%</p>
                  <p className="text-xs text-gray-500 ml-2">
                    {estadisticas.totalTramites} en proceso de {estadisticas.totalTramitesDisponibles} totales
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center bg-green-100 p-3 rounded-full h-12 w-12">
                <FaChartLine className="text-green-500 text-xl" />
              </div>
            </div>
            
            <div className="mt-2">
              <div className="relative">
                <div className="flex mb-1 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-0.5 px-2 uppercase rounded-full text-green-600 bg-green-100">
                      Progreso
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block py-0.5 px-2 uppercase rounded-full text-green-600 bg-green-100">
                      {Math.round(estadisticas.porcentajeAvanceSimplificacion)}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-1 text-xs flex rounded-full bg-green-100">
                  <div 
                    style={{ width: `${Math.round(estadisticas.porcentajeAvanceSimplificacion)}%` }} 
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-green-400 to-green-600">
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* KPIs Secundarios en fila horizontal */}
          <div className="grid grid-cols-2 gap-3">
            {/* Trámites en proceso de Simplificación */}
            <div className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">Trámites en proceso</p>
                  <div className="flex items-baseline">
                    <p className="text-xl font-bold text-blue-600">{estadisticas.totalTramites}</p>
                    <p className="text-xs text-gray-500 ml-1">/ {estadisticas.totalTramitesDisponibles}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center bg-blue-100 p-2 rounded-full h-10 w-10">
                  <FaClipboardCheck className="text-blue-500 text-sm" />
                </div>
              </div>
              
              <div className="mt-1">
                <div className="overflow-hidden h-1.5 text-xs flex rounded-full bg-blue-100">
                  <div 
                    style={{ width: `${estadisticas.porcentajeTramitesEnProceso}%` }} 
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-400 to-blue-600">
                  </div>
                </div>
                <div className="flex justify-end mt-0.5">
                  <span className="text-xs text-blue-600">{Math.round(estadisticas.porcentajeTramitesEnProceso)}%</span>
                </div>
              </div>
            </div>
            
            {/* Nivel de Digitalización */}
            <div className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-amber-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">Nivel de Digitalización</p>
                  <div className="flex items-baseline">
                    <p className="text-xl font-bold text-amber-600">{estadisticas.nivelDigitalizacionPromedio.toFixed(1)}</p>
                    <p className="text-xs text-gray-500 ml-1">/4.0</p>
                  </div>
                </div>
                <div className="flex items-center justify-center bg-amber-100 p-2 rounded-full h-10 w-10">
                  <FaSignal className="text-amber-500 text-sm" />
                </div>
              </div>
              
              <div className="mt-1">
                <div className="flex justify-between gap-1">
                  {[1, 2, 3, 4].map((nivel) => (
                    <div key={nivel} className="flex-1">
                      <div 
                        className={`w-full h-1.5 rounded-full ${nivel <= Math.round(estadisticas.nivelDigitalizacionPromedio) 
                          ? 'bg-amber-500' 
                          : nivel <= Math.ceil(estadisticas.nivelDigitalizacionPromedio) && nivel > Math.floor(estadisticas.nivelDigitalizacionPromedio) 
                            ? 'bg-amber-300' 
                            : 'bg-gray-200'}`}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Buscador de trámites */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Buscar trámite..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
        </div>
      </div>
      
      {/* Trámites en formato grid */}
      {tramitesFiltrados.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-yellow-700">No se encontraron trámites que coincidan con los criterios de búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
          {tramitesFiltrados.map(tramite => (
            <TramiteCard 
              key={tramite.id}
              tramite={tramite}
              isExpanded={expandedTramites && expandedTramites[tramite.id] || false}
              toggleExpand={() => toggleTramiteExpanded(tramite.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SecretariaDetail;
