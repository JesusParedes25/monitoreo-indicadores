const express = require('express');
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
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

// Configurar multer para manejo de archivos CSV
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos CSV'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo
  }
});

// Crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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
    const { periodo_id } = req.query;
    
    let whereClause = '';
    let params = [];
    
    if (periodo_id) {
      whereClause = 'WHERE t.periodo_id = $1';
      params = [parseInt(periodo_id)];
    } else {
      // Si no se especifica período, obtener el más reciente
      const periodoReciente = await prisma.periodos_datos.findFirst({
        orderBy: [{ anio: 'desc' }, { mes: 'desc' }]
      });
      
      if (periodoReciente) {
        whereClause = 'WHERE t.periodo_id = $1';
        params = [periodoReciente.id];
      }
    }
    
    // Usar consulta SQL directa en lugar del ORM de Prisma
    let tramites;
    if (whereClause) {
      tramites = await prisma.$queryRaw`
        SELECT 
          t.*, 
          s.id as secretaria_id, 
          s.nombre as secretaria_nombre,
          p.mes as periodo_mes,
          p.anio as periodo_anio,
          p.descripcion as periodo_descripcion
        FROM 
          indicadores_tramite_secretaria t 
        JOIN 
          secretaria s ON t.secretaria_id = s.id 
        LEFT JOIN
          periodos_datos p ON t.periodo_id = p.id
        WHERE t.periodo_id = ${params[0]}
        ORDER BY 
          s.nombre ASC, 
          t.tramite ASC
      `;
    } else {
      tramites = await prisma.$queryRaw`
        SELECT 
          t.*, 
          s.id as secretaria_id, 
          s.nombre as secretaria_nombre,
          p.mes as periodo_mes,
          p.anio as periodo_anio,
          p.descripcion as periodo_descripcion
        FROM 
          indicadores_tramite_secretaria t 
        JOIN 
          secretaria s ON t.secretaria_id = s.id 
        LEFT JOIN
          periodos_datos p ON t.periodo_id = p.id
        ORDER BY 
          s.nombre ASC, 
          t.tramite ASC
      `;
    }
    
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

// ==================== CSV MANAGEMENT ENDPOINTS ====================

// Función auxiliar para normalizar nombres de columnas CSV
const normalizeColumnName = (columnName) => {
  return columnName.trim().toLowerCase().replace(/\s+/g, '_');
};

// Función auxiliar para normalizar nombres de secretarías
const normalizeSecretariaName = (nombre) => {
  return nombre.trim().toUpperCase();
};

// Función auxiliar para convertir valores booleanos
const parseBoolean = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const str = String(value).toLowerCase().trim();
  return str === '1' || str === 'true' || str === 'sí' || str === 'si' || str === 'yes';
};

// Función auxiliar para convertir decimales con comas
const parseDecimal = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const str = String(value).replace(',', '.');
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
};

// Endpoint para obtener todos los períodos disponibles
app.get('/api/csv/periodos', async (req, res) => {
  try {
    const periodos = await prisma.periodos_datos.findMany({
      orderBy: [
        { anio: 'desc' },
        { mes: 'desc' }
      ],
      include: {
        _count: {
          select: { indicadores: true }
        }
      }
    });

    const periodosFormatted = periodos.map(p => ({
      id: p.id,
      mes: p.mes,
      anio: p.anio,
      descripcion: p.descripcion,
      fecha_carga: p.fecha_carga,
      activo: p.activo,
      total_registros: p._count.indicadores
    }));

    res.json(periodosFormatted);
  } catch (error) {
    console.error('Error al obtener períodos:', error);
    res.status(500).json({ error: 'Error al obtener los períodos', details: error.message });
  }
});

// Endpoint para crear un nuevo período
app.post('/api/csv/periodos', async (req, res) => {
  try {
    const { mes, anio, descripcion } = req.body;

    if (!mes || !anio || mes < 1 || mes > 12 || anio < 2020) {
      return res.status(400).json({ error: 'Mes y año son requeridos y deben ser válidos' });
    }

    const periodo = await prisma.periodos_datos.create({
      data: {
        mes: parseInt(mes),
        anio: parseInt(anio),
        descripcion: descripcion || `${getMonthName(mes)} ${anio}`
      }
    });

    res.json(periodo);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Ya existe un período para este mes y año' });
    }
    console.error('Error al crear período:', error);
    res.status(500).json({ error: 'Error al crear el período', details: error.message });
  }
});

// Función auxiliar para obtener nombre del mes
const getMonthName = (mes) => {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return meses[mes - 1] || 'Mes inválido';
};

