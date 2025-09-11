import React from 'react';
import { FaCalendarAlt, FaDatabase } from 'react-icons/fa';

const PeriodSelector = ({ periodos, selectedPeriod, onPeriodSelect, showStats = true }) => {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <FaCalendarAlt className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Seleccionar Período
        </h3>
      </div>

      {periodos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FaDatabase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No hay períodos disponibles</p>
          <p className="text-sm">Sube tu primer archivo CSV para comenzar</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {periodos.map((periodo) => (
            <div
              key={periodo.id}
              onClick={() => onPeriodSelect(periodo)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedPeriod?.id === periodo.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {periodo.descripcion}
                  </h4>
                  <div className="text-sm text-gray-500 mt-1">
                    <span>{meses[periodo.mes - 1]} {periodo.anio}</span>
                    {showStats && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{periodo.total_registros} registros</span>
                        <span className="mx-2">•</span>
                        <span>
                          Cargado: {new Date(periodo.fecha_carga).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                {selectedPeriod?.id === periodo.id && (
                  <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PeriodSelector;
