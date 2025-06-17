import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, GeoJSON, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Solucionar problema de íconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function MapaMunicipios() {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Estado para el indicador seleccionado (por defecto 'enlace')
  const [selectedIndicator, setSelectedIndicator] = useState('enlace');
  // Estado para el tipo de ordenamiento
  const [ordenamiento, setOrdenamiento] = useState('puntaje'); // 'puntaje', 'nombre', 'indicador'
  // Estado para búsqueda de municipios
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para el municipio seleccionado
  const [selectedMunicipio, setSelectedMunicipio] = useState(null);
  // Estado para mostrar sección de instrucciones
  const [showInstructions, setShowInstructions] = useState(null);
  // Posición central para el estado de Hidalgo
  const mapCenter = [20.0911, -98.7624]; // Coordenadas aproximadas del centro de Pachuca
  
  // Opciones del selector de indicadores
  const indicatorOptions = [
    { value: 'enlace', label: 'Municipios con Enlace de Mejora Regulatoria' },
    { value: 'pamr', label: 'Municipios con Programa Anual de Mejora Regulatoria' },
    { value: 'cnartys', label: 'Municipios con información cargada en CNARTYS' }
  ];
  
  // Instrucciones para completar cada indicador
  const instructionsData = {
    enlace: {
      title: 'Cómo designar un Enlace de Mejora Regulatoria',
      steps: [
        'Emitir un oficio de designación firmado por el Presidente Municipal',
        'Enviar copia del oficio a la Comisión Estatal de Mejora Regulatoria',
        'Registrar al enlace en el sistema de seguimiento'
      ],
      links: [
        { text: 'Descargar formato de oficio de designación', url: 'https://ejemplo.com/formato-enlace' },
        { text: 'Manual de responsabilidades del Enlace', url: 'https://ejemplo.com/manual-enlace' },
        { text: 'Registrar enlace en sistema', url: 'https://ejemplo.com/registro' }
      ],
      contacto: 'Para más información: enlace@mejorregulacion.gob.mx | Tel: (771) 234-5678'
    },
    pamr: {
      title: 'Cómo implementar un Programa Anual de Mejora Regulatoria',
      steps: [
        'Realizar diagnóstico regulatorio municipal',
        'Elaborar propuesta de Programa Anual siguiendo los lineamientos',
        'Aprobar el programa en Cabildo',
        'Publicar el programa en la Gaceta Municipal'
      ],
      links: [
        { text: 'Guía para elaborar el PAMR', url: 'https://ejemplo.com/guia-pamr' },
        { text: 'Formato de PAMR descargable', url: 'https://ejemplo.com/formato-pamr' },
        { text: 'Calendario de entrega', url: 'https://ejemplo.com/calendario-pamr' }
      ],
      contacto: 'Para asesoría: pamr@mejorregulacion.gob.mx | Tel: (771) 234-5678'
    },
    cnartys: {
      title: 'Cómo cargar información en CNARTYS',
      steps: [
        'Solicitar usuario y contraseña para el portal CNARTYS',
        'Inventariar trámites y servicios municipales',
        'Cargar información en el sistema siguiendo el manual',
        'Validar y publicar los trámites'
      ],
      links: [
        { text: 'Acceso al portal CNARTYS', url: 'https://cnartys.gob.mx' },
        { text: 'Manual de usuario CNARTYS', url: 'https://ejemplo.com/manual-cnartys' },
        { text: 'Solicitud de usuario', url: 'https://ejemplo.com/solicitud-usuario' }
      ],
      contacto: 'Soporte técnico: soporte@cnartys.gob.mx | Tel: (55) 1234-5678'
    }
  };
  
  // Cargar datos de municipios con geometrías desde el backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null); // Limpiar errores previos
        
        // Lista de posibles URLs para probar
        const urlsToTry = [
          'http://localhost:5000/api/municipios',
          'http://127.0.0.1:5000/api/municipios',
        ];
        
        let success = false;
        let lastError = null;
        
        // Intentar cada URL hasta que una funcione
        for (const url of urlsToTry) {
          try {
            console.log(`Intentando conectar con: ${url}`);
            const response = await axios.get(url, {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
              withCredentials: false,
              timeout: 5000 // Timeout de 5 segundos
            });
            
            if (response.data) {
              setGeoJsonData(response.data);
              console.log('Datos cargados correctamente:', response.data);
              success = true;
              break; // Salir del bucle si la conexión fue exitosa
            }
          } catch (err) {
            console.warn(`Error al conectar con ${url}:`, err.message);
            lastError = err;
          }
        }
        
        if (!success) {
          console.warn('Todos los intentos de conexión fallaron. Usando datos de demostración.');
          
          // Crear datos de demostración si el backend falla
          const demoData = {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'Polygon',
                  coordinates: [[[-98.76, 20.09], [-98.74, 20.09], [-98.74, 20.11], [-98.76, 20.11], [-98.76, 20.09]]]
                },
                properties: {
                  id: 1,
                  municipio: 'Pachuca (Demo)',
                  enlace: true,
                  pamr: false,
                  cnartys: true
                }
              },
              {
                type: 'Feature',
                geometry: {
                  type: 'Polygon',
                  coordinates: [[[-98.78, 20.07], [-98.76, 20.07], [-98.76, 20.09], [-98.78, 20.09], [-98.78, 20.07]]]
                },
                properties: {
                  id: 2,
                  municipio: 'Mineral de la Reforma (Demo)',
                  enlace: true,
                  pamr: true,
                  cnartys: false
                }
              }
            ]
          };
          
          setGeoJsonData(demoData);
          setError('No se pudo conectar con el servidor. Mostrando datos de demostración.');
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error general:', error);
        setError(`Error: ${error.message}`);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Función para estilizar cada municipio según el indicador seleccionado
  const getFeatureStyle = (feature) => {
    // Si no hay propiedades retornar estilo por defecto
    if (!feature.properties) {
      return { fillColor: '#C0C0C0', fillOpacity: 0.5, weight: 1, color: '#666' };
    }
    
    // Verificar si el municipio tiene activo el indicador seleccionado
    const hasIndicator = feature.properties[selectedIndicator] === true;
    
    // Color verde para municipios con el indicador, gris para los que no lo tienen
    const fillColor = hasIndicator ? '#38A169' : '#CBD5E0';
    
    return {
      fillColor: fillColor,
      weight: 2,
      opacity: 1,
      color: 'black',
      dashArray: '',
      fillOpacity: 0.7
    };
  };
  
  // Función para resaltar un municipio al pasar el mouse
  const highlightFeature = (e) => {
    const layer = e.target;
    
    layer.setStyle({
      weight: 3,
      color: 'white',
      dashArray: '',
      fillOpacity: 0.9
    });
    
    layer.bringToFront();
  };
  
  // Función para resetear el estilo cuando el mouse sale
  const resetHighlight = (e, feature) => {
    const layer = e.target;
    layer.setStyle(getFeatureStyle(feature));
  };
  
  // Crear tooltip para cada municipio y añadir interactividad
  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      const props = feature.properties;
      const indicadoresText = [
        `<b>Municipio:</b> ${props.municipio}`,
        `<b>Enlace:</b> ${props.enlace ? '✅' : '❌'}`,
        `<b>PAMR:</b> ${props.pamr ? '✅' : '❌'}`,
        `<b>CNARTYS:</b> ${props.cnartys ? '✅' : '❌'}`
      ].join('<br />');      
      
      layer.bindTooltip(
        `<div class="tooltip-content">${indicadoresText}</div>`,
        { sticky: true }
      );
      
      // Añadir eventos de hover para resaltar municipios
      layer.on({
        mouseover: highlightFeature,
        mouseout: (e) => resetHighlight(e, feature),
        click: () => {
          console.log(`Municipio seleccionado: ${props.municipio}`);
        }
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{error}</span>
      </div>
    );
  }
  
  // Función para calcular el puntaje de un municipio basado en sus indicadores
  const calcularPuntajeMunicipio = (municipio) => {
    if (!municipio || !municipio.properties) return 0;
    
    // Contar cuántos indicadores tiene activos
    let puntaje = 0;
    if (municipio.properties.enlace) puntaje++;
    if (municipio.properties.pamr) puntaje++;
    if (municipio.properties.cnartys) puntaje++;
    
    return puntaje;
  };
  
  // Función para obtener el color del semáforo según el indicador seleccionado
  const getSemaforoColor = (municipio) => {
    return municipio.properties[selectedIndicator] ? '#38A169' : '#CBD5E0';
  };
  
  // Función para clasificar municipios y ordenarlos por ranking
  const getRankedMunicipios = () => {
    if (!geoJsonData || !geoJsonData.features) return [];
    
    const municipiosConPuntaje = [...geoJsonData.features].map(municipio => ({
      ...municipio,
      puntaje: calcularPuntajeMunicipio(municipio)
    }));
    
    // Aplicar ordenamiento según criterio seleccionado
    switch(ordenamiento) {
      case 'nombre':
        return municipiosConPuntaje.sort((a, b) => 
          a.properties.municipio.localeCompare(b.properties.municipio));
      
      case 'indicador':
        return municipiosConPuntaje.sort((a, b) => {
          // Primero los que tienen el indicador seleccionado
          if (a.properties[selectedIndicator] !== b.properties[selectedIndicator]) {
            return b.properties[selectedIndicator] ? 1 : -1;
          }
          // En caso de empate, por nombre
          return a.properties.municipio.localeCompare(b.properties.municipio);
        });
      
      case 'puntaje':  
      default:
        return municipiosConPuntaje.sort((a, b) => {
          // Primero por puntaje (descendente)
          if (b.puntaje !== a.puntaje) return b.puntaje - a.puntaje;
          // En caso de empate, por nombre (ascendente)
          return a.properties.municipio.localeCompare(b.properties.municipio);
        });
    }
  };
  
  // Obtener el color de fondo según el puntaje
  const getBackgroundByScore = (score) => {
    if (score === 3) return 'bg-green-50 border-green-500'; 
    if (score === 2) return 'bg-blue-50 border-blue-500';   
    if (score === 1) return 'bg-yellow-50 border-yellow-500'; 
    return 'bg-red-50 border-red-500';    
  };
  
  // Obtener el nombre de la categoría según el puntaje
  const getCategoryByScore = (score) => {
    switch(score) {
      case 3: return 'Excelente';   
      case 2: return 'Bueno';       
      case 1: return 'Regular';     
      default: return 'Insuficiente'; 
    }
  };

  // Función para obtener el color del municipio en el mapa
  const getColorForMunicipio = (feature) => {
    if (!feature || !feature.properties) return '#CBD5E0'; // Gris por defecto
    return feature.properties[selectedIndicator] ? '#38A169' : '#CBD5E0'; // Verde si tiene el indicador, gris si no
  };

  // Lista ordenada de municipios por ranking
  const rankedMunicipios = getRankedMunicipios();
  
  // Calcular estadísticas
  const totalMunicipios = rankedMunicipios.length;
  const municipiosConIndicador = rankedMunicipios.filter(m => m.properties[selectedIndicator]).length;
  
  // Calcular estadísticas por categoría
  const municipiosPorCategoria = {
    excelente: rankedMunicipios.filter(m => m.puntaje === 3).length,
    bueno: rankedMunicipios.filter(m => m.puntaje === 2).length,
    regular: rankedMunicipios.filter(m => m.puntaje === 1).length,
    insuficiente: rankedMunicipios.filter(m => m.puntaje === 0).length
  };
  const porcentajeAvance = totalMunicipios > 0 ? ((municipiosConIndicador / totalMunicipios) * 100).toFixed(1) : 0;
  
  // Filtrar municipios por término de búsqueda
  const getFilteredMunicipios = () => {
    const municipiosRanking = getRankedMunicipios();
    if (!searchTerm.trim()) return municipiosRanking;
    
    return municipiosRanking.filter(municipio => 
      municipio.properties.municipio.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  const filteredMunicipios = getFilteredMunicipios();
  
  return (
    <div className="w-full">
      {/* Panel de indicadores y estadísticas */}
      <div className="p-4 bg-white rounded-lg shadow-lg mb-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Selector de indicadores */}
          <div className="lg:col-span-2">
            <div className="text-base font-medium mb-3">Indicadores de Seguimiento</div>
            <div className="flex flex-wrap gap-2">
              <button 
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  selectedIndicator === 'enlace' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedIndicator('enlace')}
              >
                Enlace Municipal
              </button>
              <button 
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  selectedIndicator === 'pamr' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedIndicator('pamr')}
              >
                PAMR
              </button>
              <button 
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  selectedIndicator === 'cnartys' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedIndicator('cnartys')}
              >
                CNARTYS
              </button>
            </div>
          </div>
          
          {/* Tarjetas de estadísticas */}
          <div className="lg:col-span-2 grid grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Total Municipios */}
            <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
              <div className="text-gray-600 text-xs">Total Municipios</div>
              <div className="font-medium text-lg">{totalMunicipios}</div>
            </div>
            
            {/* Municipios con indicador */}
            <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
              <div className="text-gray-600 text-xs">Con indicador activo</div>
              <div className="flex items-center">
                <span className="font-medium text-lg mr-2">{municipiosConIndicador}</span>
                <span className="text-xs text-gray-500">de {totalMunicipios}</span>
              </div>
            </div>
            
            {/* Porcentaje avance */}
            <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
              <div className="text-gray-600 text-xs">Porcentaje avance</div>
              <div className="flex items-center">
                <span className="font-medium text-lg mr-2">{porcentajeAvance}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${porcentajeAvance}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Layout principal con mapa y ranking en la misma fila */}
      <div style={{display: 'flex', flexDirection: 'row', width: '100%', gap: '1rem'}}>
        {/* Panel del Mapa (ocupa 60% del ancho) */}
        <div style={{width: '60%'}} className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-3 border-b border-gray-200">
            <h3 className="font-semibold">
              Mapa de Municipios: {selectedIndicator === 'cnartys' ? 'CNARTYS' : selectedIndicator === 'pamr' ? 'PAMR' : 'Enlace Municipal'}
            </h3>
          </div>
          <div className="h-[550px]">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-full text-center p-4">
                <div>
                  <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="mt-2 text-lg font-semibold text-red-600">{error}</p>
                </div>
              </div>
            ) : (
              <MapContainer
                center={mapCenter}
                zoom={8}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <GeoJSON 
                  data={geoJsonData} 
                  style={feature => {
                    return {
                      fillColor: getColorForMunicipio(feature),
                      weight: 1,
                      opacity: 1,
                      color: '#666',
                      fillOpacity: 0.7
                    };
                  }}
                  onEachFeature={(feature, layer) => {
                    const indicadorStatus = feature.properties[selectedIndicator] ? 'Activo' : 'No activo';
                    layer.bindPopup(`
                      <strong>${feature.properties.municipio}</strong><br>
                      ${indicatorOptions.find(opt => opt.value === selectedIndicator)?.label.split(' ').pop()}: ${indicadorStatus}
                    `);
                  }}
                />
              </MapContainer>
            )}
          </div>
        </div>

        {/* Panel de Ranking de Municipios (ocupa 40% del ancho) */}
        <div style={{width: '40%'}} className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-3 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Ranking de Municipios</h3>
              
              {/* Selector de ordenamiento */}
              <select 
                className="text-sm border border-gray-300 rounded px-2 py-1"
                value={ordenamiento}
                onChange={(e) => setOrdenamiento(e.target.value)}
              >
                <option value="puntaje">Ordenar por puntaje</option>
                <option value="nombre">Ordenar por nombre</option>
                <option value="indicador">Ordenar por {selectedIndicator}</option>
              </select>
            </div>
            
            {/* Leyenda de categorías y contador */}
            <div className="flex flex-wrap gap-2 mt-2">
              <span key="categoria-excelente" className="px-2 py-1 bg-green-100 text-green-700 rounded flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-1.5"></span>Excelente: {municipiosPorCategoria.excelente}
              </span>
              <span key="categoria-bueno" className="px-2 py-1 bg-blue-100 text-blue-700 rounded flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-1.5"></span>Bueno: {municipiosPorCategoria.bueno}
              </span>
              <span key="categoria-regular" className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded flex items-center">
                <span className="w-3 h-3 bg-yellow-500 rounded-full mr-1.5"></span>Regular: {municipiosPorCategoria.regular}
              </span>
              <span key="categoria-insuficiente" className="px-2 py-1 bg-red-100 text-red-700 rounded flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-1.5"></span>Insuficiente: {municipiosPorCategoria.insuficiente}
              </span>
            </div>
            
            {/* Buscador de municipios */}
            <div className="mt-2">
              <div className="relative">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Buscar municipio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {searchTerm && (
                  <button 
                    className="absolute inset-y-0 right-0 pr-2 flex items-center"
                    onClick={() => setSearchTerm('')}
                  >
                    <svg className="h-4 w-4 text-gray-400 hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Lista de municipios */}
          <div className="h-[450px] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-600">{error}</div>
            ) : filteredMunicipios.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No se encontraron municipios</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {/* Si hay un municipio seleccionado, mostrar su detalle */}
                {selectedMunicipio ? (
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">{selectedMunicipio.properties.municipio}</h3>
                      <button 
                        className="text-sm px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
                        onClick={() => {
                          setSelectedMunicipio(null);
                          setShowInstructions(null);
                        }}
                      >
                        ← Volver al listado
                      </button>
                    </div>
                    
                    {/* Sección: Lo que tiene el municipio */}
                    <div className="mb-6">
                      <h4 className="font-medium text-green-700 mb-2">Indicadores activos</h4>
                      <div className="bg-green-50 p-3 rounded-md">
                        {(selectedMunicipio.properties.enlace || selectedMunicipio.properties.pamr || selectedMunicipio.properties.cnartys) ? (
                          <ul className="space-y-2">
                            {selectedMunicipio.properties.enlace && (
                              <li className="flex items-center">
                                <svg className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Enlace Municipal de Mejora Regulatoria designado</span>
                              </li>
                            )}
                            {selectedMunicipio.properties.pamr && (
                              <li className="flex items-center">
                                <svg className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Programa Anual de Mejora Regulatoria implementado</span>
                              </li>
                            )}
                            {selectedMunicipio.properties.cnartys && (
                              <li className="flex items-center">
                                <svg className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Información cargada en CNARTYS</span>
                              </li>
                            )}
                          </ul>
                        ) : (
                          <p className="text-gray-500 italic">Este municipio no tiene indicadores activos.</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Sección: Lo que le falta al municipio */}
                    <div className="mb-4">
                      <h4 className="font-medium text-red-700 mb-2">Pendientes por implementar</h4>
                      <div className="bg-red-50 p-3 rounded-md">
                        {(!selectedMunicipio.properties.enlace || !selectedMunicipio.properties.pamr || !selectedMunicipio.properties.cnartys) ? (
                          <ul className="space-y-2">
                            {!selectedMunicipio.properties.enlace && (
                              <li className="flex items-center">
                                <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <button 
                                  className="text-red-700 hover:underline focus:outline-none"
                                  onClick={() => setShowInstructions('enlace')}
                                >
                                  Designar Enlace Municipal de Mejora Regulatoria
                                </button>
                              </li>
                            )}
                            {!selectedMunicipio.properties.pamr && (
                              <li className="flex items-center">
                                <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <button 
                                  className="text-red-700 hover:underline focus:outline-none"
                                  onClick={() => setShowInstructions('pamr')}
                                >
                                  Implementar Programa Anual de Mejora Regulatoria
                                </button>
                              </li>
                            )}
                            {!selectedMunicipio.properties.cnartys && (
                              <li className="flex items-center">
                                <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <button 
                                  className="text-red-700 hover:underline focus:outline-none"
                                  onClick={() => setShowInstructions('cnartys')}
                                >
                                  Cargar información en CNARTYS
                                </button>
                              </li>
                            )}
                          </ul>
                        ) : (
                          <p className="text-green-600 font-medium">¡Felicitaciones! Este municipio tiene todos los indicadores implementados.</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Instrucciones detalladas cuando se hace clic en un pendiente */}
                    {showInstructions && (
                      <div className="mt-6 bg-blue-50 p-4 rounded-md border border-blue-200">
                        <h4 className="font-medium text-blue-800 mb-3">{instructionsData[showInstructions].title}</h4>
                        
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-blue-700 mb-2">Pasos a seguir:</h5>
                          <ol className="list-decimal list-inside space-y-2 text-sm pl-1">
                            {instructionsData[showInstructions].steps.map((step, index) => (
                              <li key={index} className="text-gray-700">{step}</li>
                            ))}
                          </ol>
                        </div>
                        
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-blue-700 mb-2">Enlaces útiles:</h5>
                          <ul className="space-y-2 text-sm">
                            {instructionsData[showInstructions].links.map((link, index) => (
                              <li key={index}>
                                <a 
                                  href={link.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline flex items-center"
                                >
                                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                  {link.text}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <p className="text-xs text-gray-600 mt-2 border-t border-blue-200 pt-2">
                          {instructionsData[showInstructions].contacto}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  // Listado normal de municipios
                  filteredMunicipios.map(municipio => {
                    const puntaje = calcularPuntajeMunicipio(municipio);
                    let categoria = '';
                    let bgColorClass = '';
                    
                    if (puntaje === 3) {
                      categoria = 'Excelente';
                      bgColorClass = 'bg-green-50';
                    } else if (puntaje === 2) {
                      categoria = 'Bueno';
                      bgColorClass = 'bg-blue-50';
                    } else if (puntaje === 1) {
                      categoria = 'Regular';
                      bgColorClass = 'bg-yellow-50';
                    } else {
                      categoria = 'Insuficiente';
                      bgColorClass = 'bg-red-50';
                    }
                    
                    return (
                      <div 
                        key={municipio.properties.cve_mun} 
                        className={`p-3 ${bgColorClass} hover:bg-opacity-80 cursor-pointer transition-all`}
                        onClick={() => {
                          setSelectedMunicipio(municipio);
                          setShowInstructions(null);
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="font-medium">{municipio.properties.municipio}</div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold rounded-full px-2 py-0.5 bg-gray-200">{categoria}: {puntaje}/3</span>
                          </div>
                        </div>
                        <div className="mt-1 flex justify-between">
                          <div className="flex space-x-4">
                            <div key={`enlace-${municipio.properties.cve_mun}`} className="inline-flex items-center">
                              <span className={`h-3.5 w-3.5 rounded-full ${municipio.properties.enlace ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                              <span className="text-xs ml-1">Enlace</span>
                            </div>
                            <div key={`pamr-${municipio.properties.cve_mun}`} className="inline-flex items-center">
                              <span className={`h-3.5 w-3.5 rounded-full ${municipio.properties.pamr ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                              <span className="text-xs ml-1">PAMR</span>
                            </div>
                            <div key={`cnartys-${municipio.properties.cve_mun}`} className="inline-flex items-center">
                              <span className={`h-3.5 w-3.5 rounded-full ${municipio.properties.cnartys ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                              <span className="text-xs ml-1">CNARTYS</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
