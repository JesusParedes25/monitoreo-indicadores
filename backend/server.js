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

// Endpoint para obtener todas las secretarías
app.get('/api/secretarias', async (req, res) => {
  try {
    // Usar consulta SQL directa en lugar del ORM de Prisma
    const secretarias = await prisma.$queryRaw`SELECT id, nombre FROM secretaria ORDER BY nombre ASC`;
    res.json(secretarias);
  } catch (error) {
    console.error('Error al obtener secretarías:', error);
    res.status(500).json({ error: 'Error al obtener las secretarías' });
  }
});

// Endpoint para obtener todos los trámites con sus indicadores
app.get('/api/tramites', async (req, res) => {
  try {
    // Usar consulta SQL directa en lugar del ORM de Prisma
    const tramites = await prisma.$queryRaw`
      SELECT 
        t.*, 
        s.id as secretaria_id, 
        s.nombre as secretaria_nombre 
      FROM 
        indicadores_tramite_secretaria t 
      JOIN 
        secretaria s ON t.secretaria_id = s.id 
      ORDER BY 
        s.nombre ASC, 
        t.tramite ASC
    `;
    
    // Transformar los resultados para que coincidan con el formato esperado por el frontend
    const formattedTramites = tramites.map(t => ({
      id: t.id,
      secretaria_id: t.secretaria_id,
      tramite: t.tramite,
      nivel_digitalizacion: t.nivel_digitalizacion,
      capacitacion_modulo1: t.capacitacion_modulo1,
      boceto_modelado: t.boceto_modelado,
      bizagi_modelado: t.bizagi_modelado,
      vo_bo_bizagi: t.vo_bo_bizagi,
      capacitacion_modulo2: t.capacitacion_modulo2,
      acciones_reingenieria: t.acciones_reingenieria,
      vo_bo_acciones_reingenieria: t.vo_bo_acciones_reingenieria,
      capacitacion_modulo3: t.capacitacion_modulo3,
      boceto_acuerdo: t.boceto_acuerdo,
      vo_bo_acuerdo: t.vo_bo_acuerdo,
      publicado: t.publicado,
      secretaria: {
        id: t.secretaria_id,
        nombre: t.secretaria_nombre,
        siglas: t.secretaria_siglas
      }
    }));
    res.json(formattedTramites);
  } catch (error) {
    console.error('Error al obtener trámites:', error);
    res.status(500).json({ error: 'Error al obtener los trámites', details: error.message });
  }
});

// Endpoint para obtener trámites por secretaría
app.get('/api/secretarias/:id/tramites', async (req, res) => {
  const { id } = req.params;
  try {
    // Usar consulta SQL directa en lugar del ORM de Prisma
    const tramites = await prisma.$queryRaw`
      SELECT 
        t.*, 
        s.id as secretaria_id, 
        s.nombre as secretaria_nombre 
      FROM 
        indicadores_tramite_secretaria t 
      JOIN 
        secretaria s ON t.secretaria_id = s.id 
      WHERE 
        t.secretaria_id = ${parseInt(id)} 
      ORDER BY 
        t.tramite ASC
    `;
    
    // Transformar los resultados para que coincidan con el formato esperado por el frontend
    const formattedTramites = tramites.map(t => ({
      id: t.id,
      secretaria_id: t.secretaria_id,
      tramite: t.tramite,
      nivel_digitalizacion: t.nivel_digitalizacion,
      capacitacion_modulo1: t.capacitacion_modulo1,
      boceto_modelado: t.boceto_modelado,
      bizagi_modelado: t.bizagi_modelado,
      vo_bo_bizagi: t.vo_bo_bizagi,
      capacitacion_modulo2: t.capacitacion_modulo2,
      acciones_reingenieria: t.acciones_reingenieria,
      vo_bo_acciones_reingenieria: t.vo_bo_acciones_reingenieria,
      capacitacion_modulo3: t.capacitacion_modulo3,
      boceto_acuerdo: t.boceto_acuerdo,
      vo_bo_acuerdo: t.vo_bo_acuerdo,
      publicado: t.publicado,
      secretaria: {
        id: t.secretaria_id,
        nombre: t.secretaria_nombre,
        siglas: t.secretaria_siglas
      }
    }));
    res.json(formattedTramites);
  } catch (error) {
    console.error(`Error al obtener trámites de la secretaría ${id}:`, error);
    res.status(500).json({ error: 'Error al obtener los trámites de la secretaría' });
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
