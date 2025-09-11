import React, { useState, useEffect } from 'react';
import { FaExchangeAlt, FaSpinner, FaArrowUp, FaArrowDown, FaMinus, FaPlus, FaChevronDown, FaChevronRight, FaTrophy, FaMedal, FaAward, FaChartLine, FaUsers, FaFileAlt, FaCalendarAlt, FaProjectDiagram, FaEquals, FaCogs, FaDigitalOcean, FaWifi } from 'react-icons/fa';
import axios from 'axios';

const PeriodComparison = ({ periodos, onError }) => {
  const [selectedPeriod1, setSelectedPeriod1] = useState('');
  const [selectedPeriod2, setSelectedPeriod2] = useState('');
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterSecretaria, setFilterSecretaria] = useState('');
  const [showOnlyChanges, setShowOnlyChanges] = useState(false);
  const [expandedSecretarias, setExpandedSecretarias] = useState(new Set());
  const [expandedRankingDetails, setExpandedRankingDetails] = useState(new Set());
  const [activeTab, setActiveTab] = useState('executive');
  const [selectedFlowPeriod, setSelectedFlowPeriod] = useState('period1');
  const [period1Data, setPeriod1Data] = useState([]);
  const [period2Data, setPeriod2Data] = useState([]);

  // Función para obtener datos reales de trámites por período con cache
  const fetchPeriodData = async (periodoId) => {
    try {
      const response = await axios.get(`/api/tramites?periodo_id=${periodoId}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error(`Error al obtener datos del período ${periodoId}:`, error);
      return [];
    }
  };

  const handleCompare = async () => {
    if (!selectedPeriod1 || !selectedPeriod2) {
      onError('Por favor selecciona ambos períodos para comparar');
      return;
    }

    if (selectedPeriod1 === selectedPeriod2) {
      onError('Por favor selecciona períodos diferentes');
      return;
    }

    setLoading(true);
    try {
      // Obtener tanto la comparación como los datos reales de trámites
      const [comparisonResponse, period1Response, period2Response] = await Promise.all([
        axios.get(`/api/csv/comparar/${selectedPeriod1}/${selectedPeriod2}`),
        fetchPeriodData(selectedPeriod1),
        fetchPeriodData(selectedPeriod2)
      ]);
      
      setComparison(comparisonResponse.data);
      setPeriod1Data(period1Response);
      setPeriod2Data(period2Response);
    } catch (error) {
      console.error('Error al comparar períodos:', error);
      onError('Error al comparar períodos');
    } finally {
      setLoading(false);
    }
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <FaArrowUp className="w-3 h-3 text-green-500" />;
    if (change < 0) return <FaArrowDown className="w-3 h-3 text-red-500" />;
    return <FaMinus className="w-3 h-3 text-gray-400" />;
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  const filteredComparisons = comparison?.comparaciones?.filter(comp => {
    const matchesFilter = !filterSecretaria || 
      comp.secretaria.toLowerCase().includes(filterSecretaria.toLowerCase());
    
    const hasChanges = comp.cambios.nivel_digitalizacion !== 0 || 
      comp.cambios.nuevo_en_periodo2 || 
      comp.cambios.eliminado_en_periodo2 || 
      comp.cambios.cambio_publicacion;
    
    return matchesFilter && (!showOnlyChanges || hasChanges);
  }) || [];

  const secretarias = [...new Set([
    ...period1Data.map(t => t.secretaria).filter(s => s && typeof s === 'string'),
    ...period2Data.map(t => t.secretaria).filter(s => s && typeof s === 'string')
  ])].sort();

  // Calcular métricas avanzadas usando datos reales de la base de datos
  const calculateAdvancedMetrics = () => {
    if (!comparison?.comparaciones) return null;
    
    // Permitir cálculos incluso si uno de los períodos está vacío
    if (period1Data.length === 0 && period2Data.length === 0) return null;

    // Usar los datos reales de trámites en lugar de los datos de comparación
    const newTramites = comparison.comparaciones.filter(c => c.cambios.nuevo_en_periodo2).length;
    const deletedTramites = comparison.comparaciones.filter(c => c.cambios.eliminado_en_periodo2).length;
    const modifiedTramites = comparison.comparaciones.filter(c => c.cambios.nivel_digitalizacion !== 0).length;
    
    // Calcular trámites por etapa de digitalización usando datos reales
    const getStageDistribution = (tramitesData) => {
      const stages = {
        'Inicial (0-1)': 0,
        'Básico (1-2)': 0,
        'Intermedio (2-3)': 0,
        'Avanzado (3-4)': 0,
        'Completo (4-5)': 0
      };
      
      tramitesData.forEach(tramite => {
        const nivel = parseFloat(tramite.nivel_digitalizacion) || 0;
        if (nivel <= 1) stages['Inicial (0-1)']++;
        else if (nivel <= 2) stages['Básico (1-2)']++;
        else if (nivel <= 3) stages['Intermedio (2-3)']++;
        else if (nivel <= 4) stages['Avanzado (3-4)']++;
        else stages['Completo (4-5)']++;
      });
      
      return stages;
    };

    // Calcular etapas de la ruta de simplificación usando datos reales
    const getSimplificationStages = (tramitesData) => {
      const stages = {
        'Capacitaciones': 0,
        'Bizagi Modelado': 0,
        'VoBo Bizagi': 0,
        'VoBo Acciones de Reingeniería': 0,
        'Nuevo Proceso': 0,
        'VoBo Nuevo Proceso': 0,
        'Publicación del acuerdo': 0,
        'Implementación': 0
      };
      
      tramitesData.forEach(tramite => {
        if (tramite.capacitacion_modulo1) stages['Capacitaciones']++;
        if (tramite.bizagi_modelado) stages['Bizagi Modelado']++;
        if (tramite.vo_bo_bizagi) stages['VoBo Bizagi']++;
        if (tramite.vo_bo_acciones_reingenieria) stages['VoBo Acciones de Reingeniería']++;
        if (tramite.capacitacion_modulo3) stages['Nuevo Proceso']++;
        if (tramite.vo_bo_acuerdo) stages['VoBo Nuevo Proceso']++;
        if (tramite.boceto_acuerdo) stages['Publicación del acuerdo']++;
        if (tramite.publicado) stages['Implementación']++;
      });
      
      return stages;
    };


    return {
      period1: {
        total: period1Data.length,
        stages: getStageDistribution(period1Data),
        simplificationStages: getSimplificationStages(period1Data),
        avgDigitalization: calculateAvgDigitalization(period1Data),
        simplificationProgress: calculateSimplificationProgress(period1Data),
        weightedSimplificationProgress: calculateWeightedSimplificationProgress(period1Data)
      },
      period2: {
        total: period2Data.length,
        stages: getStageDistribution(period2Data),
        simplificationStages: getSimplificationStages(period2Data),
        avgDigitalization: calculateAvgDigitalization(period2Data),
        simplificationProgress: calculateSimplificationProgress(period2Data),
        weightedSimplificationProgress: calculateWeightedSimplificationProgress(period2Data)
      },
      changes: {
        new: newTramites,
        deleted: deletedTramites,
        modified: modifiedTramites
      }
    };
  };

  // Calcular ranking de secretarías usando datos reales
  const calculateSecretariaRanking = () => {
    if (period1Data.length === 0 && period2Data.length === 0) {
      return [];
    }

    const secretariaStats = {};
    
    // Procesar datos del período 1
    period1Data.forEach((tramite) => {
      const secretariaNombre = tramite?.secretaria?.nombre || tramite?.secretaria;
      
      if (!secretariaNombre || typeof secretariaNombre !== 'string') {
        return;
      }
      
      if (!secretariaStats[secretariaNombre]) {
        secretariaStats[secretariaNombre] = {
          nombre: String(secretariaNombre),
          period1: { total: 0, avgDigitalization: 0, published: 0, inProgress: 0, simplificationProgress: 0 },
          period2: { total: 0, avgDigitalization: 0, published: 0, inProgress: 0, simplificationProgress: 0 }
        };
      }
      
      const stats = secretariaStats[secretariaNombre];
      stats.period1.total++;
      stats.period1.avgDigitalization += parseFloat(tramite.nivel_digitalizacion) || 0;
      if (tramite.publicado) stats.period1.published++;
      if (!tramite.publicado) stats.period1.inProgress++;
    });
    
    // Procesar datos del período 2
    period2Data.forEach((tramite) => {
      const secretariaNombre = tramite?.secretaria?.nombre || tramite?.secretaria;
      
      if (!secretariaNombre || typeof secretariaNombre !== 'string') {
        return;
      }
      
      if (!secretariaStats[secretariaNombre]) {
        secretariaStats[secretariaNombre] = {
          nombre: String(secretariaNombre),
          period1: { total: 0, avgDigitalization: 0, published: 0, inProgress: 0, simplificationProgress: 0 },
          period2: { total: 0, avgDigitalization: 0, published: 0, inProgress: 0, simplificationProgress: 0 }
        };
      }
      
      const stats = secretariaStats[secretariaNombre];
      stats.period2.total++;
      stats.period2.avgDigitalization += parseFloat(tramite.nivel_digitalizacion) || 0;
      if (tramite.publicado) stats.period2.published++;
      if (!tramite.publicado) stats.period2.inProgress++;
    });
    
    // Calcular promedios y progreso de simplificación por secretaría
    const result = Object.values(secretariaStats)
      .map((stats) => {
        // Validar que stats tenga la estructura correcta
        if (!stats || typeof stats.nombre !== 'string') {
          return null;
        }
        
        // Calcular promedios de digitalización
        stats.period1.avgDigitalization = stats.period1.total > 0 ? stats.period1.avgDigitalization / stats.period1.total : 0;
        stats.period2.avgDigitalization = stats.period2.total > 0 ? stats.period2.avgDigitalization / stats.period2.total : 0;
        
        // Obtener trámites por secretaría para cada período
        const period1Tramites = period1Data.filter(t => (t?.secretaria?.nombre || t?.secretaria) === stats.nombre);
        const period2Tramites = period2Data.filter(t => (t?.secretaria?.nombre || t?.secretaria) === stats.nombre);
        
        // Agregar trámites a las estadísticas para usar en el cálculo ponderado
        stats.period1.tramites = period1Tramites;
        stats.period2.tramites = period2Tramites;
        
        // Calcular progreso de simplificación (% de trámites publicados)
        stats.period1.simplificationProgress = stats.period1.total > 0 ? (stats.period1.published / stats.period1.total) * 100 : 0;
        stats.period2.simplificationProgress = stats.period2.total > 0 ? (stats.period2.published / stats.period2.total) * 100 : 0;
        
        return stats;
      })
      .filter(stats => stats !== null && (stats.period1.total > 0 || stats.period2.total > 0))
      .sort((a, b) => calculateRankingScore(b) - calculateRankingScore(a));
    
    return result;
  };

  // Agrupar comparaciones por secretaría
  const groupBySecretaria = () => {
    if (!comparison?.comparaciones) return {};
    
    const grouped = {};
    filteredComparisons.forEach(comp => {
      if (!grouped[comp.secretaria]) {
        grouped[comp.secretaria] = [];
      }
      grouped[comp.secretaria].push(comp);
    });
    
    return grouped;
  };

  const toggleSecretaria = (secretaria) => {
    const newExpanded = new Set(expandedSecretarias);
    if (newExpanded.has(secretaria)) {
      newExpanded.delete(secretaria);
    } else {
      newExpanded.add(secretaria);
    }
    setExpandedSecretarias(newExpanded);
  };

  const toggleRankingDetails = (secretariaNombre) => {
    const newExpanded = new Set(expandedRankingDetails);
    if (newExpanded.has(secretariaNombre)) {
      newExpanded.delete(secretariaNombre);
    } else {
      newExpanded.add(secretariaNombre);
    }
    setExpandedRankingDetails(newExpanded);
  };

  // ÍNDICE DE MEJORA PORCENTUAL (IMP)
  // Calcula puntos totales contando TODAS las casillas TRUE de todos los trámites
  const calculatePeriodTotalPoints = (tramitesData) => {
    if (!tramitesData || tramitesData.length === 0) return 0;
    
    let totalTrueCount = 0;
    
    // Campos booleanos a contar (todos los campos de etapas)
    const booleanFields = [
      'capacitacion_modulo1',
      'boceto_modelado', 
      'bizagi_modelado',
      'vo_bo_bizagi',
      'capacitacion_modulo2',
      'acciones_reingenieria',
      'vo_bo_acciones_reingenieria',
      'capacitacion_modulo3',
      'boceto_acuerdo',
      'vo_bo_acuerdo',
      'publicado'
    ];
    
    tramitesData.forEach(tramite => {
      if (!tramite) return;
      
      // Contar todos los campos TRUE de este trámite
      booleanFields.forEach(field => {
        if (tramite[field]) {
          totalTrueCount += 1;
        }
      });
    });
    
    return totalTrueCount;
  };

  // Función auxiliar para progreso promedio (para mostrar en UI)
  const calculatePeriodEffortIndex = (tramitesData) => {
    if (!tramitesData || tramitesData.length === 0) return 0;
    const totalPoints = calculatePeriodTotalPoints(tramitesData);
    return tramitesData.length > 0 ? totalPoints / tramitesData.length : 0;
  };

  // Función para calcular el puntaje de ranking basado en mejora real
  const calculateRankingScore = (secretaria) => {
    if (!secretaria || !secretaria.period1 || !secretaria.period2) return 0;
    
    // 1. Índice de Mejora Porcentual (IMP) - peso: 60%
    const period1TotalPoints = calculatePeriodTotalPoints(secretaria.period1.tramites || []);
    const period2TotalPoints = calculatePeriodTotalPoints(secretaria.period2.tramites || []);
    
    // IMP = ((Puntos_P2 - Puntos_P1) / Puntos_P1) × 100
    // Si P1 = 0, usar valor base de 1 para evitar división por cero
    const improvementPercentage = period1TotalPoints > 0 ? 
      ((period2TotalPoints - period1TotalPoints) / period1TotalPoints) * 100 : 
      (period2TotalPoints > 0 ? 100 : 0); // 100% si empezó de cero y ahora tiene puntos
    
    // Solo IMP - usar porcentaje directo sin multiplicador
    return improvementPercentage;
  };

  // Calcular nivel de digitalización promedio usando datos reales
  const calculateAvgDigitalization = (tramitesData) => {
    const levels = tramitesData
      .map(tramite => parseFloat(tramite.nivel_digitalizacion))
      .filter(nivel => !isNaN(nivel));
    return levels.length > 0 ? levels.reduce((sum, level) => sum + level, 0) / levels.length : 0;
  };

  // Calcular progreso de simplificación (porcentaje de trámites completamente finalizados)
  const calculateSimplificationProgress = (tramitesData) => {
    if (tramitesData.length === 0) return 0;
    
    let fullySimplified = 0;
    
    tramitesData.forEach(tramite => {
      if (tramite.publicado) {
        fullySimplified++;
      }
    });
    
    return tramitesData.length > 0 ? (fullySimplified / tramitesData.length) * 100 : 0;
  };

  // Calcular porcentaje de avance de simplificación ponderado (como en Dependencias)
  // Usa 249 trámites totales como denominador (meta estatal)
  const calculateWeightedSimplificationProgress = (tramitesData) => {
    const TOTAL_TRAMITES_ESTATALES = 249; // Meta total del estado
    
    // Pasos 1-6 valen 0.5 cada uno, pasos 7-11 valen 1 cada uno
    // Total de puntos posibles por trámite: 6*0.5 + 5*1 = 3 + 5 = 8
    const puntosMaximosPorTramite = 8;
    const puntosMaximosTotales = TOTAL_TRAMITES_ESTATALES * puntosMaximosPorTramite; // 249 * 8 = 1992
    let puntosTotales = 0;
    
    tramitesData.forEach((tramite) => {
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
    
    const porcentaje = puntosMaximosTotales > 0 ? (puntosTotales / puntosMaximosTotales) * 100 : 0;
    
    return porcentaje;
  };

  const advancedMetrics = calculateAdvancedMetrics();
  const secretariaRanking = calculateSecretariaRanking();
  const groupedComparisons = groupBySecretaria();

  const metrics1 = {
    totalTramites: period1Data.length,
    avgDigitalization: calculateAvgDigitalization(period1Data),
    tramitesFinalizados: period1Data.filter(t => t.publicado).length,
    simplificationProgress: calculateSimplificationProgress(period1Data),
    weightedSimplificationProgress: calculateWeightedSimplificationProgress(period1Data)
  };

  const metrics2 = {
    totalTramites: period2Data.length,
    avgDigitalization: calculateAvgDigitalization(period2Data),
    tramitesFinalizados: period2Data.filter(t => t.publicado).length,
    simplificationProgress: calculateSimplificationProgress(period2Data),
    weightedSimplificationProgress: calculateWeightedSimplificationProgress(period2Data)
  };

  return (
    <div className="space-y-6">
      {/* Selectores de período */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Seleccionar Períodos para Comparar
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período Base
            </label>
            <select
              value={selectedPeriod1}
              onChange={(e) => setSelectedPeriod1(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar período...</option>
              {periodos.map(periodo => (
                <option key={periodo.id} value={periodo.id}>
                  {periodo.descripcion} ({periodo.total_registros} registros)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período a Comparar
            </label>
            <select
              value={selectedPeriod2}
              onChange={(e) => setSelectedPeriod2(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar período...</option>
              {periodos.map(periodo => (
                <option key={periodo.id} value={periodo.id}>
                  {periodo.descripcion} ({periodo.total_registros} registros)
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleCompare}
          disabled={!selectedPeriod1 || !selectedPeriod2 || loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin w-4 h-4 mr-2" />
              Comparando...
            </>
          ) : (
            <>
              <FaExchangeAlt className="w-4 h-4 mr-2" />
              Comparar Períodos
            </>
          )}
        </button>
      </div>

      {/* Resultados de la comparación */}
      {comparison && (
        <div className="space-y-6">
          {/* Navegación por pestañas */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'executive', label: 'Resumen Ejecutivo', icon: FaChartLine },
                  { id: 'ranking', label: 'Ranking Secretarías', icon: FaTrophy },
                  { id: 'detailed', label: 'Comparación Detallada', icon: FaFileAlt }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

          {/* Contenido de pestañas */}
          <div className="p-6">
            {activeTab === 'executive' && advancedMetrics && (
              <div className="space-y-6">
                {/* Resumen Ejecutivo Compacto */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-gray-200 rounded-lg p-6 mb-8 relative">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FaChartLine className="w-5 h-5 mr-2 text-blue-600" />
                      Resumen Ejecutivo de Comparación
                    </h4>
                    <div className="text-sm text-gray-600">
                      {comparison.periodo1?.descripcion} vs {comparison.periodo2?.descripcion}
                    </div>
                  </div>
                  
                  {/* Comparación lado a lado */}
                  <div className="grid grid-cols-2 gap-8">
                    {/* Período Base */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <FaCalendarAlt className="w-4 h-4 text-blue-600" />
                        <div>
                          <h5 className="font-semibold text-blue-900">{comparison.periodo1?.descripcion}</h5>
                          <p className="text-xs text-blue-700">{comparison.periodo1?.mes}/{comparison.periodo1?.anio}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Total trámites</span>
                          </div>
                          <span className="text-lg font-bold text-blue-600">{advancedMetrics.period1.total}</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Nivel digitalización</span>
                          </div>
                          <span className="text-lg font-bold text-purple-600">{advancedMetrics.period1.avgDigitalization.toFixed(2)}/5.0</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Trámites finalizados</span>
                          </div>
                          <span className="text-lg font-bold text-orange-600">{advancedMetrics.period1.simplificationProgress.toFixed(1)}%</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Avance simplificación</span>
                          </div>
                          <span className="text-lg font-bold text-indigo-600">{advancedMetrics.period1.weightedSimplificationProgress.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Período Actual */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <FaCalendarAlt className="w-4 h-4 text-green-600" />
                        <div>
                          <h5 className="font-semibold text-green-900">{comparison.periodo2?.descripcion}</h5>
                          <p className="text-xs text-green-700">{comparison.periodo2?.mes}/{comparison.periodo2?.anio}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Total trámites</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-green-600">{advancedMetrics.period2.total}</span>
                            <div className="flex items-center text-xs">
                              {advancedMetrics.period2.total > advancedMetrics.period1.total ? (
                                <FaArrowUp className="w-3 h-3 text-green-500 mr-1" />
                              ) : advancedMetrics.period2.total < advancedMetrics.period1.total ? (
                                <FaArrowDown className="w-3 h-3 text-red-500 mr-1" />
                              ) : (
                                <FaMinus className="w-3 h-3 text-gray-500 mr-1" />
                              )}
                              <span className={`${
                                advancedMetrics.period2.total > advancedMetrics.period1.total ? 'text-green-600' :
                                advancedMetrics.period2.total < advancedMetrics.period1.total ? 'text-red-600' :
                                'text-gray-600'
                              }`}>
                                {advancedMetrics.period2.total > advancedMetrics.period1.total ? '+' : ''}
                                {advancedMetrics.period2.total - advancedMetrics.period1.total}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Nivel digitalización</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-purple-600">{advancedMetrics.period2.avgDigitalization.toFixed(2)}/5.0</span>
                            {Math.abs(advancedMetrics.period2.avgDigitalization - advancedMetrics.period1.avgDigitalization) > 0.01 && (
                              <div className="flex items-center">
                                {getChangeIcon(advancedMetrics.period2.avgDigitalization - advancedMetrics.period1.avgDigitalization)}
                                <span className={`text-sm font-bold ml-1 ${getChangeColor(advancedMetrics.period2.avgDigitalization - advancedMetrics.period1.avgDigitalization)}`}>
                                  {advancedMetrics.period2.avgDigitalization > advancedMetrics.period1.avgDigitalization ? '+' : ''}{(advancedMetrics.period2.avgDigitalization - advancedMetrics.period1.avgDigitalization).toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Trámites finalizados</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-orange-600">{advancedMetrics.period2.simplificationProgress.toFixed(1)}%</span>
                            <div className="flex items-center text-xs">
                              {advancedMetrics.period2.simplificationProgress > advancedMetrics.period1.simplificationProgress ? (
                                <FaArrowUp className="w-3 h-3 text-green-500 mr-1" />
                              ) : advancedMetrics.period2.simplificationProgress < advancedMetrics.period1.simplificationProgress ? (
                                <FaArrowDown className="w-3 h-3 text-red-500 mr-1" />
                              ) : (
                                <FaMinus className="w-3 h-3 text-gray-500 mr-1" />
                              )}
                              <span className={`${
                                advancedMetrics.period2.simplificationProgress > advancedMetrics.period1.simplificationProgress ? 'text-green-600' :
                                advancedMetrics.period2.simplificationProgress < advancedMetrics.period1.simplificationProgress ? 'text-red-600' :
                                'text-gray-600'
                              }`}>
                                {advancedMetrics.period2.simplificationProgress > advancedMetrics.period1.simplificationProgress ? '+' : ''}
                                {(advancedMetrics.period2.simplificationProgress - advancedMetrics.period1.simplificationProgress).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Avance simplificación</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-green-600">{advancedMetrics.period2.weightedSimplificationProgress.toFixed(1)}%</span>
                            <div className="flex items-center text-xs">
                              {advancedMetrics.period2.weightedSimplificationProgress > advancedMetrics.period1.weightedSimplificationProgress ? (
                                <FaArrowUp className="w-3 h-3 text-green-500 mr-1" />
                              ) : advancedMetrics.period2.weightedSimplificationProgress < advancedMetrics.period1.weightedSimplificationProgress ? (
                                <FaArrowDown className="w-3 h-3 text-red-500 mr-1" />
                              ) : (
                                <FaMinus className="w-3 h-3 text-gray-500 mr-1" />
                              )}
                              <span className={`${
                                advancedMetrics.period2.weightedSimplificationProgress > advancedMetrics.period1.weightedSimplificationProgress ? 'text-green-600' :
                                advancedMetrics.period2.weightedSimplificationProgress < advancedMetrics.period1.weightedSimplificationProgress ? 'text-red-600' :
                                'text-gray-600'
                              }`}>
                                {advancedMetrics.period2.weightedSimplificationProgress > advancedMetrics.period1.weightedSimplificationProgress ? '+' : ''}
                                {(advancedMetrics.period2.weightedSimplificationProgress - advancedMetrics.period1.weightedSimplificationProgress).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Línea divisoria visual */}
                  <div className="absolute left-1/2 top-20 bottom-6 w-px bg-gradient-to-b from-blue-200 via-gray-300 to-green-200 transform -translate-x-1/2"></div>
                </div>

                  {/* Distribución por Niveles de Digitalización - Gráfico Horizontal Mejorado */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <h6 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <FaChartLine className="w-5 h-5 mr-2 text-purple-600" />
                      Distribución de Trámites por Nivel de Digitalización
                    </h6>
                    
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">¿Qué muestra este gráfico?</span> Compara cuántos trámites están en cada nivel de madurez digital entre dos períodos.
                        Los niveles van desde "Inicial" (trámites básicos) hasta "Completo" (totalmente digitalizados).
                      </p>
                    </div>
                    
                    {/* Gráfico de Barras con Porcentajes */}
                    <div className="space-y-6">
                      {Object.keys(advancedMetrics.period1.stages).map((stage, index) => {
                        const count1 = advancedMetrics.period1.stages[stage];
                        const count2 = advancedMetrics.period2.stages[stage];
                        
                        // Calcular porcentajes respecto al total de cada período
                        const percentage1 = advancedMetrics.period1.total > 0 ? (count1 / advancedMetrics.period1.total) * 100 : 0;
                        const percentage2 = advancedMetrics.period2.total > 0 ? (count2 / advancedMetrics.period2.total) * 100 : 0;
                        
                        // Ancho de barras basado en porcentajes (escala 0-100%)
                        const width1 = Math.max(percentage1, 2);
                        const width2 = Math.max(percentage2, 2);
                        const percentageDiff = percentage2 - percentage1;
                        
                        return (
                          <div key={stage} className="space-y-2">
                            {/* Título del nivel */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold">
                                  {index + 1}
                                </div>
                                <span className="text-sm font-semibold text-gray-800">{stage}</span>
                              </div>
                              
                              {Math.abs(percentageDiff) > 0.1 && (
                                <div className="flex items-center space-x-1">
                                  {getChangeIcon(percentageDiff)}
                                  <span className={`text-sm font-bold ${getChangeColor(percentageDiff)}`}>
                                    {percentageDiff > 0 ? '+' : ''}{percentageDiff.toFixed(1)}%
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* Barras comparativas con porcentajes */}
                            <div className="space-y-1">
                              {/* Período 1 */}
                              <div className="flex items-center space-x-3">
                                <div className="w-20 text-xs text-blue-700 font-medium">{comparison.periodo1?.descripcion}</div>
                                <div className="flex-1 relative">
                                  <div className="w-full bg-blue-100 rounded-full h-6">
                                    <div 
                                      className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2 text-white text-xs font-bold transition-all duration-500"
                                      style={{ width: `${width1}%` }}
                                    >
                                      {percentage1 > 5 && `${percentage1.toFixed(1)}%`}
                                    </div>
                                  </div>
                                </div>
                                <div className="w-16 text-xs text-gray-600 text-right">
                                  {count1} ({percentage1.toFixed(1)}%)
                                </div>
                              </div>
                              
                              {/* Período 2 */}
                              <div className="flex items-center space-x-3">
                                <div className="w-20 text-xs text-green-700 font-medium">{comparison.periodo2?.descripcion}</div>
                                <div className="flex-1 relative">
                                  <div className="w-full bg-green-100 rounded-full h-6">
                                    <div 
                                      className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2 text-white text-xs font-bold transition-all duration-500"
                                      style={{ width: `${width2}%` }}
                                    >
                                      {percentage2 > 5 && `${percentage2.toFixed(1)}%`}
                                    </div>
                                  </div>
                                </div>
                                <div className="w-16 text-xs text-gray-600 text-right">
                                  {count2} ({percentage2.toFixed(1)}%)
                                </div>
                              </div>
                            </div>
                            
                            {/* Línea separadora */}
                            {index < Object.keys(advancedMetrics.period1.stages).length - 1 && (
                              <div className="border-t border-gray-200 mt-4"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Resumen estadístico */}
                    <div className="mt-6 grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{advancedMetrics.period1.total}</div>
                        <div className="text-xs text-blue-700">{comparison.periodo1?.descripcion}</div>
                        <div className="text-xs text-gray-600">Total trámites</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{advancedMetrics.period2.total}</div>
                        <div className="text-xs text-green-700">{comparison.periodo2?.descripcion}</div>
                        <div className="text-xs text-gray-600">Total trámites</div>
                      </div>
                    </div>
                  </div>

                  {/* Diagrama de Flujo Circular - Etapas de Simplificación */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h6 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <FaProjectDiagram className="w-5 h-5 mr-2 text-orange-600" />
                      Flujo de Trámites por Etapa de la Ruta de Simplificación
                    </h6>
                    
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">¿Qué muestra este gráfico?</span> Visualiza el avance secuencial de los trámites en cada etapa de la Ruta de Simplificación.
                        El tamaño de cada círculo representa la cantidad de trámites, facilitando la identificación de cuellos de botella.
                      </p>
                    </div>
                    
                    {/* Selector de período */}
                    <div className="flex justify-center mb-6">
                      <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                        <button
                          onClick={() => setSelectedFlowPeriod('period1')}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                            selectedFlowPeriod === 'period1'
                              ? 'bg-blue-500 text-white shadow-sm'
                              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            {comparison.periodo1?.descripcion}
                          </div>
                        </button>
                        <button
                          onClick={() => setSelectedFlowPeriod('period2')}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                            selectedFlowPeriod === 'period2'
                              ? 'bg-green-500 text-white shadow-sm'
                              : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            {comparison.periodo2?.descripcion}
                          </div>
                        </button>
                      </div>
                    </div>
                    
                    {/* Diagrama de flujo con círculos comparativos */}
                    <div className={`relative p-6 rounded-lg transition-all duration-300 ${
                      selectedFlowPeriod === 'period1' 
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100' 
                        : 'bg-gradient-to-r from-green-50 to-green-100'
                    }`}>
                      {/* Línea conectora de fondo */}
                      <div className={`absolute top-1/2 left-8 right-8 h-1 rounded-full transform -translate-y-1/2 z-0 transition-all duration-300 ${
                        selectedFlowPeriod === 'period1'
                          ? 'bg-gradient-to-r from-blue-300 via-blue-200 to-blue-300'
                          : 'bg-gradient-to-r from-green-300 via-green-200 to-green-300'
                      }`}></div>
                      
                      {/* Contenedor de nodos */}
                      <div className="relative flex justify-between items-center z-10">
                        {Object.keys(advancedMetrics.period1.simplificationStages).map((stage, index) => {
                          const count1 = advancedMetrics.period1.simplificationStages[stage];
                          const count2 = advancedMetrics.period2.simplificationStages[stage];
                          const maxCount = Math.max(...Object.values(advancedMetrics.period1.simplificationStages), ...Object.values(advancedMetrics.period2.simplificationStages), 1);
                          
                          // Seleccionar datos según el período activo
                          const currentCount = selectedFlowPeriod === 'period1' ? count1 : count2;
                          const currentPeriod = selectedFlowPeriod === 'period1' ? comparison.periodo1 : comparison.periodo2;
                          const otherCount = selectedFlowPeriod === 'period1' ? count2 : count1;
                          const difference = selectedFlowPeriod === 'period1' ? count1 - count2 : count2 - count1;
                          
                          // Calcular tamaño de círculo (40-80px)
                          const size = Math.max(40, Math.min(80, (currentCount / maxCount) * 80));
                          
                          // Colores por fase
                          const phaseColors = ['#4e73df', '#1cc88a', '#f6c23e', '#e74a3b', '#6f42c1', '#36b9cc', '#f093fb', '#4facfe', '#43e97b', '#38f9d7', '#ffecd2'];
                          const phaseColor = phaseColors[index] || '#4e73df';
                          
                          // Color del período seleccionado
                          const periodColor = selectedFlowPeriod === 'period1' ? '#3b82f6' : '#10b981';
                          
                          return (
                            <div key={stage} className="flex flex-col items-center relative group">
                              {/* Círculo único */}
                              <div className="relative mb-6">
                                <div 
                                  className="rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 border-white transition-all duration-500 hover:scale-110"
                                  style={{ 
                                    width: `${size}px`, 
                                    height: `${size}px`,
                                    fontSize: `${Math.max(12, size / 4)}px`,
                                    backgroundColor: phaseColor,
                                    background: `radial-gradient(circle at 30% 30%, ${phaseColor}dd, ${phaseColor})`
                                  }}
                                >
                                  {currentCount}
                                </div>
                                
                                {/* Indicador de cambio comparativo - solo para período 2 */}
                                {selectedFlowPeriod === 'period2' && difference !== 0 && (
                                  <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                    difference > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                  }`}>
                                    {difference > 0 ? '+' : ''}{Math.abs(difference)}
                                  </div>
                                )}
                              </div>
                              
                              {/* Etiqueta de etapa - posicionada más abajo para evitar solapamiento */}
                              <div className="text-center max-w-24 mt-2">
                                <div className="text-xs font-medium text-gray-700 leading-tight bg-white px-2 py-1 rounded shadow-sm">
                                  {stage.length > 15 ? stage.substring(0, 15) + '...' : stage}
                                </div>
                                
                                {/* Valor actual */}
                                <div className="mt-2">
                                  <div className="text-sm font-bold" style={{ color: periodColor }}>
                                    {currentCount}
                                  </div>
                                  {selectedFlowPeriod === 'period2' && difference !== 0 && (
                                    <div className={`text-xs font-medium ${difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {difference > 0 ? '↗️ +' : '↘️ '}{Math.abs(difference)} vs otro período
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Tooltip detallado */}
                              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-20">
                                <div className="font-semibold">{stage}</div>
                                <div>{currentPeriod?.descripcion}: {currentCount} trámites</div>
                                <div className="text-gray-300">
                                  {selectedFlowPeriod === 'period1' ? comparison.periodo2?.descripcion : comparison.periodo1?.descripcion}: {otherCount} trámites
                                </div>
                                {difference !== 0 && (
                                  <div className={`font-bold ${difference > 0 ? 'text-green-300' : 'text-red-300'}`}>
                                    Diferencia: {difference > 0 ? '+' : ''}{difference}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                  </div>
                </div>
              )}

              {activeTab === 'ranking' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaTrophy className="w-5 h-5 mr-2 text-yellow-600" />
                    Ranking de Secretarías por Mejora en Simplificación
                  </h4>
                  
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-blue-700">📊 Metodología del Ranking:</span> Se evalúa el progreso real de cada secretaría comparando:
                      <strong> (1) Cambio en avance de simplificación</strong>, <strong>(2) Variación en trámites en proceso</strong>, y <strong>(3) Nivel promedio de digitalización</strong>.
                    </p>
                  </div>


                  {secretariaRanking.length > 0 ? (
                    <>
                      {/* Estadísticas de tendencias - Layout mejorado para nombres */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1 pr-2">
                              <div className="text-xs opacity-90 mb-1">Mejor Desempeño</div>
                              <div className="text-sm font-bold leading-tight" title={(() => {
                                const bestSecretaria = secretariaRanking.reduce((best, current) => {
                                  const bestScore = calculateRankingScore(best);
                                  const currentScore = calculateRankingScore(current);
                                  return currentScore > bestScore ? current : best;
                                });
                                return bestSecretaria?.nombre || 'N/A';
                              })()}>
                                {(() => {
                                  const bestSecretaria = secretariaRanking.reduce((best, current) => {
                                    const bestScore = calculateRankingScore(best);
                                    const currentScore = calculateRankingScore(current);
                                    return currentScore > bestScore ? current : best;
                                  });
                                  const nombre = bestSecretaria?.nombre || 'N/A';
                                  // Mostrar más caracteres y usar line-clamp para múltiples líneas
                                  return String(nombre);
                                })()}
                              </div>
                              <div className="text-xs opacity-80 mt-1">
                                +{(() => {
                                  const bestSecretaria = secretariaRanking.reduce((best, current) => {
                                    const bestScore = calculateRankingScore(best);
                                    const currentScore = calculateRankingScore(current);
                                    return currentScore > bestScore ? current : best;
                                  });
                                  return calculateRankingScore(bestSecretaria).toFixed(1);
                                })()} pts
                              </div>
                            </div>
                            <FaArrowUp className="w-4 h-4 opacity-80 mt-1 flex-shrink-0" />
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1 pr-2">
                              <div className="text-xs opacity-90 mb-1">Promedio General</div>
                              <div className="text-sm font-bold">
                                {(secretariaRanking.reduce((sum, s) => sum + calculateRankingScore(s), 0) / secretariaRanking.length).toFixed(1)} pts
                              </div>
                              <div className="text-xs opacity-80 mt-1">
                                {secretariaRanking.filter(s => calculateRankingScore(s) > 0).length} mejoraron
                              </div>
                            </div>
                            <FaEquals className="w-4 h-4 opacity-80 mt-1 flex-shrink-0" />
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1 pr-2">
                              <div className="text-xs opacity-90 mb-1">Necesita Atención</div>
                              <div className="text-sm font-bold leading-tight" title={(() => {
                                const worstSecretaria = secretariaRanking.reduce((worst, current) => {
                                  const worstScore = calculateRankingScore(worst);
                                  const currentScore = calculateRankingScore(current);
                                  return currentScore < worstScore ? current : worst;
                                });
                                return worstSecretaria?.nombre || 'N/A';
                              })()}>
                                {(() => {
                                  const worstSecretaria = secretariaRanking.reduce((worst, current) => {
                                    const worstScore = calculateRankingScore(worst);
                                    const currentScore = calculateRankingScore(current);
                                    return currentScore < worstScore ? current : worst;
                                  });
                                  const nombre = worstSecretaria?.nombre || 'N/A';
                                  // Mostrar el nombre completo
                                  return String(nombre);
                                })()}
                              </div>
                              <div className="text-xs opacity-80 mt-1">
                                {(() => {
                                  const worstSecretaria = secretariaRanking.reduce((worst, current) => {
                                    const worstScore = calculateRankingScore(worst);
                                    const currentScore = calculateRankingScore(current);
                                    return currentScore < worstScore ? current : worst;
                                  });
                                  return calculateRankingScore(worstSecretaria).toFixed(1);
                                })()} pts
                              </div>
                            </div>
                            <FaArrowDown className="w-4 h-4 opacity-80 mt-1 flex-shrink-0" />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <FaTrophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos para mostrar</h3>
                      <p className="text-gray-600">
                        {period1Data.length === 0 && period2Data.length === 0 
                          ? 'Selecciona dos períodos para comparar y generar el ranking.'
                          : 'No se encontraron secretarías con datos válidos para comparar.'
                        }
                      </p>
                    </div>
                  )}
                  
                  {/* Ranking principal mejorado */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
                      <h5 className="font-semibold flex items-center">
                        <FaTrophy className="w-4 h-4 mr-2" />
                        Ranking Completo por Mejora en Simplificación ({comparison.periodo1?.descripcion} → {comparison.periodo2?.descripcion})
                      </h5>
                      <p className="text-sm opacity-90 mt-1">
                        Haz clic en cualquier secretaría para ver el desglose detallado de su puntuación
                      </p>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {secretariaRanking
                        .sort((a, b) => calculateRankingScore(b) - calculateRankingScore(a))
                        .map((secretaria, index) => {
                          const score = calculateRankingScore(secretaria);
                          // Calcular cambios usando el Índice de Mejora Porcentual (IMP)
                          const period1Effort = calculatePeriodEffortIndex(secretaria.period1.tramites || []);
                          const period2Effort = calculatePeriodEffortIndex(secretaria.period2.tramites || []);
                          const period1TotalPoints = calculatePeriodTotalPoints(secretaria.period1.tramites || []);
                          const period2TotalPoints = calculatePeriodTotalPoints(secretaria.period2.tramites || []);
                          const improvementPercentage = period1TotalPoints > 0 ? 
                            ((period2TotalPoints - period1TotalPoints) / period1TotalPoints) * 100 : 
                            (period2TotalPoints > 0 ? 100 : 0);
                          const effortChange = improvementPercentage;
                          
                          const processChange = secretaria.period2.inProgress - secretaria.period1.inProgress;
                          const digitalizationChange = secretaria.period2.avgDigitalization - secretaria.period1.avgDigitalization;
                          const isExpanded = expandedRankingDetails.has(secretaria.nombre);
                          
                          // Calcular componentes del score con pesos validados
                          const effortScore = improvementPercentage * 0.006;
                          const digitalizationScore = digitalizationChange * 4.0;
                          
                          return (
                            <div key={`ranking-${index}-${secretaria?.nombre || 'unknown'}`}>
                              <div 
                                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                                  index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''
                                } ${isExpanded ? 'bg-blue-50' : ''}`}
                                onClick={() => toggleRankingDetails(secretaria.nombre)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center flex-1">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-4 ${
                                      index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 
                                      index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' : 
                                      index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' : 
                                      score > 0 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                      score < 0 ? 'bg-gradient-to-r from-red-400 to-red-600' : 'bg-gradient-to-r from-gray-400 to-gray-500'
                                    }`}>
                                      {index + 1}
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900 mb-1 flex items-center">
                                        {String(secretaria?.nombre || 'N/A')}
                                        {isExpanded ? (
                                          <FaChevronDown className="w-3 h-3 ml-2 text-gray-400" />
                                        ) : (
                                          <FaChevronRight className="w-3 h-3 ml-2 text-gray-400" />
                                        )}
                                      </div>
                                      <div className="grid grid-cols-2 gap-4 text-xs">
                                        <div className="flex items-center">
                                          <FaChartLine className="w-3 h-3 mr-1 text-blue-500" />
                                          <span className="text-gray-600">IMP:</span>
                                          <span className={`ml-1 font-medium ${
                                            improvementPercentage > 0 ? 'text-green-600' : 
                                            improvementPercentage < 0 ? 'text-red-600' : 'text-gray-600'
                                          }`}>
                                            {improvementPercentage > 0 ? '+' : ''}{improvementPercentage.toFixed(1)}%
                                          </span>
                                        </div>
                                        <div className="flex items-center">
                                          <FaWifi className="w-3 h-3 mr-1 text-cyan-500" />
                                          <span className="text-gray-600">Digital:</span>
                                          <span className={`ml-1 font-medium ${
                                            digitalizationChange > 0 ? 'text-green-600' : 
                                            digitalizationChange < 0 ? 'text-red-600' : 'text-gray-600'
                                          }`}>
                                            {digitalizationChange > 0 ? '+' : ''}{digitalizationChange.toFixed(2)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right ml-4">
                                    <div className={`text-xl font-bold ${
                                      score > 0 ? 'text-green-600' : 
                                      score < 0 ? 'text-red-600' : 'text-gray-600'
                                    }`}>
                                      {score > 0 ? '+' : ''}{score.toFixed(1)}
                                    </div>
                                    <div className="text-xs text-gray-500">% mejora</div>
                                    <div className="flex items-center mt-1">
                                      {score > 0 ? (
                                        <FaArrowUp className="w-3 h-3 text-green-500 mr-1" />
                                      ) : score < 0 ? (
                                        <FaArrowDown className="w-3 h-3 text-red-500 mr-1" />
                                      ) : (
                                        <FaEquals className="w-3 h-3 text-gray-400 mr-1" />
                                      )}
                                      <span className={`text-xs font-medium ${
                                        score > 0 ? 'text-green-600' : 
                                        score < 0 ? 'text-red-600' : 'text-gray-600'
                                      }`}>
                                        {score > 0 ? 'Mejora' : score < 0 ? 'Declive' : 'Estable'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Panel de detalles expandible */}
                              {isExpanded && (
                                <div className="bg-gray-50 border-t border-gray-200 p-4">
                                  <h6 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    <FaProjectDiagram className="w-4 h-4 mr-2 text-blue-600" />
                                    Desglose Detallado de Puntuación
                                  </h6>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Datos del Período 1 */}
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                      <h7 className="font-medium text-blue-700 mb-3 flex items-center">
                                        <FaCalendarAlt className="w-3 h-3 mr-1" />
                                        {comparison.periodo1?.descripcion}
                                      </h7>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Total trámites:</span>
                                          <span className="font-medium">{secretaria.period1.total}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Trámites publicados:</span>
                                          <span className="font-medium">{secretaria.period1.published}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">En proceso:</span>
                                          <span className="font-medium">{secretaria.period1.inProgress}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Puntos totales:</span>
                                          <span className="font-medium">{period1TotalPoints} pts</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Promedio por trámite:</span>
                                          <span className="font-medium">{period1Effort.toFixed(2)} pts</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Nivel digitalización:</span>
                                          <span className="font-medium">{secretaria.period1.avgDigitalization.toFixed(2)}</span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Datos del Período 2 */}
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                      <h7 className="font-medium text-green-700 mb-3 flex items-center">
                                        <FaCalendarAlt className="w-3 h-3 mr-1" />
                                        {comparison.periodo2?.descripcion}
                                      </h7>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Total trámites:</span>
                                          <span className="font-medium">{secretaria.period2.total}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Trámites publicados:</span>
                                          <span className="font-medium">{secretaria.period2.published}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">En proceso:</span>
                                          <span className="font-medium">{secretaria.period2.inProgress}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Puntos totales:</span>
                                          <span className="font-medium">{period2TotalPoints} pts</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Promedio por trámite:</span>
                                          <span className="font-medium">{period2Effort.toFixed(2)} pts</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Nivel digitalización:</span>
                                          <span className="font-medium">{secretaria.period2.avgDigitalization.toFixed(2)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Cálculo de puntuación */}
                                  <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
                                    <div className="font-medium text-purple-700 mb-3 flex items-center">
                                      <FaCogs className="w-3 h-3 mr-1" />
                                      Cálculo de Puntuación Final
                                    </div>
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                      <div className="font-medium text-blue-700">Índice de Mejora Porcentual (IMP)</div>
                                      <div className="text-xs text-gray-600 mt-1">Ranking de Simplificación</div>
                                      <div className="text-xs text-gray-500 mt-2">
                                        ({period2TotalPoints} - {period1TotalPoints}) ÷ {period1TotalPoints} × 100
                                      </div>
                                      <div className="text-2xl font-bold text-blue-600 mt-2">
                                        <span className={`${
                                          improvementPercentage > 0 ? 'text-green-600' : 
                                          improvementPercentage < 0 ? 'text-red-600' : 'text-gray-600'
                                        }`}>
                                          {improvementPercentage.toFixed(1)}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'detailed' && (
                <div className="space-y-6">
                  {/* Filtros */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex-1 min-w-64">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Filtrar por Secretaría
                        </label>
                        <select
                          value={filterSecretaria}
                          onChange={(e) => setFilterSecretaria(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Todas las secretarías</option>
                          {secretarias.map((secretaria, index) => (
                            <option key={`secretaria-${index}-${secretaria}`} value={secretaria}>
                              {String(secretaria)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="showOnlyChanges"
                          checked={showOnlyChanges}
                          onChange={(e) => setShowOnlyChanges(e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="showOnlyChanges" className="text-sm text-gray-700">
                          Solo mostrar cambios
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Comparación agrupada por secretaría */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Comparación Detallada por Secretaría ({filteredComparisons.length} registros)
                    </h4>
                    
                    {Object.entries(groupedComparisons).map(([secretaria, tramites]) => (
                      <div key={secretaria} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleSecretaria(secretaria)}
                          className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left"
                        >
                          <div className="flex items-center">
                            {expandedSecretarias.has(secretaria) ? (
                              <FaChevronDown className="w-4 h-4 mr-3 text-gray-500" />
                            ) : (
                              <FaChevronRight className="w-4 h-4 mr-3 text-gray-500" />
                            )}
                            <div>
                              <h5 className="font-medium text-gray-900">{secretaria}</h5>
                              <p className="text-sm text-gray-500">{tramites.length} trámites</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="text-sm text-gray-600">
                                Nuevos: {tramites.filter(t => t.cambios.nuevo_en_periodo2).length}
                              </div>
                              <div className="text-sm text-gray-600">
                                Modificados: {tramites.filter(t => t.cambios.nivel_digitalizacion !== 0).length}
                              </div>
                            </div>
                          </div>
                        </button>
                        
                        {expandedSecretarias.has(secretaria) && (
                          <div className="border-t border-gray-200">
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Trámite
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Nivel Digitalización
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Publicado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Estado
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {tramites.map((comp, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                      <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{comp.tramite}</div>
                                      </td>
                                      <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                          <span className="text-sm text-gray-600">
                                            {comp.periodo1?.nivel_digitalizacion?.toFixed(1) || 'N/A'}
                                          </span>
                                          <span className="text-gray-400">→</span>
                                          <span className="text-sm text-gray-900">
                                            {comp.periodo2?.nivel_digitalizacion?.toFixed(1) || 'N/A'}
                                          </span>
                                          {comp.cambios.nivel_digitalizacion !== 0 && (
                                            <div className="flex items-center space-x-1">
                                              {getChangeIcon(comp.cambios.nivel_digitalizacion)}
                                              <span className={`text-xs ${getChangeColor(comp.cambios.nivel_digitalizacion)}`}>
                                                {comp.cambios.nivel_digitalizacion > 0 ? '+' : ''}
                                                {comp.cambios.nivel_digitalizacion?.toFixed(1)}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                          <span className={`px-2 py-1 text-xs rounded-full ${
                                            comp.periodo1?.publicado 
                                              ? 'bg-green-100 text-green-800' 
                                              : 'bg-gray-100 text-gray-800'
                                          }`}>
                                            {comp.periodo1?.publicado ? 'Sí' : 'No'}
                                          </span>
                                          <span className="text-gray-400">→</span>
                                          <span className={`px-2 py-1 text-xs rounded-full ${
                                            comp.periodo2?.publicado 
                                              ? 'bg-green-100 text-green-800' 
                                              : 'bg-gray-100 text-gray-800'
                                          }`}>
                                            {comp.periodo2?.publicado ? 'Sí' : 'No'}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                          {comp.cambios.nuevo_en_periodo2 && (
                                            <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                              <FaPlus className="w-2 h-2 mr-1" />
                                              Nuevo
                                            </span>
                                          )}
                                          {comp.cambios.eliminado_en_periodo2 && (
                                            <span className="inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                              <FaMinus className="w-2 h-2 mr-1" />
                                              Eliminado
                                            </span>
                                          )}
                                          {comp.cambios.cambio_publicacion && (
                                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                              Cambio Pub.
                                            </span>
                                          )}
                                          {comp.cambios.nivel_digitalizacion === 0 && 
                                           !comp.cambios.nuevo_en_periodo2 && 
                                           !comp.cambios.eliminado_en_periodo2 && 
                                           !comp.cambios.cambio_publicacion && (
                                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                              Sin cambios
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
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

export default PeriodComparison;