// Endpoint para cargar CSV
app.post('/api/csv/upload', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó archivo CSV' });
    }

    const { mes, anio, descripcion } = req.body;
    
    if (!mes || !anio) {
      return res.status(400).json({ error: 'Mes y año son requeridos' });
    }

    console.log(`Procesando CSV para ${mes}/${anio}...`);

    // Crear o encontrar el período
    let periodo;
    try {
      periodo = await prisma.periodos_datos.upsert({
        where: {
          mes_anio: {
            mes: parseInt(mes),
            anio: parseInt(anio)
          }
        },
        update: {
          descripcion: descripcion || `${getMonthName(mes)} ${anio}`,
          fecha_carga: new Date()
        },
        create: {
          mes: parseInt(mes),
          anio: parseInt(anio),
          descripcion: descripcion || `${getMonthName(mes)} ${anio}`
        }
      });
    } catch (error) {
      console.error('Error al crear/actualizar período:', error);
      return res.status(500).json({ error: 'Error al gestionar el período' });
    }

    // Procesar archivo CSV
    const csvData = [];
    const errors = [];
    let lineNumber = 0;

    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv({
          mapHeaders: ({ header }) => normalizeColumnName(header)
        }))
        .on('data', (row) => {
          lineNumber++;
          try {
            // Validar campos requeridos
            if (!row.dependencia || !row.tramite) {
              errors.push(`Línea ${lineNumber}: Faltan campos requeridos (Dependencia, tramite)`);
              return;
            }

            // Normalizar y procesar datos
            const processedRow = {
              dependencia: normalizeSecretariaName(row.dependencia),
              tramite: row.tramite.trim(),
              nivel_digitalizacion: parseDecimal(row.nivel_digitalizacion),
              capacitacion_modulo1: parseBoolean(row.capacitacion_modulo1),
              capacitacion_modulo2: parseBoolean(row.capacitacion_modulo2),
              capacitacion_modulo3: parseBoolean(row.capacitacion_modulo3),
              boceto_modelado: parseBoolean(row.boceto_modelado),
              bizagi_modelado: parseBoolean(row.bizagi_modelado),
              vo_bo_bizagi: parseBoolean(row.vo_bo_bizagi),
              acciones_reingenieria: parseBoolean(row.acciones_reingenieria),
              vo_bo_acciones_reingenieria: parseBoolean(row.vo_bo_acciones_reingenieria),
              boceto_acuerdo: parseBoolean(row.boceto_acuerdo),
              vo_bo_acuerdo: parseBoolean(row.vo_bo_acuerdo),
              publicado: parseBoolean(row.publicado),
              lineNumber
            };

            csvData.push(processedRow);
          } catch (error) {
            errors.push(`Línea ${lineNumber}: Error al procesar datos - ${error.message}`);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Eliminar archivo temporal
    fs.unlinkSync(req.file.path);

    if (errors.length > 0 && csvData.length === 0) {
      return res.status(400).json({ 
        error: 'No se pudieron procesar los datos del CSV', 
        errors: errors.slice(0, 10) // Limitar errores mostrados
      });
    }

    // Procesar datos en la base de datos
    const results = {
      processed: 0,
      errors: [...errors],
      secretarias_created: 0,
      secretarias_updated: 0
    };

    for (const row of csvData) {
      try {
        // Crear o encontrar secretaría
        const secretaria = await prisma.secretaria.upsert({
          where: { nombre: row.dependencia },
          update: {},
          create: { nombre: row.dependencia }
        });

        if (secretaria) {
          // Eliminar registro existente si existe para este período
          await prisma.indicadores_tramite_secretaria.deleteMany({
            where: {
              secretaria_id: secretaria.id,
              tramite: row.tramite,
              periodo_id: periodo.id
            }
          });

          // Crear nuevo registro
          await prisma.indicadores_tramite_secretaria.create({
            data: {
              secretaria_id: secretaria.id,
              periodo_id: periodo.id,
              tramite: row.tramite,
              nivel_digitalizacion: row.nivel_digitalizacion,
              capacitacion_modulo1: row.capacitacion_modulo1,
              capacitacion_modulo2: row.capacitacion_modulo2,
              capacitacion_modulo3: row.capacitacion_modulo3,
              boceto_modelado: row.boceto_modelado,
              bizagi_modelado: row.bizagi_modelado,
              vo_bo_bizagi: row.vo_bo_bizagi,
              acciones_reingenieria: row.acciones_reingenieria,
              vo_bo_acciones_reingenieria: row.vo_bo_acciones_reingenieria,
              boceto_acuerdo: row.boceto_acuerdo,
              vo_bo_acuerdo: row.vo_bo_acuerdo,
              publicado: row.publicado
            }
          });

          results.processed++;
        }
      } catch (error) {
        console.error(`Error procesando línea ${row.lineNumber}:`, error);
        results.errors.push(`Línea ${row.lineNumber}: ${error.message}`);
      }
    }

    console.log(`CSV procesado: ${results.processed} registros, ${results.errors.length} errores`);

    res.json({
      success: true,
      periodo: periodo,
      results: results,
      message: `Se procesaron ${results.processed} registros correctamente`
    });

  } catch (error) {
    console.error('Error general al procesar CSV:', error);
    
    // Limpiar archivo temporal si existe
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Error interno al procesar el archivo CSV', 
      details: error.message 
    });
  }
});

