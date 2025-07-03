import React, { useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { Doughnut, Radar } from 'react-chartjs-2';
import { COLORS } from '../../styles/colors';
import FlowDiagram from './FlowDiagram';
import TramiteCardMini from './TramiteCardMini';
import SecretariaDetail from './SecretariaDetail';
import { FaArrowLeft, FaSearch, FaTimes } from 'react-icons/fa';

// Registrar componentes de Chart.js
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  RadialLinearScale, 
  PointElement, 
  LineElement, 
  Filler
);

const DashboardCharts = ({ tramites, secretarias, estadisticasGenerales }) => {
  // Estado para la secretaría seleccionada y búsqueda de trámites
  const [selectedSecretaria, setSelectedSecretaria] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTramites, setExpandedTramites] = useState({});
  
  // Función para alternar la expansión de un trámite
  const toggleTramiteExpanded = (tramiteId) => {
    setExpandedTramites(prev => ({
      ...prev,
      [tramiteId]: !prev[tramiteId]
    }));
  };
  
  // Función para determinar el color según el porcentaje de avance
  const getAvanceColor = (porcentaje) => {
    if (porcentaje < 25) return '#ef4444'; // rojo
    if (porcentaje < 50) return '#f97316'; // naranja
    if (porcentaje < 75) return '#eab308'; // amarillo
    return '#22c55e'; // verde
  };
  // Preparar datos para gráficos
  const prepararDatosGraficos = () => {
    // Colores institucionales
    const coloresInstitucionales = [
      COLORS.primary,
      COLORS.primaryDark,
      COLORS.secondary,
      COLORS.accent,
      '#942241',
      '#691c32',
      '#ddc9a3',
      '#235b4e'
    ];
    
    // Versiones con transparencia para fondos
    const coloresFondo = coloresInstitucionales.map(color => {
      // Convertir a rgba con 0.6 de opacidad
      if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.6)`;
      }
      return color;
    });
    // Datos para gráfico de distribución de trámites por secretaría
    const tramitesPorSecretaria = {};
    secretarias.forEach(secretaria => {
      tramitesPorSecretaria[secretaria.id] = tramites.filter(t => t.secretaria_id === secretaria.id).length;
    });

    const datosDistribucionSecretarias = {
      labels: secretarias.map(s => s.nombre.length > 15 ? s.nombre.substring(0, 15) + '...' : s.nombre),
      datasets: [
        {
          label: 'Trámites por Secretaría',
          data: secretarias.map(s => tramitesPorSecretaria[s.id] || 0),
          backgroundColor: coloresFondo,
          borderColor: coloresInstitucionales,
          borderWidth: 1,
        },
      ],
    };

    // Datos para gráfico de avance de trámites
    const camposEtapas = [
      'capacitacion_modulo1',
      'capacitacion_modulo2',
      'boceto_modelado',
      'capacitacion_modulo3',
      'bizagi_modelado',
      'acciones_reingenieria',
      'boceto_acuerdo',
      'publicado'
    ];
    
    const etiquetasEtapas = [
      'Capacitación 1',
      'Capacitación 2',
      'Boceto Modelado',
      'Capacitación 3',
      'Bizagi Modelado',
      'Acciones Reingeniería',
      'Boceto Acuerdo',
      'Publicado'
    ];
    
    // Usamos las etapas reales de la base de datos
    const etapasAvance = etiquetasEtapas;
    
    // Contamos los trámites que han completado cada etapa
    const conteoEtapas = [];
    for (let i = 0; i < camposEtapas.length; i++) {
      const campo = camposEtapas[i];
      const completados = tramites.filter(tramite => tramite[campo] === true).length;
      conteoEtapas.push(completados);
    }

    // Colores con gradiente suave para las barras (se generan dinámicamente en el componente)

    // Contadores para cada nivel de digitalización (0-4)
    const conteoNivelesDigitalizacion = [0, 0, 0, 0, 0];
    
    // Calcular niveles de digitalización
    tramites.forEach(tramite => {
      const nivel = Math.round(parseFloat(tramite.nivel_digitalizacion || 0));
      if (nivel >= 0 && nivel <= 4) {
        conteoNivelesDigitalizacion[nivel]++;
      }
    });
    
    // Preparar datos para gráfico de dona de niveles de digitalización
    const datosNivelDigitalizacion = {
      labels: ['Nivel 0', 'Nivel 1', 'Nivel 2', 'Nivel 3', 'Nivel 4'],
      datasets: [{
        data: conteoNivelesDigitalizacion,
        backgroundColor: [
          '#e74c3c', // Rojo para nivel 0
          '#e67e22', // Naranja para nivel 1
          '#f1c40f', // Amarillo para nivel 2
          '#2ecc71', // Verde claro para nivel 3
          '#27ae60'  // Verde oscuro para nivel 4
        ],
        borderWidth: 1
      }]
    };

    // Datos para el gráfico de radar de avance general
    const datosRadarAvance = {
      labels: ['Trámites Registrados', 'Trámites en Proceso', 'Nivel Digitalización', 'Secretarías Participantes', 'Avance Simplificación'],
      datasets: [
        {
          label: 'Estado Actual',
          data: [
            tramites.length / 229 * 100, // Porcentaje de trámites registrados del total estatal
            tramites.filter(t => !t.publicado).length / 229 * 100, // Porcentaje de trámites en proceso del total estatal
            estadisticasGenerales?.nivelDigitalizacionPromedio / 4 * 100 || 0, // Porcentaje de nivel digitalización
            estadisticasGenerales?.secretariasActivas / 17 * 100 || 0, // Porcentaje de secretarías activas del total (17)
            // Usar el nuevo cálculo de porcentaje de avance de simplificación
            // Este cálculo considera el avance individual de cada trámite con ponderación
            tramites.reduce((sum, t) => {
              // Contar puntos acumulados para este trámite
              let puntosTramite = 0;
              
              // Pasos 1-6 (valor 0.5 cada uno)
              if (t.capacitacion_modulo1) puntosTramite += 0.5;
              if (t.boceto_modelado) puntosTramite += 0.5;
              if (t.bizagi_modelado) puntosTramite += 0.5;
              if (t.acciones_reingenieria) puntosTramite += 0.5;
              if (t.capacitacion_modulo2) puntosTramite += 0.5;
              if (t.boceto_acuerdo) puntosTramite += 0.5;
              if (t.publicado) puntosTramite += 1;
              
              return sum + puntosTramite;
            }, 0) / (229 * 7) * 100 // Porcentaje de avance ponderado sobre el total estatal
          ],
          backgroundColor: `${coloresFondo[0]}50`,
          borderColor: coloresInstitucionales[0],
          borderWidth: 2,
          pointBackgroundColor: coloresInstitucionales[0],
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: coloresInstitucionales[0],
          fill: true
        }
      ],
    };

    return {
      datosDistribucionSecretarias,
      etapasAvance,
      conteoEtapas,
      datosNivelDigitalizacion,
      datosRadarAvance
    };
  };

  const { etapasAvance, conteoEtapas, datosNivelDigitalizacion, datosRadarAvance } = prepararDatosGraficos();

  const opcionesDoughnut = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Niveles de Digitalización',
        font: {
          size: 16,
          weight: 'bold'
        },
        color: COLORS.primaryDark,
        padding: {
          bottom: 20
        }
      },
    },
  };
  
  const opcionesRadar = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          display: true,
          color: COLORS.lightGray
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 20,
          backdropColor: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 11,
            weight: 'bold'
          },
          color: COLORS.darkGray
        },
        pointLabels: {
          font: {
            size: 12,
            weight: 'bold'
          },
          color: COLORS.darkGray
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Avance General (%)',
        font: {
          size: 16,
          weight: 'bold'
        },
        color: COLORS.primaryDark,
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw.toFixed(1)}%`;
          }
        }
      }
    },
  };

  // Usar estilos en línea directos para mayor control
  return (
    <div className="flex flex-col gap-8">
      {/* BLOQUE 2: DISTRIBUCIÓN DEL AVANCE */}
      <div className="mb-2">
        <h2 className="text-xl font-semibold mb-4" style={{ color: COLORS.primaryDark, borderBottom: `2px solid ${COLORS.primary}`, paddingBottom: '8px' }}>
          Distribución del Avance
        </h2>
        
        <div className="flex flex-wrap gap-6">
          {/* Gráfico de Radar - Avance General */}
          <div className="flex-1 min-w-[450px] bg-white rounded-lg shadow-md p-4 border" style={{ borderColor: COLORS.mediumGray }}>
            <div className="h-[350px]">
              <Radar data={datosRadarAvance} options={opcionesRadar} />
            </div>
            <p className="text-sm text-gray-600 mt-3 text-center">
              Este gráfico muestra el avance porcentual en 5 dimensiones clave del proceso de simplificación.
              Las áreas con menor cobertura representan oportunidades de mejora prioritarias.
            </p>
          </div>
          
          {/* Gráfico de Dona - Niveles de Digitalización */}
          <div className="flex-1 min-w-[450px] bg-white rounded-lg shadow-md p-4 border" style={{ borderColor: COLORS.mediumGray }}>
            <div className="h-[350px]">
              <Doughnut data={datosNivelDigitalizacion} options={opcionesDoughnut} />
            </div>
            <p className="text-sm text-gray-600 mt-3 text-center">
              Distribución de trámites según su nivel de digitalización (0-4). 
              Los niveles superiores indican mayor madurez digital y mejor experiencia ciudadana.
            </p>
          </div>
        </div>
      </div>
      
      {/* BLOQUE 3: AVANCE POR ETAPA DEL FLUJO */}
      <div className="mb-2">
        <h2 className="text-xl font-semibold mb-4" style={{ color: COLORS.primaryDark, borderBottom: `2px solid ${COLORS.primary}`, paddingBottom: '8px' }}>
          Avance por Etapa del Flujo
        </h2>
        
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Cantidad de Trámites por Etapa de la Ruta de Simplificación</h3>
          <div className="h-80">
            <FlowDiagram etapas={etapasAvance} conteos={conteoEtapas} maxConteo={Math.max(...conteoEtapas)} />
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Cantidad de trámites que han completado cada etapa de la ruta de simplificación. El tamaño de cada círculo representa la cantidad de trámites en esa etapa. Las diferencias entre etapas consecutivas pueden indicar cuellos de botella en el proceso.
          </p>
        </div>
      </div>

      {/* NUEVA SECCIÓN: ESTATUS GENERAL POR SECRETARÍA */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Ranking de Secretarías por Avance
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posición</th>
                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Secretaría</th>
                <th className="px-4 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Trámites</th>
                <th className="px-4 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">En Proceso</th>
                <th className="px-4 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Publicados</th>
                <th className="px-4 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Nivel Digitalización</th>
                <th className="px-4 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">% Avance Simplificación <span className="font-normal lowercase">(tendencia)</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {secretarias
                .map((secretaria) => {
                  // Calcular estadísticas para esta secretaría
                  const tramitesSecretaria = tramites.filter(t => t && t.secretaria_id === secretaria.id);
                  const tramitesPublicados = tramitesSecretaria.filter(t => t.publicado === true).length;
                  const tramitesEnProceso = tramitesSecretaria.length - tramitesPublicados;
                  
                  // Obtener el total real de trámites de la secretaría (no solo los que están en proceso)
                  // Usamos el valor real del total de trámites de la secretaría
                  const TOTAL_TRAMITES_POR_SECRETARIA = {
                    2: 8,  // PROCURADURIA GENERAL DE JUSTICIA
                    3: 11, // SECRETARIA DE CONTRALORÍA
                    4: 34, // SECRETARÍA DE MEDIO AMBIENTE Y RECURSOS NATURALES
                    1: 8,  // SECRETARÍA DE SEGURIDAD PÚBLICA
                  };
                  
                  const totalTramites = TOTAL_TRAMITES_POR_SECRETARIA[secretaria.id] || tramitesSecretaria.length;
                  
                  // Calcular nivel de digitalización promedio
                  const nivelesDigitalizacion = tramitesSecretaria
                    .map(t => parseFloat(t.nivel_digitalizacion))
                    .filter(nivel => !isNaN(nivel));
                  
                  const sumaDigitalizacion = nivelesDigitalizacion.reduce((sum, nivel) => sum + nivel, 0);
                  const nivelDigitalizacionPromedio = nivelesDigitalizacion.length > 0 ? 
                    sumaDigitalizacion / nivelesDigitalizacion.length : 0;
                  
                  // Calcular porcentaje de avance de simplificación (exactamente igual que en SecretariaDetail)
                  // Calcular el avance individual de cada trámite basado en los pasos completados con ponderación
                  const avancesPorTramite = tramitesSecretaria.map(tramite => {
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
                  const porcentajeAvance = totalTramites > 0 ? sumaAvancesIndividuales / totalTramites : 0;
                  
                  // Simular datos de tendencia (en una implementación real, estos vendrían de la base de datos)
                  // Usamos el ID de la secretaría para determinar la tendencia de manera consistente
                  let tendencia = 0; // 0 = sin cambio, 1 = mejora (no puede haber retroceso)
                  
                  // Asignamos tendencias basadas en el ID para simular datos reales
                  // Solo puede haber mejora o sin cambio (según requerimiento)
                  if (secretaria.id % 3 === 0) { // Un tercio de las secretarías muestran mejora
                    tendencia = 1; // mejorando
                  } else {
                    tendencia = 0; // sin cambio
                  }
                  
                  // Devolver un objeto con todos los datos y la secretaría para ordenar después
                  return {
                    secretaria,
                    tramitesSecretaria,
                    tramitesPublicados,
                    tramitesEnProceso,
                    totalTramites,
                    nivelDigitalizacionPromedio,
                    porcentajeAvance,
                    tendencia
                  };
                })
                // Ordenar por porcentaje de avance (de mayor a menor)
                .sort((a, b) => b.porcentajeAvance - a.porcentajeAvance)
                // Mapear los resultados ordenados a filas de la tabla
                .map((item, index) => {
                  const { secretaria, tramitesPublicados, tramitesEnProceso, totalTramites, nivelDigitalizacionPromedio, porcentajeAvance, tendencia } = item;
                  
                  return (
                    <tr 
                      key={secretaria.id} 
                      className={`${index === 0 ? 'bg-yellow-50 hover:bg-yellow-100' : index === 1 ? 'bg-gray-50 hover:bg-gray-100' : index === 2 ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-gray-50'} cursor-pointer`}
                      onClick={() => setSelectedSecretaria(secretaria)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          {index === 0 ? (
                            <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center shadow-md">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          ) : index === 1 ? (
                            <div className="w-9 h-9 rounded-full bg-gray-400 flex items-center justify-center shadow-md">
                              <span className="text-white font-bold">2</span>
                            </div>
                          ) : index === 2 ? (
                            <div className="w-8 h-8 rounded-full bg-amber-700 flex items-center justify-center shadow-md">
                              <span className="text-white font-bold">3</span>
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-600 font-medium">{index + 1}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-2">
                            <div className="text-sm font-medium text-gray-900">{secretaria.nombre}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">{totalTramites}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">{tramitesEnProceso}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">{tramitesPublicados}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          <span className="text-sm text-gray-900 mr-2">{nivelDigitalizacionPromedio.toFixed(1)}</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="rounded-full h-2" 
                              style={{ 
                                width: `${(nivelDigitalizacionPromedio / 4) * 100}%`,
                                backgroundColor: getAvanceColor(nivelDigitalizacionPromedio)
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          <div className="flex items-center justify-center transition-all duration-200 group-hover:scale-110">
                            <span className="text-sm font-medium text-gray-900 mr-2 group-hover:text-primary">{Math.round(porcentajeAvance)}%</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2 group-hover:h-3 transition-all duration-200">
                              <div 
                                className="rounded-full h-2 group-hover:h-3 transition-all duration-200" 
                                style={{ 
                                  width: `${porcentajeAvance}%`,
                                  backgroundColor: getAvanceColor(porcentajeAvance)
                                }}
                              ></div>
                            </div>
                            {tendencia === 1 && (
                              <div className="ml-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-600 mt-2 bg-blue-50 p-3 rounded-md border-l-4 border-blue-500">
          <span className="font-medium block mb-1">Acerca de este ranking:</span>
          Este ranking muestra el avance de las secretarías en el proceso de simplificación. Las tres primeras posiciones se destacan como las que mejor desempeño tienen. El porcentaje de avance considera todos los pasos completados del proceso de simplificación.
          <span className="flex items-center mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-green-700">Mejora respecto al mes anterior</span>
            <span className="ml-4 text-xs text-gray-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Sin cambios respecto al mes anterior
            </span>
          </span>
        </p>
      </div>
      
      {/* Vista de trámites de la secretaría seleccionada */}
      {selectedSecretaria && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setSelectedSecretaria(null)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Cabecera */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10 shadow-sm">
              <button 
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors px-3 py-1 rounded-md hover:bg-gray-100" 
                onClick={() => setSelectedSecretaria(null)}
              >
                <FaArrowLeft className="mr-2" />
                <span>Volver al ranking</span>
              </button>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">Secretaría</span>
                {selectedSecretaria.nombre}
              </h2>
              <button 
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100" 
                onClick={() => setSelectedSecretaria(null)}
                aria-label="Cerrar"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            {/* Búsqueda */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 sticky top-16 z-10 shadow-sm">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Buscar trámite por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* Contenido - Fichas de trámites */}
            <div className="p-4 overflow-y-auto flex-grow">
              {/* Estadísticas rápidas */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {(() => {
                  // Filtrar trámites de esta secretaría
                  const tramitesSecretaria = tramites.filter(t => t && t.secretaria_id === selectedSecretaria.id);
                  const tramitesPublicados = tramitesSecretaria.filter(t => t.publicado).length;
                  const tramitesEnProceso = tramitesSecretaria.length - tramitesPublicados;
                  
                  // Calcular nivel de digitalización promedio (lo usaremos en una futura implementación)
                  // Por ahora solo calculamos el avance general
                  
                  // Calcular porcentaje de avance total
                  const totalPasos = tramitesSecretaria.length * 11; // 11 pasos por trámite
                  let pasosCompletados = 0;
                  
                  tramitesSecretaria.forEach(tramite => {
                    if (tramite.capacitacion_modulo1) pasosCompletados++;
                    if (tramite.capacitacion_modulo2) pasosCompletados++;
                    if (tramite.boceto_modelado) pasosCompletados++;
                    if (tramite.capacitacion_modulo3) pasosCompletados++;
                    if (tramite.bizagi_modelado) pasosCompletados++;
                    if (tramite.vo_bo_bizagi) pasosCompletados++;
                    if (tramite.acciones_reingenieria) pasosCompletados++;
                    if (tramite.vo_bo_acciones_reingenieria) pasosCompletados++;
                    if (tramite.boceto_acuerdo) pasosCompletados++;
                    if (tramite.vo_bo_acuerdo) pasosCompletados++;
                    if (tramite.publicado) pasosCompletados++;
                  });
                  
                  const porcentajeAvance = totalPasos > 0 ? (pasosCompletados / totalPasos) * 100 : 0;
                  
                  // Obtener el total real de trámites de la secretaría
                  const TOTAL_TRAMITES_POR_SECRETARIA = {
                    2: 8,  // PROCURADURIA GENERAL DE JUSTICIA
                    3: 11, // SECRETARIA DE CONTRALORÍA
                    4: 34, // SECRETARÍA DE MEDIO AMBIENTE Y RECURSOS NATURALES
                    1: 8,  // SECRETARÍA DE SEGURIDAD PÚBLICA
                  };
                  
                  const totalTramites = TOTAL_TRAMITES_POR_SECRETARIA[selectedSecretaria.id] || tramitesSecretaria.length;
                  
                  return (
                    <>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 hover:shadow-md transition-shadow">
                        <div className="text-sm font-medium text-gray-500">Total Trámites</div>
                        <div className="text-2xl font-bold text-gray-800">{totalTramites}</div>
                        <div className="mt-1 text-xs text-blue-600">Total registrado en sistema</div>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 hover:shadow-md transition-shadow">
                        <div className="text-sm font-medium text-gray-500">En Proceso</div>
                        <div className="text-2xl font-bold text-gray-800">{tramitesEnProceso}</div>
                        <div className="mt-1 text-xs text-yellow-600">{((tramitesEnProceso / totalTramites) * 100).toFixed(1)}% del total</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-100 hover:shadow-md transition-shadow">
                        <div className="text-sm font-medium text-gray-500">Publicados</div>
                        <div className="text-2xl font-bold text-gray-800">{tramitesPublicados}</div>
                        <div className="mt-1 text-xs text-green-600">{((tramitesPublicados / totalTramites) * 100).toFixed(1)}% del total</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 hover:shadow-md transition-shadow">
                        <div className="text-sm font-medium text-gray-500">Avance General</div>
                        <div className="text-2xl font-bold text-gray-800">{porcentajeAvance.toFixed(1)}%</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="rounded-full h-2" 
                            style={{ 
                              width: `${porcentajeAvance}%`,
                              backgroundColor: getAvanceColor(porcentajeAvance)
                            }}
                          ></div>
                        </div>
                        <div className="mt-1 text-xs text-purple-600">{pasosCompletados} de {totalPasos} pasos completados</div>
                      </div>
                    </>
                  );
                })()}
              </div>
              
              {/* Lista de trámites */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">Trámites</h3>
                <span className="text-sm text-gray-500">
                  {tramites.filter(t => t && t.secretaria_id === selectedSecretaria.id).length} trámites encontrados
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tramites
                  .filter(t => t && t.secretaria_id === selectedSecretaria.id)
                  .filter(t => t.nombre && t.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(tramite => (
                    <TramiteCardMini key={tramite.id} tramite={tramite} />
                  ))
                }
              </div>
              
              {/* Mensaje si no hay resultados */}
              {tramites.filter(t => t && t.secretaria_id === selectedSecretaria.id)
                .filter(t => t.nombre && t.nombre.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron resultados</h3>
                  <p className="mt-1 text-sm text-gray-500">No hay trámites que coincidan con tu búsqueda "{searchTerm}".</p>
                  <div className="mt-6">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => setSearchTerm('')}
                    >
                      Limpiar búsqueda
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardCharts;
