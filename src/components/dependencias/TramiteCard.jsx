import React from 'react';
import PipelineSteps from './PipelineSteps';

const TramiteCard = ({ tramite, isExpanded, toggleExpand }) => {
  // Renderizar estrellas para nivel de digitalización (0-4 escala)
  const renderNivelDigitalizacion = (nivel) => {
    // Asegurar que nivel sea un número válido entre 0 y 4
    const nivelNumerico = nivel && !isNaN(parseFloat(nivel)) ? parseFloat(nivel) : 0;
    const nivelLimitado = Math.min(Math.max(nivelNumerico, 0), 4); // Limitar entre 0 y 4
    
    const estrellas = [];
    
    // Generar 4 estrellas (no 5) según el requerimiento
    for (let i = 0; i < 4; i++) {
      const valorEstrella = i + 1; // 1, 2, 3, 4
      
      if (nivelLimitado >= valorEstrella) {
        // Estrella completa
        estrellas.push(
          <svg key={i} className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else if (nivelLimitado > i && nivelLimitado < valorEstrella) {
        // Estrella parcial (medio llena)
        const porcentaje = (nivelLimitado - i) * 100;
        estrellas.push(
          <div key={i} className="relative w-6 h-6">
            {/* Estrella gris de fondo */}
            <svg className="absolute w-6 h-6 text-gray-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {/* Estrella amarilla con clip-path para mostrar solo una parte */}
            <div className="absolute overflow-hidden" style={{ width: `${porcentaje}%`, height: '100%' }}>
              <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
        );
      } else {
        // Estrella vacía
        estrellas.push(
          <svg key={i} className="w-6 h-6 text-gray-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      }
    }
    
    return (
      <div className="flex items-center bg-gray-50 p-2 rounded-md">
        <div className="flex mr-2">{estrellas}</div>
        <span className="text-sm font-medium text-gray-700">
          {nivelLimitado.toFixed(1)}<span className="text-gray-500">/4.0</span>
        </span>
      </div>
    );
  };

  // Determinar si el trámite está completamente publicado
  const esTramitePublicado = tramite.publicado === true;

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden mb-4 border-l-4 ${esTramitePublicado ? 'border-green-500' : 'border-blue-300'} transition-all duration-300 hover:shadow-lg`}>
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center mb-1">
              {esTramitePublicado && (
                <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Publicado
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">{tramite.tramite}</h3>
            <p className="text-sm font-medium text-gray-600 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1.581.814l-4.419-3.35-4.419 3.35A1 1 0 014 16V4zm5 0a1 1 0 00-1 1v6.5a.5.5 0 001 0V5a1 1 0 00-1-1z" clipRule="evenodd"></path>
              </svg>
              {tramite.secretaria?.nombre || 'Secretaría no especificada'}
            </p>
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Nivel de digitalización:</p>
              {renderNivelDigitalizacion(tramite.nivel_digitalizacion)}
            </div>
          </div>
          <button
            onClick={() => toggleExpand(tramite.id)}
            className={`ml-4 px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${isExpanded ? 'bg-gray-200 text-gray-700' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
          >
            {isExpanded ? 'Ocultar' : 'Ver detalle'}
            <svg className={`w-4 h-4 ml-1 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>
        
        {isExpanded && <PipelineSteps tramite={tramite} />}
      </div>
    </div>
  );
};

export default TramiteCard;
