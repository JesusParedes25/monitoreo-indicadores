import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaCheckCircle, FaRegCircle } from 'react-icons/fa';
import PipelineStepsEvidence from './PipelineStepsEvidence';

const TramiteCardMini = ({ tramite }) => {
  const [expanded, setExpanded] = useState(false);

  // Calcular cuántos pasos se han completado
  const calcularPasosCompletados = () => {
    let pasosCompletados = 0;
    
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
    
    return pasosCompletados;
  };
  
  // Obtener el estado de cada paso
  const getPasoStatus = (paso) => {
    return tramite[paso] ? true : false;
  };
  
  // Definir los pasos principales a mostrar (simplificados)
  const pasosPrincipales = [
    { key: 'capacitacion_modulo1', label: 'Capacitación' },
    { key: 'bizagi_modelado', label: 'Modelado' },
    { key: 'acciones_reingenieria', label: 'Reingeniería' },
    { key: 'publicado', label: 'Publicado' }
  ];

  const pasosCompletados = calcularPasosCompletados();
  const porcentajeAvance = (pasosCompletados / 11) * 100;

  // Determinar color según el nivel de digitalización
  const getDigitalizacionColor = (nivel) => {
    const nivelNum = parseFloat(nivel);
    if (nivelNum <= 1) return '#ef4444'; // rojo
    if (nivelNum <= 2) return '#f97316'; // naranja
    if (nivelNum <= 3) return '#eab308'; // amarillo
    return '#22c55e'; // verde
  };

  // Determinar color según el porcentaje de avance
  const getAvanceColor = (porcentaje) => {
    if (porcentaje < 25) return '#ef4444'; // rojo
    if (porcentaje < 50) return '#f97316'; // naranja
    if (porcentaje < 75) return '#eab308'; // amarillo
    return '#22c55e'; // verde
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-3">
        {/* Cabecera con título y estado */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2" title={tramite.nombre}>
            {tramite.nombre}
          </h3>
          {tramite.publicado ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              Publicado
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
              En proceso
            </span>
          )}
        </div>
        
        {/* Nivel de digitalización y avance */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-1" 
              style={{ backgroundColor: getDigitalizacionColor(tramite.nivel_digitalizacion) }}
            ></div>
            <span className="text-xs text-gray-600">Nivel {tramite.nivel_digitalizacion}</span>
          </div>
          <div className="flex items-center">
            <span className="text-xs font-medium text-gray-700 mr-1">{pasosCompletados}/11</span>
            <span className="text-xs text-gray-500">pasos</span>
          </div>
        </div>
        
        {/* Pasos principales con iconos */}
        <div className="flex justify-between mb-3 mt-3">
          {pasosPrincipales.map((paso) => (
            <div key={paso.key} className="flex flex-col items-center">
              {getPasoStatus(paso.key) ? (
                <FaCheckCircle className="text-green-500 mb-1" size={14} />
              ) : (
                <FaRegCircle className="text-gray-300 mb-1" size={14} />
              )}
              <span className="text-xs text-gray-500">{paso.label}</span>
            </div>
          ))}
        </div>
        
        {/* Barra de progreso */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
          <div 
            className="rounded-full h-1.5 transition-all duration-300" 
            style={{ 
              width: `${porcentajeAvance}%`,
              backgroundColor: getAvanceColor(porcentajeAvance)
            }}
          ></div>
        </div>
        
        {/* Icono para expandir/contraer */}
        <div className="flex justify-center mt-3">
          <button 
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? (
              <>
                <span>Ocultar diagrama</span>
                <FaChevronUp className="ml-1" />
              </>
            ) : (
              <>
                <span>Ver diagrama</span>
                <FaChevronDown className="ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Sección expandible con el diagrama de flujo */}
      {expanded && (
        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Diagrama de flujo del trámite</h4>
          <PipelineStepsEvidence tramite={tramite} />
        </div>
      )}
    </div>
  );
};

export default TramiteCardMini;
