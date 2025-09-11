import React, { useState } from 'react';
import { FaUpload, FaFile, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';

const CsvUploadForm = ({ onUploadSuccess, onError }) => {
  const [formData, setFormData] = useState({
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear(),
    descripcion: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (file) => {
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setUploadResult(null);
    } else {
      onError('Por favor selecciona un archivo CSV válido');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      onError('Por favor selecciona un archivo CSV');
      return;
    }

    if (!formData.mes || !formData.anio) {
      onError('Por favor selecciona mes y año');
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('csvFile', selectedFile);
      uploadFormData.append('mes', formData.mes);
      uploadFormData.append('anio', formData.anio);
      uploadFormData.append('descripcion', formData.descripcion);

      const response = await axios.post('/api/csv/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadResult(response.data);
      onUploadSuccess(response.data);
      
      // Limpiar formulario
      setSelectedFile(null);
      setFormData({
        mes: new Date().getMonth() + 1,
        anio: new Date().getFullYear(),
        descripcion: ''
      });

    } catch (error) {
      console.error('Error al subir CSV:', error);
      const errorMessage = error.response?.data?.error || 'Error al procesar el archivo CSV';
      onError(errorMessage);
      
      if (error.response?.data?.errors) {
        setUploadResult({
          success: false,
          errors: error.response.data.errors
        });
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-900 mb-2">Formato CSV Esperado</h3>
        <div className="text-sm text-blue-700">
          <p className="mb-2"><strong>Columnas requeridas:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li><code>Dependencia</code> - Nombre de la secretaría</li>
            <li><code>tramite</code> - Nombre del trámite</li>
            <li><code>nivel_digitalizacion</code> - Valor decimal (ej: 3,5 o 3.5)</li>
            <li><code>capacitacion_modulo1, capacitacion_modulo2, capacitacion_modulo3</code> - Valores 0/1</li>
            <li><code>boceto_modelado, bizagi_modelado, vo_bo_bizagi</code> - Valores 0/1</li>
            <li><code>acciones_reingenieria, vo_bo_acciones_reingenieria</code> - Valores 0/1</li>
            <li><code>boceto_acuerdo, vo_bo_acuerdo, publicado</code> - Valores 0/1</li>
          </ul>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selector de período */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mes
            </label>
            <select
              name="mes"
              value={formData.mes}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {meses.map((mes, index) => (
                <option key={index + 1} value={index + 1}>
                  {mes}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Año
            </label>
            <input
              type="number"
              name="anio"
              value={formData.anio}
              onChange={handleInputChange}
              min="2020"
              max="2030"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Descripción opcional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción (opcional)
          </label>
          <input
            type="text"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            placeholder={`Datos de ${meses[formData.mes - 1]} ${formData.anio}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Área de carga de archivo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Archivo CSV
          </label>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? 'border-blue-400 bg-blue-50'
                : selectedFile
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {selectedFile ? (
              <div className="space-y-2">
                <FaFile className="w-8 h-8 text-green-500 mx-auto" />
                <p className="text-sm font-medium text-green-700">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-green-600">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Remover archivo
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <FaUpload className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-600">
                  Arrastra tu archivo CSV aquí o{' '}
                  <label className="text-blue-600 hover:text-blue-800 cursor-pointer underline">
                    selecciona un archivo
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="text-xs text-gray-500">
                  Máximo 10MB • Solo archivos .csv
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={!selectedFile || uploading}
          className={`w-full flex items-center justify-center px-4 py-3 rounded-md font-medium ${
            !selectedFile || uploading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {uploading ? (
            <>
              <FaSpinner className="animate-spin w-4 h-4 mr-2" />
              Procesando archivo...
            </>
          ) : (
            <>
              <FaUpload className="w-4 h-4 mr-2" />
              Cargar CSV
            </>
          )}
        </button>
      </form>

      {/* Resultados de la carga */}
      {uploadResult && (
        <div className="mt-6">
          {uploadResult.success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <FaCheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <h4 className="font-medium text-green-900">Carga Exitosa</h4>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Se procesaron {uploadResult.results?.processed || 0} registros correctamente
              </p>
              {uploadResult.results?.errors?.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-yellow-800">
                    Advertencias ({uploadResult.results.errors.length}):
                  </p>
                  <ul className="text-xs text-yellow-700 mt-1 max-h-32 overflow-y-auto">
                    {uploadResult.results.errors.slice(0, 5).map((error, index) => (
                      <li key={index} className="mt-1">• {error}</li>
                    ))}
                    {uploadResult.results.errors.length > 5 && (
                      <li className="mt-1 font-medium">
                        ... y {uploadResult.results.errors.length - 5} más
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <FaExclamationTriangle className="w-5 h-5 text-red-500 mr-2" />
                <h4 className="font-medium text-red-900">Error en la Carga</h4>
              </div>
              {uploadResult.errors && (
                <ul className="text-sm text-red-700 mt-2 max-h-32 overflow-y-auto">
                  {uploadResult.errors.slice(0, 10).map((error, index) => (
                    <li key={index} className="mt-1">• {error}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CsvUploadForm;
