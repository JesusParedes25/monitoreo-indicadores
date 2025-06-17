const express = require('express');
const cors = require('cors');
const app = express();

// Configurar CORS para permitir todas las peticiones durante desarrollo
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(cors({ origin: '*' }));
app.use(express.json());

// Datos de ejemplo con municipios simulados
const mockData = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[-98.78, 20.12], [-98.70, 20.12], [-98.70, 20.18], [-98.78, 20.18], [-98.78, 20.12]]]
      },
      properties: {
        id: 1,
        municipio: 'Pachuca',
        enlace: true,
        pamr: false,
        cnartys: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[-98.79, 20.06], [-98.71, 20.06], [-98.71, 20.11], [-98.79, 20.11], [-98.79, 20.06]]]
      },
      properties: {
        id: 2,
        municipio: 'Mineral de la Reforma',
        enlace: true,
        pamr: true,
        cnartys: false
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[-98.96, 19.82], [-98.85, 19.82], [-98.85, 19.92], [-98.96, 19.92], [-98.96, 19.82]]]
      },
      properties: {
        id: 3,
        municipio: 'Tizayuca',
        enlace: false,
        pamr: false,
        cnartys: false
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[-98.36, 20.36], [-98.26, 20.36], [-98.26, 20.46], [-98.36, 20.46], [-98.36, 20.36]]]
      },
      properties: {
        id: 4,
        municipio: 'San Agustín Tlaxiaca',
        enlace: true,
        pamr: true,
        cnartys: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[-98.46, 20.16], [-98.36, 20.16], [-98.36, 20.26], [-98.46, 20.26], [-98.46, 20.16]]]
      },
      properties: {
        id: 5,
        municipio: 'El Arenal',
        enlace: true,
        pamr: true,
        cnartys: false
      }
    }
  ]
};

// Endpoint para obtener todos los municipios con sus indicadores
app.get('/api/municipios', (req, res) => {
  console.log('Solicitud recibida en /api/municipios');
  res.json(mockData);
});

// Endpoint para obtener un municipio específico por ID
app.get('/api/municipios/:id', (req, res) => {
  const { id } = req.params;
  const feature = mockData.features.find(f => f.properties.id === Number(id));
  
  if (!feature) {
    return res.status(404).json({ error: 'Municipio no encontrado' });
  }
  
  res.json(feature);
});

// Endpoint de verificación
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'API simplificada funcionando correctamente' });
});

// Ruta comodín para cualquier otra solicitud
app.use('*', (req, res) => {
  res.json({ message: 'Ruta no encontrada. Las rutas disponibles son /api/municipios, /api/municipios/:id y /api/status' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor simplificado ejecutándose en el puerto ${PORT}`);
});
