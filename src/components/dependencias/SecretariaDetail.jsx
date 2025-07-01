import React from 'react';
import { FaClipboardCheck, FaTools, FaChartLine, FaSearch, FaArrowLeft } from 'react-icons/fa';
import TramiteCard from './TramiteCard';

const SecretariaDetail = ({ 
  secretaria, 
  tramites, 
  searchTerm, 
  setSearchTerm, 
  expandedTramites, 
  toggleTramiteExpanded, 
  onBack,
  colors
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
        porcentajeAvance: 0
      };
    }
    
    const totalTramites = tramites.length;
    const tramitesPublicados = tramites.filter(t => t && t.publicado === true).length;
    const tramitesEnProceso = totalTramites - tramitesPublicados;
    
    // Calcular nivel de digitalización promedio
    let sumaDigitalizacion = 0;
    tramites.forEach(tramite => {
      if (tramite && typeof tramite.nivel_digitalizacion === 'number') {
        sumaDigitalizacion += tramite.nivel_digitalizacion;
      }
    });
    const nivelDigitalizacionPromedio = totalTramites > 0 ? sumaDigitalizacion / totalTramites : 0;
    
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
      tramitesEnProceso,
      tramitesPublicados,
      nivelDigitalizacionPromedio,
      porcentajeAvance
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
          className="mr-4 bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-full transition-colors"
          onClick={onBack}
        >
          <FaArrowLeft className="text-lg" />
        </button>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${cardColors.bg} ${cardColors.text} mr-4`}>
          {initials}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{secretaria?.nombre || 'Sin nombre'}</h2>
          <p className="text-sm text-gray-500">Secretaría ID: {secretaria?.id || 'N/A'}</p>
        </div>
      </div>
      
      {/* Estadísticas de la secretaría */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total de Trámites</p>
              <p className="text-2xl font-bold text-blue-900">{estadisticas.totalTramites}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaClipboardCheck className="text-blue-500 text-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700">Trámites en Proceso</p>
              <p className="text-2xl font-bold text-orange-900">{estadisticas.tramitesEnProceso}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <FaTools className="text-orange-500 text-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700">Nivel Digitalización</p>
              <p className="text-2xl font-bold text-yellow-900">
                {estadisticas.nivelDigitalizacionPromedio.toFixed(1)}
                <span className="text-sm font-normal text-yellow-600 ml-1">/4.0</span>
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <FaChartLine className="text-yellow-500 text-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Avance General</p>
              <p className="text-2xl font-bold text-purple-900">
                {Math.round(estadisticas.porcentajeAvance)}%
              </p>
            </div>
            <div className="w-full max-w-24">
              <div className="w-full bg-purple-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${estadisticas.porcentajeAvance}%` }}
                ></div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
