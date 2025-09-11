import React, { useState, useEffect } from 'react';
import { FaChartBar, FaSpinner, FaDownload } from 'react-icons/fa';
import { Bar, Doughnut } from 'react-chartjs-2';
import axios from 'axios';

const PeriodStatistics = ({ periodos, selectedPeriod, onPeriodSelect, onError }) => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedPeriod) {
      loadStatistics(selectedPeriod.id);
    }
  }, [selectedPeriod]);

  const loadStatistics = async (periodoId) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/csv/estadisticas/${periodoId}`);
      setStatistics(response.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      onError('Error al cargar estadísticas del período');
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = () => {
    if (!statistics || statistics.length === 0) return null;

    // Datos para gráfico de barras - Promedio de digitalización por secretaría
    const barData = {
      labels: statistics.map(s => s.secretaria.length > 30 ? 
        s.secretaria.substring(0, 30) + '...' : s.secretaria),
      datasets: [{
        label: 'Promedio Digitalización',
        data: statistics.map(s => parseFloat(s.promedio_digitalizacion) || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      }]
    };

    // Datos para gráfico circular - Distribución de trámites publicados
    const totalTramites = statistics.reduce((sum, s) => sum + parseInt(s.total_tramites), 0);
    const totalPublicados = statistics.reduce((sum, s) => sum + parseInt(s.tramites_publicados), 0);
    
    const doughnutData = {
      labels: ['Publicados', 'No Publicados'],
      datasets: [{
        data: [totalPublicados, totalTramites - totalPublicados],
        backgroundColor: ['#10b981', '#ef4444'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };

    return { barData, doughnutData, totalTramites, totalPublicados };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Estadísticas por Secretaría'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Estado de Publicación'
      }
    }
  };

  const chartData = generateChartData();

  return (
    <div className="space-y-6">
      {/* Selector de período */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Estadísticas por Período
        </h3>
        
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Período
          </label>
          <select
            value={selectedPeriod?.id || ''}
            onChange={(e) => {
              const periodo = periodos.find(p => p.id === parseInt(e.target.value));
              onPeriodSelect(periodo);
            }}
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

      {/* Contenido de estadísticas */}
      {selectedPeriod && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="animate-spin w-8 h-8 text-blue-500 mr-3" />
              <span className="text-gray-600">Cargando estadísticas...</span>
            </div>
          ) : statistics && statistics.length > 0 ? (
            <>
              {/* Resumen general */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Resumen - {selectedPeriod.descripcion}
                </h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {statistics.length}
                    </div>
                    <div className="text-sm text-blue-700">Secretarías</div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {chartData?.totalTramites || 0}
                    </div>
                    <div className="text-sm text-green-700">Total Trámites</div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {chartData?.totalPublicados || 0}
                    </div>
                    <div className="text-sm text-purple-700">Publicados</div>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {chartData ? 
                        ((chartData.totalPublicados / chartData.totalTramites) * 100).toFixed(1) 
                        : 0}%
                    </div>
                    <div className="text-sm text-yellow-700">% Publicación</div>
                  </div>
                </div>
              </div>

              {/* Gráficos */}
              {chartData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gráfico de barras */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="h-80">
                      <Bar data={chartData.barData} options={chartOptions} />
                    </div>
                  </div>

                  {/* Gráfico circular */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="h-80">
                      <Doughnut data={chartData.doughnutData} options={doughnutOptions} />
                    </div>
                  </div>
                </div>
              )}

              {/* Tabla detallada */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Estadísticas Detalladas por Secretaría
                  </h4>
                  <button
                    onClick={() => {
                      // Exportar datos como CSV
                      const csvContent = [
                        ['Secretaría', 'Total Trámites', 'Promedio Digitalización', 'Trámites Publicados', 'Trámites Avanzados'],
                        ...statistics.map(s => [
                          s.secretaria,
                          s.total_tramites,
                          parseFloat(s.promedio_digitalizacion).toFixed(2),
                          s.tramites_publicados,
                          s.tramites_avanzados
                        ])
                      ].map(row => row.join(',')).join('\n');
                      
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `estadisticas_${selectedPeriod.descripcion.replace(/\s+/g, '_')}.csv`;
                      a.click();
                      window.URL.revokeObjectURL(url);
                    }}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    <FaDownload className="w-3 h-3 mr-2" />
                    Exportar CSV
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Secretaría
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Trámites
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Promedio Digitalización
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Publicados
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avanzados (≥3.0)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          % Publicación
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {statistics.map((stat, index) => {
                        const totalTramites = parseInt(stat.total_tramites);
                        const publicados = parseInt(stat.tramites_publicados);
                        const porcentajePublicacion = totalTramites > 0 ? 
                          ((publicados / totalTramites) * 100).toFixed(1) : 0;
                        
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {stat.secretaria}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {stat.total_tramites}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <span className="text-sm text-gray-900">
                                  {parseFloat(stat.promedio_digitalizacion).toFixed(2)}
                                </span>
                                <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ 
                                      width: `${(parseFloat(stat.promedio_digitalizacion) / 5) * 100}%` 
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-900">
                                {stat.tramites_publicados}
                              </span>
                              <span className="text-xs text-gray-500 ml-1">
                                / {stat.total_tramites}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {stat.tramites_avanzados}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                porcentajePublicacion >= 80 ? 'bg-green-100 text-green-800' :
                                porcentajePublicacion >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {porcentajePublicacion}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FaChartBar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No hay datos estadísticos disponibles para este período</p>
            </div>
          )}
        </div>
      )}

      {!selectedPeriod && (
        <div className="text-center py-12 text-gray-500">
          <FaChartBar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Selecciona un período para ver las estadísticas</p>
        </div>
      )}
    </div>
  );
};

export default PeriodStatistics;
