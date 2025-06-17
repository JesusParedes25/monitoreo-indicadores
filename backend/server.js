const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

// Necesitamos usar consultas SQL nativas para acceder a las funciones PostGIS
const prisma = new PrismaClient();
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

// También mantenemos el middleware CORS estándar
app.use(cors({
  origin: '*',  // Permitir cualquier origen en desarrollo
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: false  // Cambiado a false para evitar problemas
}));

app.use(express.json());

// Endpoint para obtener todos los municipios con sus indicadores incluyendo geometría GeoJSON
app.get('/api/municipios', async (req, res) => {
  try {
    console.log('Intentando conectar a la base de datos...');
    
    // Primero verificamos la conexión a la DB
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('Conexión a la base de datos exitosa');
    } catch (dbError) {
      console.error('Error de conexión a la base de datos:', dbError);
      return res.status(500).json({ error: 'Error de conexión a la base de datos', details: dbError.message });
    }
    
    console.log('Ejecutando consulta para obtener municipios con geometrías...');
    
    try {
      // Usamos una consulta SQL nativa para convertir la geometría a GeoJSON
      const municipios = await prisma.$queryRaw`
        SELECT 
          id, 
          municipio, 
          enlace, 
          pamr, 
          cnartys, 
          "CVEGEO", 
          ST_AsGeoJSON(geom) as geojson
        FROM 
          municipios_indicadores
      `;
      
      console.log(`Se encontraron ${municipios.length} municipios`);
      
      // Transformamos los resultados para crear un objeto GeoJSON completo
      const features = municipios.map(m => {
        return {
          type: 'Feature',
          geometry: JSON.parse(m.geojson),
          properties: {
            id: m.id,
            municipio: m.municipio,
            enlace: m.enlace,
            pamr: m.pamr,
            cnartys: m.cnartys,
            cvegeo: m.CVEGEO
          }
        };
      });
      
      console.log('GeoJSON generado correctamente');
      
      // Enviamos como una colección GeoJSON completa
      const geoJsonResponse = {
        type: 'FeatureCollection',
        features
      };

      res.json(geoJsonResponse);
    } catch (queryError) {
      console.error('Error en la consulta SQL:', queryError);
      return res.status(500).json({ error: 'Error en la consulta SQL', details: queryError.message });
    }
  } catch (error) {
    console.error('Error general al obtener municipios:', error);
    res.status(500).json({ error: 'Error al obtener los municipios', details: error.message });
  }
});

// Endpoint para obtener un municipio específico por ID con su geometría
app.get('/api/municipios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const municipios = await prisma.$queryRaw`
      SELECT 
        id, 
        municipio, 
        enlace, 
        pamr, 
        cnartys, 
        cvegeo, 
        ST_AsGeoJSON(geom) as geojson
      FROM 
        municipios_indicadores
      WHERE
        id = ${Number(id)}
    `;
    
    if (!municipios || municipios.length === 0) {
      return res.status(404).json({ error: 'Municipio no encontrado' });
    }
    
    const municipio = municipios[0];
    const geoJsonResponse = {
      type: 'Feature',
      geometry: JSON.parse(municipio.geojson),
      properties: {
        id: municipio.id,
        municipio: municipio.municipio,
        enlace: municipio.enlace,
        pamr: municipio.pamr,
        cnartys: municipio.cnartys,
        cvegeo: municipio.cvegeo
      }
    };

    res.json(geoJsonResponse);
  } catch (error) {
    console.error('Error al obtener municipio:', error);
    res.status(500).json({ error: 'Error al obtener datos del municipio' });
  }
});

// Endpoint para obtener un municipio específico por CVEGEO con su geometría
app.get('/api/municipios/cvegeo/:cvegeo', async (req, res) => {
  const { cvegeo } = req.params;
  try {
    const municipios = await prisma.$queryRaw`
      SELECT 
        id, 
        municipio, 
        enlace, 
        pamr, 
        cnartys, 
        cvegeo, 
        ST_AsGeoJSON(geom) as geojson
      FROM 
        municipios_indicadores
      WHERE
        cvegeo = ${cvegeo}
    `;
    
    if (!municipios || municipios.length === 0) {
      return res.status(404).json({ error: 'Municipio no encontrado' });
    }
    
    const municipio = municipios[0];
    const geoJsonResponse = {
      type: 'Feature',
      geometry: JSON.parse(municipio.geojson),
      properties: {
        id: municipio.id,
        municipio: municipio.municipio,
        enlace: municipio.enlace,
        pamr: municipio.pamr,
        cnartys: municipio.cnartys,
        cvegeo: municipio.cvegeo
      }
    };

    res.json(geoJsonResponse);
  } catch (error) {
    console.error('Error al obtener municipio:', error);
    res.status(500).json({ error: 'Error al obtener datos del municipio' });
  }
});

// Endpoint de verificación
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'API funcionando correctamente' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
