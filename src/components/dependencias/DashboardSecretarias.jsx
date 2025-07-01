import React, { useState, useEffect } from 'react';
import { FaSearch, FaBuilding, FaTools, FaChartLine, FaClipboardCheck, FaFileAlt, FaSignal, FaProjectDiagram } from 'react-icons/fa';
import axios from 'axios';
import TramiteCard from './TramiteCard';
import SecretariaCard from './SecretariaCard';
import SecretariaDetail from './SecretariaDetail';
import DashboardCharts from './DashboardCharts';
import { COLORS } from '../../styles/colors';

const DashboardSecretarias = () => {
  const [tramites, setTramites] = useState([]);
  const [secretarias, setSecretarias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSecretaria, setSelectedSecretaria] = useState(null);
  const [expandedTramites, setExpandedTramites] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  
  // Constante para el total estatal de trámites
  const TOTAL_TRAMITES_ESTATALES = 900;

  // Cargar datos de trámites y secretarías
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Obtener secretarías
        const resSecretarias = await axios.get('/api/secretarias');
        
        // Obtener trámites
        const resTramites = await axios.get('/api/tramites');
        
        // Asegurar que los datos sean arrays
        const secretariasData = Array.isArray(resSecretarias.data) ? resSecretarias.data : [];
        const tramitesData = Array.isArray(resTramites.data) ? resTramites.data : [];
        
        console.log('Datos de secretarías:', secretariasData);
        console.log('Datos de trámites:', tramitesData);
        
        setSecretarias(secretariasData);
        setTramites(tramitesData);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos. Por favor, intente nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Expandir/colapsar un trámite
  const toggleTramiteExpanded = (tramiteId) => {
    setExpandedTramites(prev => ({
      ...prev,
      [tramiteId]: !prev[tramiteId]
    }));
  };

  // Calcular estadísticas generales
  const calcularEstadisticasGenerales = () => {
    // Verificar que tramites sea un array
    if (!Array.isArray(tramites) || isLoading || error || tramites.length === 0) {
      return {
        totalTramites: 0,
        tramitesEnProceso: 0,
        secretariasActivas: 0,
        nivelDigitalizacionPromedio: 0
      };
    }

    const tramitesPublicados = tramites.filter(t => t && t.publicado === true).length;
    const tramitesEnProceso = tramites.length - tramitesPublicados;
    
    // Contar secretarías únicas con trámites
    const secretariasUnicas = new Set(tramites.filter(t => t && t.secretaria_id).map(t => t.secretaria_id));
    
    // Calcular promedio de nivel de digitalización
    const nivelesDigitalizacion = tramites
      .filter(t => t && t.nivel_digitalizacion)
      .map(t => parseFloat(t.nivel_digitalizacion))
      .filter(nivel => !isNaN(nivel));
    
    const sumaDigitalizacion = nivelesDigitalizacion.length > 0 ?
      nivelesDigitalizacion.reduce((sum, nivel) => sum + nivel, 0) : 0;
    const promedioDigitalizacion = nivelesDigitalizacion.length > 0 ? 
      sumaDigitalizacion / nivelesDigitalizacion.length : 0;
    
    return {
      totalTramites: tramites.length,
      tramitesEnProceso,
      secretariasActivas: secretariasUnicas.size,
      nivelDigitalizacionPromedio: promedioDigitalizacion
    };
  };

  // Calcular estadísticas por secretaría
  const calcularEstadisticasSecretaria = (secretariaId) => {
    // Verificar que tramites sea un array
    if (!Array.isArray(tramites)) {
      return {
        totalTramites: 0,
        tramitesEnProceso: 0,
        nivelDigitalizacionPromedio: 0,
        porcentajeAvance: 0
      };
    }
    
    const tramitesSecretaria = tramites.filter(t => t && t.secretaria_id === secretariaId);
    
    if (tramitesSecretaria.length === 0) {
      return {
        totalTramites: 0,
        tramitesEnProceso: 0,
        nivelDigitalizacionPromedio: 0,
        porcentajeAvance: 0
      };
    }
    
    const tramitesPublicados = tramitesSecretaria.filter(t => t.publicado === true).length;
    const tramitesEnProceso = tramitesSecretaria.length - tramitesPublicados;
    
    // Calcular promedio de nivel de digitalización
    const nivelesDigitalizacion = tramitesSecretaria
      .map(t => parseFloat(t.nivel_digitalizacion))
      .filter(nivel => !isNaN(nivel));
    
    const sumaDigitalizacion = nivelesDigitalizacion.reduce((sum, nivel) => sum + nivel, 0);
    const promedioDigitalizacion = nivelesDigitalizacion.length > 0 ? 
      sumaDigitalizacion / nivelesDigitalizacion.length : 0;
    
    // Calcular porcentaje de avance
    // Contar pasos completados en todos los trámites
    const totalPasos = tramitesSecretaria.length * 11; // 11 pasos por trámite
    let pasosCompletados = 0;
    
    tramitesSecretaria.forEach(tramite => {
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
      totalTramites: tramitesSecretaria.length,
      tramitesEnProceso,
      nivelDigitalizacionPromedio: promedioDigitalizacion,
      porcentajeAvance
    };
  };

  // Obtener estadísticas generales
  const estadisticasGenerales = calcularEstadisticasGenerales();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4" style={{ color: COLORS.primaryDark }}>Dashboard de Simplificación de Trámites</h1>
      
      {/* Tarjetas de resumen con visualizaciones - Forzar 2 KPIs por fila */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Tarjeta: Total de Trámites */}
          <div className="rounded-lg shadow-sm" style={{ backgroundColor: COLORS.white, border: `1px solid ${COLORS.mediumGray}` }}>
            <div className="p-3">
              <div className="flex items-center mb-2">
                <div className="rounded-full p-2 mr-3" style={{ backgroundColor: COLORS.primary }}>
                  <FaFileAlt className="text-white text-lg" />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: COLORS.darkGray }}>Total de Trámites</p>
                  <div className="flex items-baseline">
                    <p className="text-xl font-bold" style={{ color: COLORS.primaryDark }}>{estadisticasGenerales.totalTramites}</p>
                    <p className="text-xs ml-1" style={{ color: COLORS.darkGray }}>/900</p>
                  </div>
                </div>
              </div>
              {/* Barra de progreso */}
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full" 
                  style={{ 
                    width: `${Math.min(100, Math.round((estadisticasGenerales.totalTramites / 900) * 100))}%`,
                    backgroundColor: COLORS.primary
                  }}
                ></div>
              </div>
              <div className="flex justify-end mt-1">
                <span className="text-xs" style={{ color: COLORS.darkGray }}>
                  {Math.round((estadisticasGenerales.totalTramites / 900) * 100)}%
                </span>
              </div>
            </div>
          </div>
          
          {/* Tarjeta: Trámites en Proceso */}
          <div className="rounded-lg shadow-sm" style={{ backgroundColor: COLORS.white, border: `1px solid ${COLORS.mediumGray}` }}>
            <div className="p-3">
              <div className="flex items-center mb-2">
                <div className="rounded-full p-2 mr-3" style={{ backgroundColor: COLORS.accent }}>
                  <FaTools className="text-white text-lg" />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: COLORS.darkGray }}>Trámites en Proceso</p>
                  <div className="flex items-baseline">
                    <p className="text-xl font-bold" style={{ color: COLORS.primaryDark }}>{estadisticasGenerales.tramitesEnProceso}</p>
                    <p className="text-xs ml-1" style={{ color: COLORS.darkGray }}>/{estadisticasGenerales.totalTramites}</p>
                  </div>
                </div>
              </div>
              
              {/* Gráfico circular */}
              <div className="flex justify-center items-center my-1">
                <div style={{ 
                  position: 'relative', 
                  width: '60px', 
                  height: '60px',
                }}>
                  <svg width="60" height="60" viewBox="0 0 60 60">
                    {/* Círculo de fondo */}
                    <circle 
                      cx="30" 
                      cy="30" 
                      r="25" 
                      fill="none" 
                      stroke="#e5e7eb" 
                      strokeWidth="8" 
                    />
                    {/* Círculo de progreso */}
                    <circle 
                      cx="30" 
                      cy="30" 
                      r="25" 
                      fill="none" 
                      stroke={COLORS.accent} 
                      strokeWidth="8" 
                      strokeDasharray={`${(estadisticasGenerales.tramitesEnProceso / estadisticasGenerales.totalTramites) * 157} 157`} 
                      strokeDashoffset="0" 
                      strokeLinecap="round" 
                      transform="rotate(-90 30 30)" 
                    />
                  </svg>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '0.75rem',
                    color: COLORS.darkGray
                  }}>
                    {Math.round((estadisticasGenerales.tramitesEnProceso / estadisticasGenerales.totalTramites) * 100)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tarjeta: Secretarías Activas */}
          <div className="rounded-lg shadow-sm" style={{ backgroundColor: COLORS.white, border: `1px solid ${COLORS.mediumGray}` }}>
            <div className="p-3">
              <div className="flex items-center mb-2">
                <div className="rounded-full p-2 mr-3" style={{ backgroundColor: COLORS.secondary }}>
                  <FaBuilding className="text-white text-lg" />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: COLORS.darkGray }}>Secretarías Activas</p>
                  <p className="text-xl font-bold" style={{ color: COLORS.primaryDark }}>{estadisticasGenerales.secretariasActivas}</p>
                </div>
              </div>
              
              {/* Visualización de iconos para secretarías */}
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                {Array.from({ length: estadisticasGenerales.secretariasActivas }).map((_, index) => (
                  <div 
                    key={index} 
                    className="rounded-full" 
                    style={{ 
                      backgroundColor: COLORS.secondary, 
                      width: '12px', 
                      height: '12px' 
                    }}
                  ></div>
                ))}
                {Array.from({ length: Math.max(0, 20 - estadisticasGenerales.secretariasActivas) }).map((_, index) => (
                  <div 
                    key={`inactive-${index}`} 
                    className="rounded-full" 
                    style={{ 
                      backgroundColor: '#e5e7eb', 
                      width: '12px', 
                      height: '12px' 
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Tarjeta: Nivel Digitalización */}
          <div className="rounded-lg shadow-sm" style={{ backgroundColor: COLORS.white, border: `1px solid ${COLORS.mediumGray}` }}>
            <div className="p-3">
              <div className="flex items-center mb-2">
                <div className="rounded-full p-2 mr-3" style={{ backgroundColor: COLORS.primaryDark }}>
                  <FaSignal className="text-white text-lg" />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: COLORS.darkGray }}>Nivel Digitalización</p>
                  <div className="flex items-baseline">
                    <p className="text-xl font-bold" style={{ color: COLORS.primaryDark }}>
                      {estadisticasGenerales.nivelDigitalizacionPromedio.toFixed(1)}
                    </p>
                    <span className="text-xs ml-1" style={{ color: COLORS.darkGray }}>/4.0</span>
                  </div>
                </div>
              </div>
              
              {/* Medidor visual de nivel */}
              <div className="flex justify-between mt-1 mb-1">
                {[0, 1, 2, 3, 4].map((nivel) => (
                  <div key={nivel} className="flex flex-col items-center">
                    <div 
                      className="rounded-full" 
                      style={{ 
                        width: '14px', 
                        height: '14px',
                        backgroundColor: nivel <= Math.floor(estadisticasGenerales.nivelDigitalizacionPromedio) 
                          ? COLORS.primaryDark 
                          : (nivel === Math.ceil(estadisticasGenerales.nivelDigitalizacionPromedio) && 
                             nivel > Math.floor(estadisticasGenerales.nivelDigitalizacionPromedio))
                            ? COLORS.primary + '80' /* Semi-transparente para nivel parcial */
                            : '#e5e7eb'
                      }}
                    ></div>
                    <span className="text-xs mt-1" style={{ color: COLORS.darkGray }}>{nivel}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
      </div>
      
      {/* Gráficos */}
      {!isLoading && !error && Array.isArray(tramites) && tramites.length > 0 && !selectedSecretaria && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3" style={{ color: COLORS.primaryDark }}>Visualización de Avance</h2>
          {/* Eliminado el contenedor adicional para permitir que el layout de DashboardCharts funcione correctamente */}
          <DashboardCharts 
            tramites={tramites} 
            secretarias={secretarias} 
            estadisticasGenerales={estadisticasGenerales} 
          />
        </div>
      )}
      
      {/* Barra de búsqueda */}
      {!selectedSecretaria && (
        <div className="mb-4 flex">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Buscar secretaría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pl-10 rounded-md border text-sm"
              style={{ borderColor: COLORS.mediumGray }}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
      )}
      
      <h2 className="text-xl font-bold mb-3" style={{ color: COLORS.primaryDark }}>Dependencias</h2>
      
      {/* Estado de carga */}
      {isLoading && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2" style={{ borderColor: COLORS.primary }}></div>
        </div>
      )}
      
      {/* Mensaje de error */}
      {error && (
        <div className="border px-3 py-2 rounded relative mb-4" 
          style={{ backgroundColor: '#ffeaea', borderColor: COLORS.primary, color: COLORS.primaryDark }} 
          role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      
      {/* Detalle de secretaría seleccionada */}
      {!isLoading && !error && selectedSecretaria && (
        <SecretariaDetail
          secretaria={selectedSecretaria}
          tramites={Array.isArray(tramites) ? tramites.filter(t => t && t.secretaria_id === selectedSecretaria.id) : []}
          onBack={() => setSelectedSecretaria(null)}
          expandedTramites={expandedTramites}
          toggleTramiteExpanded={toggleTramiteExpanded}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          colors={COLORS}
        />
      )}
      
      {/* Lista de secretarías */}
      {!isLoading && !error && !selectedSecretaria && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-6">
          {Array.isArray(secretarias) ? secretarias
            .filter(secretaria => 
              secretaria && secretaria.nombre && secretaria.nombre.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map(secretaria => (
              <SecretariaCard
                key={secretaria.id}
                secretaria={secretaria}
                tramites={Array.isArray(tramites) ? tramites.filter(t => t && t.secretaria_id === secretaria.id) : []}
                onClick={() => setSelectedSecretaria(secretaria)}
                colors={COLORS}
              />
            )) : <p>No hay secretarías disponibles</p>}
        </div>
      )}
    </div>
  );
};

export default DashboardSecretarias;
