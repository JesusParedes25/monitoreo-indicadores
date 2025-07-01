import React from 'react';
import Layout from '../components/Layout';
import MunicipiosSection from '../components/municipios/MunicipiosSection';

export default function MunicipiosPage() {
  return (
    <Layout>
      <div className="pt-16"> {/* Añadimos padding-top para compensar la navbar */}
        <MunicipiosSection />
      </div>
    </Layout>
  );
}
