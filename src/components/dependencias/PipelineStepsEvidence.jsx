import React, { useState } from 'react';

const PipelineStepsEvidence = ({ tramite = {} }) => {
  // Estado para controlar qué paso tiene el modal de evidencia abierto
  const [evidenciaAbierta, setEvidenciaAbierta] = useState(null);

  // Descripciones detalladas para tooltips
  const descripcionesPasos = {
    capacitacion_modulo1: 'Capacitación presencial sobre la estrategia de simplificación de trámites, principios de simplificación y alineación con la estrategia nacional.',
    bizagi_modelado: 'Modelado del trámite utilizando el software Bizagi para representar el flujo actual.',
    vo_bo_bizagi: 'Visto bueno por parte de COEMERE al modelado Bizagi presentado por la secretaría.',
    capacitacion_modulo2: 'Capacitación presencial "Diseño y Análisis de un diagrama de Flujo Gubernamental" para aplicar fundamentos de diagramas de flujo horizontal.',
    vo_bo_acciones_reingenieria: 'Visto bueno por parte del enlace de la secretaría a las acciones de reingeniería propuestas.',
    capacitacion_modulo3: 'Capacitación sobre implementación de mejoras y seguimiento de resultados.',
    boceto_acuerdo: 'Elaboración del boceto del acuerdo entre COEMERE y la Secretaría para formalizar las mejoras.',
    vo_bo_acuerdo: 'Visto bueno por parte de COEMERE al acuerdo propuesto.',
    publicado: 'Publicación oficial de la simplificación del trámite en el Periódico Oficial del Estado de Hidalgo.'
  };

  // Asegurar que tramite no sea null o undefined
  const tramiteData = tramite || {};
  
  // Colores por fase (un color distinto para cada fase)
  const coloresPorFase = {
    1: '#4e73df', // Azul para Fase 1
    2: '#1cc88a', // Verde para Fase 2
    3: '#f6c23e', // Amarillo para Fase 3
    4: '#e74a3b', // Rojo para Fase 4
    5: '#6f42c1'  // Morado para Fase 5
  };
  
  // Nombres de las fases para la leyenda
  const nombresFases = {
    1: 'Fase 1: Modelado',
    2: 'Fase 2: Reingeniería',
    3: 'Fase 3: Proceso',
    4: 'Fase 4: Publicación',
    5: 'Fase 5: Implementación'
  };

  // Definición de los pasos según requerimiento con campo para evidencia, agrupados por fases
  const pasos = [
    // Fase 1: Modelado (Azul)
    { 
      id: 1,
      campo: 'capacitacion_modulo1', 
      titulo: 'Capacitaciones',
      fase: 1,
      completado: tramiteData.capacitacion_modulo1 === true,
      tooltip: descripcionesPasos.capacitacion_modulo1,
      evidencia: tramiteData.evidencia_capacitacion_modulo1 || null,
      color: coloresPorFase[1]
    },
    { 
      id: 2,
      campo: 'bizagi_modelado', 
      titulo: 'Bizagi Modelado',
      fase: 1,
      completado: tramiteData.bizagi_modelado === true,
      tooltip: descripcionesPasos.bizagi_modelado,
      evidencia: tramiteData.evidencia_bizagi_modelado || null,
      color: coloresPorFase[1]
    },
    { 
      id: 3,
      campo: 'vo_bo_bizagi', 
      titulo: 'VoBo Bizagi',
      fase: 1,
      completado: tramiteData.vo_bo_bizagi === true,
      tooltip: descripcionesPasos.vo_bo_bizagi,
      evidencia: tramiteData.evidencia_vo_bo_bizagi || null,
      color: coloresPorFase[1]
    },
    
    // Fase 2: Reingeniería (Verde)
    { 
      id: 4,
      campo: 'capacitacion_modulo2', 
      titulo: 'Capacitaciones',
      fase: 2,
      completado: tramiteData.capacitacion_modulo2 === true,
      tooltip: descripcionesPasos.capacitacion_modulo2,
      evidencia: tramiteData.evidencia_capacitacion_modulo2 || null,
      color: coloresPorFase[2]
    },
    { 
      id: 5,
      campo: 'vo_bo_acciones_reingenieria', 
      titulo: 'VoBo Acciones de Reingeniería',
      fase: 2,
      completado: tramiteData.vo_bo_acciones_reingenieria === true,
      tooltip: descripcionesPasos.vo_bo_acciones_reingenieria,
      evidencia: tramiteData.evidencia_vo_bo_acciones_reingenieria || null,
      color: coloresPorFase[2]
    },
    
    // Fase 3: Proceso (Amarillo)
    { 
      id: 6,
      campo: 'capacitacion_modulo3', 
      titulo: 'Nuevo Proceso',
      fase: 3,
      completado: tramiteData.capacitacion_modulo3 === true,
      tooltip: descripcionesPasos.capacitacion_modulo3,
      evidencia: tramiteData.evidencia_capacitacion_modulo3 || null,
      color: coloresPorFase[3]
    },
    { 
      id: 7,
      campo: 'boceto_acuerdo', 
      titulo: 'VoBo Nuevo Proceso',
      fase: 3,
      completado: tramiteData.boceto_acuerdo === true,
      tooltip: descripcionesPasos.boceto_acuerdo,
      evidencia: tramiteData.evidencia_boceto_acuerdo || null,
      color: coloresPorFase[3]
    },
    
    // Fase 4: Publicación (Rojo)
    { 
      id: 8,
      campo: 'vo_bo_acuerdo', 
      titulo: 'Publicación del acuerdo',
      fase: 4,
      completado: tramiteData.vo_bo_acuerdo === true,
      tooltip: descripcionesPasos.vo_bo_acuerdo,
      evidencia: tramiteData.evidencia_vo_bo_acuerdo || null,
      color: coloresPorFase[4]
    },
    
    // Fase 5: Implementación (Morado)
    { 
      id: 9,
      campo: 'publicado', 
      titulo: 'Implementación',
      fase: 5,
      completado: tramiteData.publicado === true,
      tooltip: descripcionesPasos.publicado,
      evidencia: tramiteData.evidencia_publicado || null,
      color: coloresPorFase[5]
    }
  ];
  
  // Calcular el progreso total
  const pasosCompletados = pasos.filter(paso => paso.completado).length;
  const porcentajeProgreso = (pasosCompletados / pasos.length) * 100;
  
  // Función para abrir/cerrar modal de evidencia
  const toggleEvidencia = (pasoId) => {
    if (evidenciaAbierta === pasoId) {
      setEvidenciaAbierta(null);
    } else {
      setEvidenciaAbierta(pasoId);
    }
  };
  
  // Renderizar paso del pipeline
  const renderPaso = (paso) => {
    // Determinar si hay evidencia disponible
    const tieneEvidencia = paso.evidencia !== null;
    
    return (
      <div 
        key={paso.id} 
        className="flex flex-col items-center relative group"
        aria-label={paso.tooltip}
      >
        <div 
          className={`w-9 h-9 rounded-full flex items-center justify-center 
            ${paso.completado ? (tieneEvidencia ? 'cursor-pointer hover:opacity-80' : '') : 'bg-opacity-40'} 
            transition-colors duration-300 ease-in-out`}
          style={{ backgroundColor: paso.completado ? paso.color : '#9CA3AF' }}
          onClick={() => tieneEvidencia && toggleEvidencia(paso.id)}
          title={tieneEvidencia ? "Ver evidencia" : (paso.completado ? "Completado" : "Pendiente")}
        >
          {paso.completado ? (
            tieneEvidencia ? (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            )
          ) : (
            <span className="text-white font-medium">{paso.id}</span>
          )}
        </div>
        
        {/* Tooltip con descripción */}
        <div className="absolute bottom-full mb-2 w-48 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
          {paso.tooltip}
        </div>
        
        {/* Línea conectora */}
        {paso.id < pasos.length && (
          <div className="w-12 h-0.5 bg-gray-300"></div>
        )}
        
        {/* Etiqueta del paso */}
        <div className="text-xs text-center mt-1 font-medium text-gray-600">
          {paso.titulo}
        </div>
      </div>
    );
  };
  
  // Renderizar leyenda de fases
  const renderLeyenda = () => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4 mb-2">
        {Object.entries(nombresFases).map(([fase, nombre]) => (
          <div key={fase} className="flex items-center">
            <div 
              className="w-4 h-4 rounded-full mr-1" 
              style={{ backgroundColor: coloresPorFase[fase] }}
            ></div>
            <span className="text-xs text-gray-600">{nombre}</span>
          </div>
        ))}
      </div>
    );
  };
  
  // Modal de evidencia
  const renderModalEvidencia = () => {
    if (evidenciaAbierta === null) return null;
    
    const pasoSeleccionado = pasos.find(paso => paso.id === evidenciaAbierta);
    if (!pasoSeleccionado || !pasoSeleccionado.evidencia) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-4 border-b flex justify-between items-center bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">
              Evidencia: {pasoSeleccionado.titulo}
            </h3>
            <button 
              onClick={() => setEvidenciaAbierta(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div className="p-4 overflow-y-auto flex-1">
            {/* Aquí se mostrará la evidencia según su tipo */}
            {pasoSeleccionado.evidencia.endsWith('.pdf') ? (
              <iframe 
                src={pasoSeleccionado.evidencia} 
                className="w-full h-[60vh]" 
                title={`Evidencia de ${pasoSeleccionado.titulo}`}
              />
            ) : pasoSeleccionado.evidencia.match(/\.(jpeg|jpg|png|gif)$/i) ? (
              <img 
                src={pasoSeleccionado.evidencia} 
                alt={`Evidencia de ${pasoSeleccionado.titulo}`} 
                className="max-w-full max-h-[60vh] mx-auto"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <a 
                  href={pasoSeleccionado.evidencia} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Descargar evidencia
                </a>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t bg-gray-50 flex justify-end">
            <button 
              onClick={() => setEvidenciaAbierta(null)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Ya tenemos calculado el progreso arriba
  
  return (
    <div className="mt-4">
      {/* Barra de progreso */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">Progreso</span>
          <span className="text-sm font-medium text-gray-700">{pasosCompletados} de {pasos.length} pasos</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${porcentajeProgreso}%` }}
          ></div>
        </div>
      </div>
      
      {/* Leyenda de fases */}
      {renderLeyenda()}
      
      {/* Pipeline de pasos */}
      <div className="flex flex-wrap gap-4 justify-center items-center py-4">
        {pasos.map(paso => renderPaso(paso))}
      </div>
      
      {/* Modal de evidencia */}
      {renderModalEvidencia()}
    </div>
  );
};

export default PipelineStepsEvidence;
