import React, { useState, useEffect } from 'react';
import TramiteCardCompact from './TramiteCardCompact';
import { Doughnut, Radar } from 'react-chartjs-2';
import { COLORS } from '../../styles/colors';
import FlowDiagram from './FlowDiagram';

const SecretariaModal = ({ secretaria, tramites, isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTramites, setFilteredTramites] = useState([]);
  const [expandedTramites, setExpandedTramites] = useState({});
  
  // Filtrar trámites cuando cambia el término de búsqueda o los trámites
  useEffect(() => {
    if (!tramites || !Array.isArray(tramites)) {
      setFilteredTramites([]);
      return;
    }
    
    const tramitesSecretaria = tramites.filter(t => t && t.secretaria_id === secretaria.id);
    
    if (searchTerm.trim() === '') {
      setFilteredTramites(tramitesSecretaria);
      return;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = tramitesSecretaria.filter(tramite => 
      tramite.nombre.toLowerCase().includes(lowerSearchTerm) ||
      tramite.descripcion?.toLowerCase().includes(lowerSearchTerm)
    );
    
    setFilteredTramites(filtered);
  }, [searchTerm, tramites, secretaria]);
  
  // Calcular estadísticas
  const calcularEstadisticas = () => {
    if (!tramites || !Array.isArray(tramites)) {
      return {
        totalTramites: 0,
        tramitesPublicados: 0,
        tramitesEnProceso: 0,
        nivelDigitalizacionPromedio: 0,
        porcentajeAvance: 0
      };
    }
    
    const tramitesSecretaria = tramites.filter(t => t && t.secretaria_id === secretaria.id);
    
    if (tramitesSecretaria.length === 0) {
      return {
        totalTramites: 0,
        tramitesPublicados: 0,
        tramitesEnProceso: 0,
        nivelDigitalizacionPromedio: 0,
        porcentajeAvance: 0
      };
    }
    
    const tramitesPublicados = tramitesSecretaria.filter(t => t.publicado === true).length;
    const tramitesEnProceso = tramitesSecretaria.length - tramitesPublicados;
    
    const nivelesDigitalizacion = tramitesSecretaria
      .map(t => parseFloat(t.nivel_digitalizacion))
      .filter(nivel => !isNaN(nivel));
    
    const sumaDigitalizacion = nivelesDigitalizacion.reduce((sum, nivel) => sum + nivel, 0);
    const promedioDigitalizacion = nivelesDigitalizacion.length > 0 ? 
      sumaDigitalizacion / nivelesDigitalizacion.length : 0;
    
    // Calcular porcentaje de avance en la ruta de simplificación
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
    
    return {
      totalTramites: tramitesSecretaria.length,
      tramitesPublicados,
      tramitesEnProceso,
      nivelDigitalizacionPromedio: promedioDigitalizacion,
      porcentajeAvance
    };
  };
  
  const estadisticas = calcularEstadisticas();
  
  // Manejar expansión de trámites
  const toggleTramiteExpand = (tramiteId) => {
    setExpandedTramites(prev => ({
      ...prev,
      [tramiteId]: !prev[tramiteId]
    }));
  };
  
  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null;
  
  // Obtener color según el porcentaje de avance
  const getAvanceColor = (porcentaje) => {
    if (porcentaje < 25) return '#ef4444'; // rojo
    if (porcentaje < 50) return '#f97316'; // naranja
    if (porcentaje < 75) return '#eab308'; // amarillo
    return '#22c55e'; // verde
  };
  
  const avanceColor = getAvanceColor(estadisticas.porcentajeAvance);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Encabezado del modal */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">
            {secretaria.nombre}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        {/* Contenido del modal */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Dashboard de estadísticas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Tarjeta de estadísticas principales */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <span className="bg-blue-100 p-2 rounded-md mr-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </span>
                Estadísticas de Simplificación
              </h3>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Porcentaje de avance de simplificación</span>
                  <span className="text-sm font-semibold text-gray-900">{estadisticas.porcentajeAvance.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="h-2.5 rounded-full" 
                    style={{ width: `${estadisticas.porcentajeAvance}%`, backgroundColor: avanceColor }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{estadisticas.tramitesEnProceso} en proceso de {estadisticas.totalTramites} totales</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center mb-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-700">Trámites en proceso</span>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-700">{estadisticas.tramitesEnProceso}</span>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">{estadisticas.tramitesEnProceso > 0 ? Math.round((estadisticas.tramitesEnProceso / estadisticas.totalTramites) * 100) : 0}%</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center mb-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-700">Nivel de Digitalización</span>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 flex justify-between items-center">
                    <span className="text-lg font-bold text-green-700">{estadisticas.nivelDigitalizacionPromedio.toFixed(1)}</span>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">/4.0</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Gráfico de distribución de trámites */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <span className="bg-purple-100 p-2 rounded-md mr-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
                  </svg>
                </span>
                Distribución de Trámites
              </h3>
              <div className="h-64 flex items-center justify-center">
                <Doughnut 
                  data={{
                    labels: ['Publicados', 'En Proceso'],
                    datasets: [{
                      data: [estadisticas.tramitesPublicados, estadisticas.tramitesEnProceso],
                      backgroundColor: [COLORS.green, COLORS.blue],
                      borderColor: ['#ffffff', '#ffffff'],
                      borderWidth: 2,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          usePointStyle: true,
                          padding: 20,
                          font: {
                            size: 12
                          }
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                          }
                        }
                      }
                    },
                    cutout: '70%'
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Estadísticas en tarjetas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Trámites</h3>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.totalTramites}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Trámites Publicados</h3>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.tramitesPublicados}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-orange-500">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Trámites en Proceso</h3>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.tramitesEnProceso}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Avance General</h3>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.porcentajeAvance.toFixed(1)}%</p>
            </div>
          </div>
          
          {/* Buscador */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input 
                type="text" 
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Buscar trámites..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Lista de trámites */}
          <div className="space-y-4">
            {filteredTramites.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron trámites</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Intenta con otra búsqueda.' : 'Esta secretaría aún no tiene trámites registrados.'}
                </p>
              </div>
            ) : (
              filteredTramites.map(tramite => (
                <TramiteCardCompact 
                  key={tramite.id} 
                  tramite={tramite} 
                  isExpanded={expandedTramites[tramite.id] || false}
                  toggleExpand={() => toggleTramiteExpand(tramite.id)}
                />
              ))
            )}
          </div>
        </div>
        
        {/* Pie del modal */}
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecretariaModal;
