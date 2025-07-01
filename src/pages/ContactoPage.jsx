import React from 'react';
import Layout from '../components/Layout';

export default function ContactoPage() {
  return (
    <Layout>
      <div className="container mx-auto py-16 px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Contacto</h1>
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl mx-auto">
          <p className="text-xl text-center mb-6">¿Tienes dudas sobre el Observatorio Regulatorio?</p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">Dirección</h3>
              <p className="text-gray-600">
                Palacio de Gobierno, Plaza Juárez S/N<br />
                Col. Centro, C.P. 42000<br />
                Pachuca de Soto, Hidalgo
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Contacto</h3>
              <p className="text-gray-600">
                Teléfono: (771) 717-6000<br />
                Email: contacto@hidalgo.gob.mx<br />
                Horario: Lunes a Viernes 9:00 - 17:00
              </p>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-center">Envíanos un mensaje</h3>
            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                  <input type="email" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Asunto</label>
                <input type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mensaje</label>
                <textarea rows="4" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
              </div>
              <div className="text-center">
                <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-focus">
                  Enviar mensaje
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
