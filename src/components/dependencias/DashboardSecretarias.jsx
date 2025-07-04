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
  const TOTAL_TRAMITES_ESTATALES = 249;
  
  // Totales de trámites por secretaría (cantidades correctas)
  const TOTAL_TRAMITES_POR_SECRETARIA = {
    // Mapeo de ID de secretaría a total de trámites
    // Estos valores son los proporcionados por el usuario
    2: 8,  // PROCURADURIA GENERAL DE JUSTICIA - 8 trámites en total (5 en proceso)
    3: 11, // SECRETARIA DE CONTRALORÍA - 11 trámites en total
    4: 34, // SECRETARÍA DE MEDIO AMBIENTE Y RECURSOS NATURALES - 34 trámites en total
    1: 8,  // SECRETARÍA DE SEGURIDAD PÚBLICA - 8 trámites en total
    // Añadir más secretarías según sea necesario
  };

  // Cargar datos de trámites y secretarías
  // Exponer la función para mostrar una secretaría específica
  useEffect(() => {
    // Exponer la función para que pueda ser llamada desde otros componentes
    if (typeof window !== 'undefined') {
      window.DashboardSecretarias = window.DashboardSecretarias || {};
      window.DashboardSecretarias.mostrarSecretaria = (secretariaId) => {
        const secretariaSeleccionada = secretarias.find(s => s.id === secretariaId);
        if (secretariaSeleccionada) {
          setSelectedSecretaria(secretariaSeleccionada);
          // Desplazar al inicio de la página
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };
    }
    
    return () => {
      // Limpiar cuando el componente se desmonte
      if (typeof window !== 'undefined' && window.DashboardSecretarias) {
        delete window.DashboardSecretarias.mostrarSecretaria;
      }
    };
  }, [secretarias]);

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
        nivelDigitalizacionPromedio: 0,
        porcentajeAvanceSimplificacion: 0
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
      
    // Calcular el porcentaje de avance de simplificación
    // Este porcentaje considera el avance individual de cada trámite y cuántos están en proceso
    let porcentajeAvanceSimplificacion = 0;
    
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
    
    // Para el porcentaje total, consideramos el avance de todos los trámites disponibles a nivel estatal
    porcentajeAvanceSimplificacion = sumaAvancesIndividuales / TOTAL_TRAMITES_ESTATALES;

    return {
      totalTramites: tramites.length,
      tramitesEnProceso: tramitesEnProceso,
      secretariasActivas: secretariasUnicas.size,
      nivelDigitalizacionPromedio: promedioDigitalizacion,
      porcentajeAvanceSimplificacion: porcentajeAvanceSimplificacion
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
      <h1 className="text-2xl font-bold mb-6" style={{ color: COLORS.primaryDark }}>Dashboard de Simplificación de Trámites</h1>
      
      {/* BLOQUE 1: PANORAMA GENERAL DEL ESTADO */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4" style={{ color: COLORS.primaryDark, borderBottom: `2px solid ${COLORS.primary}`, paddingBottom: '8px' }}>
          <FaProjectDiagram className="inline mr-2" /> Panorama General del Estado
        </h2>
        
        {/* Tarjetas KPI en una sola fila horizontal */}
        <div className="flex flex-wrap gap-4">
          {/* KPI 1: Porcentaje de avance de simplificación */}
          <div className="flex-1 min-w-[250px] rounded-lg shadow-md" style={{ backgroundColor: COLORS.white, border: `1px solid ${COLORS.mediumGray}` }}>
            <div className="p-4">
              <div className="flex items-center mb-3">
                <div className="rounded-full p-2.5 mr-3" style={{ backgroundColor: '#10B981' }}>
                  <FaChartLine className="text-white text-xl" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: COLORS.darkGray }}>Porcentaje de avance de simplificación</p>
                  <p className="text-2xl font-bold" style={{ color: '#10B981' }}>
                    {estadisticasGenerales.porcentajeAvanceSimplificacion.toFixed(2)}%
                  </p>
                </div>
              </div>
              
              {/* Barra de progreso horizontal con gradiente */}
              <div className="relative pt-1">
                <div className="overflow-hidden h-3 mb-1 text-xs flex rounded-full bg-gray-200">
                  <div 
                    style={{ width: `${Math.round(estadisticasGenerales.porcentajeAvanceSimplificacion)}%` }} 
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-green-400 to-green-600">
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-600">
                Avance ponderado de {estadisticasGenerales.totalTramites} trámites sobre {TOTAL_TRAMITES_ESTATALES} totales (12 pasos por trámite)
              </p>
            </div>
          </div>
          
          {/* KPI 2: Total de trámites en proceso */}
          <div className="flex-1 min-w-[250px] rounded-lg shadow-md" style={{ backgroundColor: COLORS.white, border: `1px solid ${COLORS.mediumGray}` }}>
            <div className="p-4">
              <div className="flex items-center mb-3">
                <div className="rounded-full p-2.5 mr-3" style={{ backgroundColor: COLORS.primary }}>
                  <FaFileAlt className="text-white text-xl" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: COLORS.darkGray }}>Total de Trámites en Proceso de Simplificación</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-bold" style={{ color: COLORS.primaryDark }}>{estadisticasGenerales.totalTramites}</p>
                    <p className="text-sm ml-1" style={{ color: COLORS.darkGray }}>de {TOTAL_TRAMITES_ESTATALES}</p>
                  </div>
                </div>
              </div>
              
              {/* Barra de progreso */}
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full" 
                  style={{ 
                    width: `${Math.min(100, Math.round((estadisticasGenerales.totalTramites /   249) * 100))}%`,
                    backgroundColor: COLORS.primary
                  }}
                ></div>
              </div>
              <p className="mt-2 text-xs text-gray-600">
                Incluye trámites en cualquier paso del flujo
              </p>
            </div>
          </div>
          
          {/* KPI 3: Secretarías con trámites en proceso */}
          <div className="flex-1 min-w-[250px] rounded-lg shadow-md" style={{ backgroundColor: COLORS.white, border: `1px solid ${COLORS.mediumGray}` }}>
            <div className="p-4">
              <div className="flex items-center mb-3">
                <div className="rounded-full p-2.5 mr-3" style={{ backgroundColor: '#8B5CF6' }}>
                  <FaBuilding className="text-white text-xl" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: COLORS.darkGray }}>Secretarías con trámites en proceso</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-bold" style={{ color: '#8B5CF6' }}>{estadisticasGenerales.secretariasActivas}</p>
                    <p className="text-sm ml-1" style={{ color: COLORS.darkGray }}>de 12</p>
                  </div>
                </div>
              </div>
              
              {/* Barra horizontal con color morado */}
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-indigo-400 to-purple-600 h-3 rounded-full" 
                    style={{ width: `${Math.round((estadisticasGenerales.secretariasActivas /12) * 100)}%` }}
                  ></div>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-600">
                Secretarías activas en al menos un trámite
              </p>
            </div>
          </div>
          
          {/* KPI 4: Nivel promedio de digitalización */}
          <div className="flex-1 min-w-[250px] rounded-lg shadow-md" style={{ backgroundColor: COLORS.white, border: `1px solid ${COLORS.mediumGray}` }}>
            <div className="p-4">
              <div className="flex items-center mb-3">
                <div className="rounded-full p-2.5 mr-3" style={{ backgroundColor: COLORS.accent }}>
                  <FaSignal className="text-white text-xl" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: COLORS.darkGray }}>Nivel Promedio de Digitalización</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-bold" style={{ color: COLORS.accent }}>
                      {estadisticasGenerales.nivelDigitalizacionPromedio.toFixed(1)}
                    </p>
                    <p className="text-sm ml-1" style={{ color: COLORS.darkGray }}>/4.0</p>
                  </div>
                </div>
              </div>
              
              {/* Visualización semicircular */}
              <div className="relative h-12 w-full mt-2">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-12 relative">
                    {/* Fondo del semicírculo */}
                    <div className="absolute top-0 left-0 right-0 h-6 bg-gray-200 rounded-t-full overflow-hidden"></div>
                    
                    {/* Progreso del semicírculo */}
                    <div 
                      className="absolute top-0 left-0 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-t-full overflow-hidden" 
                      style={{ width: `${(estadisticasGenerales.nivelDigitalizacionPromedio / 4) * 100}%` }}
                    ></div>
                    
                    {/* Marcadores de nivel */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
                      {[0, 1, 2, 3, 4].map(nivel => (
                        <div key={nivel} className="flex flex-col items-center">
                          <div className="w-1 h-3 bg-gray-400"></div>
                          <span className="text-xs mt-1" style={{ color: COLORS.darkGray }}>{nivel}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-600">
                Promedio de nivel de digitalización de los trámites en proceso
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* BLOQUE 2 y 3: GRÁFICOS DE DISTRIBUCIÓN Y AVANCE */}
      {!isLoading && !error && Array.isArray(tramites) && tramites.length > 0 && !selectedSecretaria && (
        <div className="mb-6">
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
          totalTramitesSecretaria={TOTAL_TRAMITES_POR_SECRETARIA[selectedSecretaria.id] || 0}
        />
      )}
      
      {/* Lista de secretarías */}
      {!isLoading && !error && !selectedSecretaria && (
        <div className="grid grid-cols-2 gap-4 mb-6">
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
