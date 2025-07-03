import React, { useState } from 'react';
import { COLORS } from '../../styles/colors';

const FlowDiagram = ({ etapas, conteos, maxConteo }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  
  // Calcular el tamaño relativo de cada círculo basado en el conteo
  const calcularTamano = (conteo) => {
    const minSize = 60;
    const maxSize = 120;
    const ratio = conteo / maxConteo;
    return minSize + (maxSize - minSize) * ratio;
  };
  
  // Calcular el porcentaje respecto al total inicial
  const calcularPorcentaje = (conteo) => {
    const total = conteos[0] || 1; // Usamos el primer valor como referencia
    return ((conteo / total) * 100).toFixed(1);
  };
  
  // Generar color con gradiente basado en la posición
  const generarColor = (index) => {
    const baseOpacity = 0.9 - (index * 0.04);
    return {
      background: `linear-gradient(135deg, rgba(75, 50, 195, ${baseOpacity}) 0%, rgba(75, 50, 195, ${baseOpacity - 0.2}) 100%)`,
      border: `2px solid rgba(75, 50, 195, ${baseOpacity + 0.1})`
    };
  };
  
  // Manejar clic en un nodo
  const handleNodeClick = (index) => {
    setSelectedIndex(index === selectedIndex ? null : index);
    // Aquí se podría implementar la lógica para mostrar evidencias o detalles adicionales
    console.log(`Clic en etapa: ${etapas[index]} - ${conteos[index]} trámites`);
  };

  return (
    <div className="flow-diagram-interactive" style={{ width: '100%', height: '100%', position: 'relative', padding: '20px 0' }}>
      {/* Texto introductorio */}
      <div className="text-sm text-gray-700 mb-6">
        Visualiza el avance secuencial de los trámites en cada etapa de la Ruta de Simplificación. 
        Las diferencias entre etapas reflejan puntos de rezago o cuellos de botella.
      </div>
      
      {/* Contenedor del diagrama de flujo */}
      <div className="flow-diagram-nodes" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        height: 'calc(100% - 60px)',
        position: 'relative',
        padding: '0 20px'
      }}>
        {/* Línea conectora */}
        <div className="connector-line" style={{
          position: 'absolute',
          height: '4px',
          background: `${COLORS.lightGray}`,
          width: 'calc(100% - 40px)',
          top: '50%',
          left: '20px',
          transform: 'translateY(-50%)',
          zIndex: 1
        }} />
        
        {/* Nodos del flujo */}
        {etapas.map((etapa, index) => {
          const conteo = conteos[index] || 0;
          const tamano = calcularTamano(conteo);
          const esHovered = hoveredIndex === index;
          const esSeleccionado = selectedIndex === index;
          const colorEstilo = generarColor(index);
          const porcentaje = calcularPorcentaje(conteo);
          
          return (
            <div 
              key={index}
              className="flow-node"
              style={{
                width: `${tamano}px`,
                height: `${tamano}px`,
                borderRadius: '50%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                background: colorEstilo.background,
                border: esSeleccionado ? `3px solid ${COLORS.primaryDark}` : colorEstilo.border,
                color: '#fff',
                position: 'relative',
                zIndex: esHovered || esSeleccionado ? 10 : 2,
                cursor: 'pointer',
                boxShadow: esHovered ? '0 5px 15px rgba(0,0,0,0.2)' : esSeleccionado ? '0 8px 20px rgba(0,0,0,0.3)' : 'none',
                transition: 'all 0.3s ease',
                transform: esHovered ? 'scale(1.05)' : esSeleccionado ? 'scale(1.1)' : 'scale(1)',
                minWidth: '60px',
                minHeight: '60px',
                maxWidth: '120px',
                maxHeight: '120px'
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => handleNodeClick(index)}
            >
              {/* Número de trámites */}
              <div className="font-bold text-lg">{conteo}</div>
              <div className="text-xs">trámites</div>
              
              {/* Etiqueta de la etapa (debajo del círculo) */}
              <div className="etapa-label" style={{
                position: 'absolute',
                bottom: `-${tamano/2 + 15}px`,
                textAlign: 'center',
                color: COLORS.darkGray,
                fontWeight: esHovered || esSeleccionado ? 'bold' : 'normal',
                fontSize: '11px',
                width: '100px',
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'normal',
                lineHeight: '1.2'
              }}>
                {etapa}
              </div>
              
              {/* Tooltip con información detallada */}
              {esHovered && (
                <div className="tooltip" style={{
                  position: 'absolute',
                  top: `-45px`,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                  zIndex: 100,
                  pointerEvents: 'none'
                }}>
                  {etapa}: {conteo} trámites ({porcentaje}% del total)
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FlowDiagram;
