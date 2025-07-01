import React from 'react';

const PipelineSteps = ({ tramite = {} }) => {
  // Descripciones detalladas para tooltips
  const descripcionesPasos = {
    capacitacion_modulo1: 'Capacitación presencial sobre la estrategia de simplificación de trámites, principios de simplificación y alineación con la estrategia nacional.',
    capacitacion_modulo2: 'Capacitación presencial "Diseño y Análisis de un diagrama de Flujo Gubernamental" para aplicar fundamentos de diagramas de flujo horizontal.',
    boceto_modelado: 'Elaboración del boceto inicial del modelado del trámite por parte del enlace de la secretaría.',
    capacitacion_modulo3: 'Capacitación sobre implementación de mejoras y seguimiento de resultados.',
    bizagi_modelado: 'Modelado del trámite utilizando el software Bizagi para representar el flujo actual.',
    vo_bo_bizagi: 'Visto bueno por parte de COEMERE al modelado Bizagi presentado por la secretaría.',
    acciones_reingenieria: 'Propuesta de acciones de reingeniería por parte de COEMERE para simplificar el trámite.',
    vo_bo_acciones_reingenieria: 'Visto bueno por parte del enlace de la secretaría a las acciones de reingeniería propuestas.',
    boceto_acuerdo: 'Elaboración del boceto del acuerdo entre COEMERE y la Secretaría para formalizar las mejoras.',
    vo_bo_acuerdo: 'Visto bueno por parte de COEMERE al acuerdo propuesto.',
    publicado: 'Publicación oficial de la simplificación del trámite en el Periódico Oficial del Estado de Hidalgo.'
  };

  // Asegurar que tramite no sea null o undefined
  const tramiteData = tramite || {};
  
  // Definición de los 11 pasos según requerimiento
  const pasos = [
    { 
      id: 1,
      campo: 'capacitacion_modulo1', 
      titulo: 'Capacitación 1',
      completado: tramiteData.capacitacion_modulo1 === true,
      tooltip: descripcionesPasos.capacitacion_modulo1
    },
    { 
      id: 2,
      campo: 'capacitacion_modulo2', 
      titulo: 'Capacitación 2',
      completado: tramiteData.capacitacion_modulo2 === true,
      tooltip: descripcionesPasos.capacitacion_modulo2
    },
    { 
      id: 3,
      campo: 'boceto_modelado', 
      titulo: 'Boceto Modelado',
      completado: tramiteData.boceto_modelado === true,
      tooltip: descripcionesPasos.boceto_modelado
    },
    { 
      id: 4,
      campo: 'capacitacion_modulo3', 
      titulo: 'Capacitación 3',
      completado: tramiteData.capacitacion_modulo3 === true,
      tooltip: descripcionesPasos.capacitacion_modulo3
    },
    { 
      id: 5,
      campo: 'bizagi_modelado', 
      titulo: 'Modelado Bizagi',
      completado: tramiteData.bizagi_modelado === true,
      tooltip: descripcionesPasos.bizagi_modelado
    },
    { 
      id: 6,
      campo: 'vo_bo_bizagi', 
      titulo: 'VoBo Bizagi',
      completado: tramiteData.vo_bo_bizagi === true,
      tooltip: descripcionesPasos.vo_bo_bizagi
    },
    { 
      id: 7,
      campo: 'acciones_reingenieria', 
      titulo: 'Reingeniería',
      completado: tramiteData.acciones_reingenieria === true,
      tooltip: descripcionesPasos.acciones_reingenieria
    },
    { 
      id: 8,
      campo: 'vo_bo_acciones_reingenieria', 
      titulo: 'VoBo Reingeniería',
      completado: tramiteData.vo_bo_acciones_reingenieria === true,
      tooltip: descripcionesPasos.vo_bo_acciones_reingenieria
    },
    { 
      id: 9,
      campo: 'boceto_acuerdo', 
      titulo: 'Boceto Acuerdo',
      completado: tramiteData.boceto_acuerdo === true,
      tooltip: descripcionesPasos.boceto_acuerdo
    },
    { 
      id: 10,
      campo: 'vo_bo_acuerdo', 
      titulo: 'VoBo Acuerdo',
      completado: tramiteData.vo_bo_acuerdo === true,
      tooltip: descripcionesPasos.vo_bo_acuerdo
    },
    { 
      id: 11,
      campo: 'publicado', 
      titulo: 'Publicado',
      completado: tramiteData.publicado === true,
      tooltip: descripcionesPasos.publicado
    }
  ];
  
  // Calcular el progreso total
  const pasosCompletados = pasos.filter(paso => paso.completado).length;
  const porcentajeProgreso = (pasosCompletados / pasos.length) * 100;
  
  // Renderizar paso del pipeline
  const renderPaso = (paso) => {
    return (
      <div 
        key={paso.id} 
        className="flex flex-col items-center relative group"
        aria-label={paso.tooltip}
      >
        <div 
          className={`w-9 h-9 rounded-full flex items-center justify-center ${paso.completado ? 'bg-green-500' : 'bg-gray-300'} 
          ${paso.id < 11 ? 'mb-2' : ''} transition-colors duration-300 ease-in-out`}
        >
          {paso.completado ? (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          ) : (
            <span className="text-white font-bold text-sm">{paso.id}</span>
          )}
        </div>
        
        {/* Línea conectora entre pasos */}
        {paso.id < 11 && (
          <div className={`hidden lg:block absolute top-4 left-[calc(100%_-_4px)] w-[calc(100%_-_10px)] h-0.5 ${paso.completado ? 'bg-green-500' : 'bg-gray-300'}`}></div>
        )}
        
        <div className="text-xs mt-1 text-center font-medium">{paso.titulo}</div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 w-48 z-10">
          {paso.tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>

        {/* Botón Ver Evidencias (placeholder) */}
        {paso.completado && (
          <button 
            className="mt-1 text-xs text-blue-500 hover:text-blue-700 hover:underline focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              alert(`Ver evidencias para el paso: ${paso.titulo} (Funcionalidad en desarrollo)`);
            }}
          >
            Ver evidencia
          </button>
        )}
      </div>
    );
  };
  
  return (
    <div className="mt-4">
      {/* Barra de progreso */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Progreso: {pasosCompletados} de 11 pasos</span>
          <span>{Math.round(porcentajeProgreso)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
            style={{ width: `${porcentajeProgreso}%` }}
          ></div>
        </div>
      </div>
      
      {/* Pipeline de pasos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-11 gap-2 bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
        {pasos.map(paso => renderPaso(paso))}
      </div>
      
      {/* Insignia para trámite completado */}
      {pasosCompletados === 11 && (
        <div className="mt-3 bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
            <span className="font-medium">Trámite publicado completamente</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PipelineSteps;
