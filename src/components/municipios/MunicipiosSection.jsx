import React from 'react';
import MapaMunicipios from './MapaMunicipios';

export default function MunicipiosSection() {
  return (
    <div className="w-full bg-gray-100 px-4 py-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Avance por Municipios</h2>
          <div className="text-sm text-gray-500">
            Actualizado: {new Date().toLocaleDateString()}
          </div>
        </div>
        
        {/* Dashboard principal */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="p-4 lg:p-6">
            <MapaMunicipios />
          </div>
        </div>
        
        <div className="text-center text-sm text-gray-500 mt-4">
          Haz clic en cada municipio para ver más detalles. Los datos se obtienen en tiempo real desde la base de datos.
        </div>
      </div>
    </div>
  );
}
