import React from 'react';
import Layout from '../components/Layout';
import CsvManager from '../components/csv/CsvManager';

export default function AdminCsvPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Administración de Datos CSV
            </h1>
            <p className="text-gray-600">
              Gestiona la carga de datos mensuales, compara períodos y administra el histórico de información.
            </p>
          </div>
          
          <CsvManager />
        </div>
      </div>
    </Layout>
  );
}