// Endpoint para eliminar un período y todos sus datos
app.delete('/api/csv/periodos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que el período existe
    const periodo = await prisma.periodos_datos.findUnique({
      where: { id: parseInt(id) },
      include: { _count: { select: { indicadores: true } } }
    });

    if (!periodo) {
      return res.status(404).json({ error: 'Período no encontrado' });
    }

    // Eliminar todos los indicadores del período
    await prisma.indicadores_tramite_secretaria.deleteMany({
      where: { periodo_id: parseInt(id) }
    });

    // Eliminar el período
    await prisma.periodos_datos.delete({
      where: { id: parseInt(id) }
    });

    res.json({ 
      success: true, 
      message: `Período eliminado correctamente junto con ${periodo._count.indicadores} registros` 
    });
  } catch (error) {
    console.error('Error al eliminar período:', error);
    res.status(500).json({ error: 'Error al eliminar el período', details: error.message });
  }
});

// Endpoint para comparar datos entre períodos
app.get('/api/csv/comparar/:periodo1/:periodo2', async (req, res) => {
  try {
    const { periodo1, periodo2 } = req.params;

    // Obtener información de los períodos primero
    const [periodoInfo1, periodoInfo2] = await Promise.all([
      prisma.periodos_datos.findUnique({
        where: { id: parseInt(periodo1) }
      }),
      prisma.periodos_datos.findUnique({
        where: { id: parseInt(periodo2) }
      })
    ]);

    // Obtener datos de ambos períodos sin incluir la relación periodo
    const [datos1, datos2] = await Promise.all([
      prisma.indicadores_tramite_secretaria.findMany({
        where: { periodo_id: parseInt(periodo1) },
        include: { secretaria: true }
      }),
      prisma.indicadores_tramite_secretaria.findMany({
        where: { periodo_id: parseInt(periodo2) },
        include: { secretaria: true }
      })
    ]);

    // Crear mapas para comparación
    const mapa1 = new Map();
    const mapa2 = new Map();

    datos1.forEach(d => {
      const key = `${d.secretaria.nombre}|${d.tramite}`;
      mapa1.set(key, d);
    });

    datos2.forEach(d => {
      const key = `${d.secretaria.nombre}|${d.tramite}`;
      mapa2.set(key, d);
    });

    // Generar comparaciones
    const comparaciones = [];
    const allKeys = new Set([...mapa1.keys(), ...mapa2.keys()]);

    allKeys.forEach(key => {
      const [secretaria, tramite] = key.split('|');
      const dato1 = mapa1.get(key);
      const dato2 = mapa2.get(key);

      const comparacion = {
        secretaria,
        tramite,
        periodo1: dato1 ? {
          nivel_digitalizacion: dato1.nivel_digitalizacion,
          publicado: dato1.publicado,
          // Agregar otros campos relevantes para comparación
        } : null,
        periodo2: dato2 ? {
          nivel_digitalizacion: dato2.nivel_digitalizacion,
          publicado: dato2.publicado,
          // Agregar otros campos relevantes para comparación
        } : null,
        cambios: {
          nivel_digitalizacion: dato1 && dato2 ? 
            (dato2.nivel_digitalizacion || 0) - (dato1.nivel_digitalizacion || 0) : null,
          nuevo_en_periodo2: !dato1 && dato2,
          eliminado_en_periodo2: dato1 && !dato2,
          cambio_publicacion: dato1 && dato2 ? dato1.publicado !== dato2.publicado : null
        }
      };

      comparaciones.push(comparacion);
    });

    res.json({
      periodo1: periodoInfo1,
      periodo2: periodoInfo2,
      total_comparaciones: comparaciones.length,
      comparaciones: comparaciones.sort((a, b) => a.secretaria.localeCompare(b.secretaria))
    });

  } catch (error) {
    console.error('Error al comparar períodos:', error);
    res.status(500).json({ error: 'Error al comparar períodos', details: error.message });
  }
});

// Endpoint para obtener estadísticas de un período específico
app.get('/api/csv/estadisticas/:periodoId', async (req, res) => {
  try {
    const { periodoId } = req.params;

    const estadisticas = await prisma.$queryRaw`
      SELECT 
        s.nombre as secretaria,
        COUNT(*) as total_tramites,
        AVG(i.nivel_digitalizacion) as promedio_digitalizacion,
        COUNT(CASE WHEN i.publicado = true THEN 1 END) as tramites_publicados,
        COUNT(CASE WHEN i.nivel_digitalizacion >= 3.0 THEN 1 END) as tramites_avanzados
      FROM indicadores_tramite_secretaria i
      JOIN secretaria s ON i.secretaria_id = s.id
      WHERE i.periodo_id = ${parseInt(periodoId)}
      GROUP BY s.id, s.nombre
      ORDER BY s.nombre
    `;

    res.json(estadisticas);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas', details: error.message });
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
