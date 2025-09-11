import React, { useState, useEffect } from 'react';
import { FaUpload, FaCalendarAlt, FaChartBar, FaTrash, FaExchangeAlt, FaDownload, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import CsvUploadForm from './CsvUploadForm';
import PeriodSelector from './PeriodSelector';
import PeriodComparison from './PeriodComparison';
import PeriodStatistics from './PeriodStatistics';

const CsvManager = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [notification, setNotification] = useState(null);

  // Cargar períodos disponibles
  useEffect(() => {
    loadPeriodos();
  }, []);

  const loadPeriodos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/csv/periodos');
      setPeriodos(response.data);
    } catch (error) {
      console.error('Error al cargar períodos:', error);
      showNotification('Error al cargar períodos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleUploadSuccess = (result) => {
    showNotification(result.message, 'success');
    loadPeriodos(); // Recargar períodos después de subir
  };

  const handleDeletePeriod = async (periodoId) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este período y todos sus datos?')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`/api/csv/periodos/${periodoId}`);
      showNotification('Período eliminado correctamente', 'success');
      loadPeriodos();
    } catch (error) {
      console.error('Error al eliminar período:', error);
      showNotification('Error al eliminar período', 'error');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'upload', label: 'Cargar CSV', icon: FaUpload },
    { id: 'periods', label: 'Gestionar Períodos', icon: FaCalendarAlt },
    { id: 'compare', label: 'Comparar Períodos', icon: FaExchangeAlt },
    { id: 'statistics', label: 'Estadísticas', icon: FaChartBar }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Notificaciones */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center">
            <span>{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="ml-4 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Tabs de navegación */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenido de las tabs */}
      <div className="p-6">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <FaSpinner className="animate-spin w-6 h-6 text-blue-500 mr-2" />
            <span className="text-gray-600">Cargando...</span>
          </div>
        )}

        {/* Tab: Cargar CSV */}
        {activeTab === 'upload' && (
          <CsvUploadForm 
            onUploadSuccess={handleUploadSuccess}
            onError={(error) => showNotification(error, 'error')}
          />
        )}

        {/* Tab: Gestionar Períodos */}
        {activeTab === 'periods' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Períodos Disponibles ({periodos.length})
              </h3>
              
              {periodos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaCalendarAlt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay períodos disponibles</p>
                  <p className="text-sm">Sube tu primer archivo CSV para comenzar</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {periodos.map((periodo) => (
                    <div key={periodo.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {periodo.descripcion}
                          </h4>
                          <div className="text-sm text-gray-500 mt-1">
                            <span>Mes: {periodo.mes}/{periodo.anio}</span>
                            <span className="mx-2">•</span>
                            <span>{periodo.total_registros} registros</span>
                            <span className="mx-2">•</span>
                            <span>Cargado: {new Date(periodo.fecha_carga).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedPeriod(periodo)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
                          >
                            Ver Detalles
                          </button>
                          <button
                            onClick={() => handleDeletePeriod(periodo.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                          >
                            <FaTrash className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Comparar Períodos */}
        {activeTab === 'compare' && (
          <PeriodComparison 
            periodos={periodos}
            onError={(error) => showNotification(error, 'error')}
          />
        )}

        {/* Tab: Estadísticas */}
        {activeTab === 'statistics' && (
          <PeriodStatistics 
            periodos={periodos}
            selectedPeriod={selectedPeriod}
            onPeriodSelect={setSelectedPeriod}
            onError={(error) => showNotification(error, 'error')}
          />
        )}
      </div>
    </div>
  );
};

export default CsvManager;
