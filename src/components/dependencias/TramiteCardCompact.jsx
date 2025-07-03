import React from 'react';
import PipelineStepsEvidence from './PipelineStepsEvidence';

const TramiteCardCompact = ({ tramite, isExpanded, toggleExpand }) => {
  // Renderizar mini estrellas para nivel de digitalización (0-4 escala)
  const renderNivelDigitalizacion = (nivel) => {
    // Asegurar que nivel sea un número válido entre 0 y 4
    const nivelNumerico = nivel && !isNaN(parseFloat(nivel)) ? parseFloat(nivel) : 0;
    const nivelLimitado = Math.min(Math.max(nivelNumerico, 0), 4); // Limitar entre 0 y 4
    
    // Mostrar solo el valor numérico y un pequeño indicador de color
    return (
      <div className="flex items-center">
        <div 
          className={`w-3 h-3 rounded-full mr-1 ${
            nivelLimitado < 1 ? 'bg-red-500' : 
            nivelLimitado < 2 ? 'bg-orange-500' : 
            nivelLimitado < 3 ? 'bg-yellow-500' : 
            nivelLimitado < 4 ? 'bg-green-400' : 'bg-green-600'
          }`}
        ></div>
        <span className="text-xs font-medium">{nivelLimitado.toFixed(1)}</span>
      </div>
    );
  };

  // Determinar si el trámite está completamente publicado
  const esTramitePublicado = tramite.publicado === true;
  
  // Calcular el progreso en el flujo de simplificación
  const calcularProgreso = () => {
    const pasos = [
      'capacitacion_modulo1', 'capacitacion_modulo2', 'boceto_modelado',
      'capacitacion_modulo3', 'bizagi_modelado', 'vo_bo_bizagi',
      'acciones_reingenieria', 'vo_bo_acciones_reingenieria',
      'boceto_acuerdo', 'vo_bo_acuerdo', 'publicado'
    ];
    
    const completados = pasos.filter(paso => tramite[paso] === true).length;
    return (completados / pasos.length) * 100;
  };
  
  const porcentajeProgreso = calcularProgreso();
  
  // Determinar color según el porcentaje de avance
  const getAvanceColor = (porcentaje) => {
    if (porcentaje < 25) return '#ef4444'; // rojo
    if (porcentaje < 50) return '#f97316'; // naranja
    if (porcentaje < 75) return '#eab308'; // amarillo
    return '#22c55e'; // verde
  };

  return (
    <div className="mb-2">
      <div 
        className={`bg-white rounded-lg shadow-sm border-l-4 ${esTramitePublicado ? 'border-green-500' : 'border-blue-300'} 
        hover:shadow-md transition-all duration-200 cursor-pointer`}
        onClick={() => toggleExpand(tramite.id)}
      >
        <div className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center">
                {esTramitePublicado && (
                  <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-1.5 py-0.5 rounded-full flex items-center">
                    <svg className="w-2 h-2 mr-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                  </span>
                )}
                <h3 className="text-sm font-bold text-gray-800 truncate">{tramite.tramite}</h3>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Nivel de digitalización */}
              {renderNivelDigitalizacion(tramite.nivel_digitalizacion)}
              
              {/* Barra de progreso */}
              <div className="w-16 flex items-center">
                <div className="w-10 bg-gray-200 rounded-full h-1.5 mr-1">
                  <div 
                    className="rounded-full h-1.5" 
                    style={{ 
                      width: `${porcentajeProgreso}%`,
                      backgroundColor: getAvanceColor(porcentajeProgreso)
                    }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">{Math.round(porcentajeProgreso)}%</span>
              </div>
              
              {/* Icono de expandir */}
              <svg 
                className={`w-4 h-4 text-gray-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contenido expandido */}
      {isExpanded && (
        <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
          <PipelineStepsEvidence tramite={tramite} />
        </div>
      )}
    </div>
  );
};

export default TramiteCardCompact;
