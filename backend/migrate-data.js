// Script para migrar datos existentes a la nueva estructura con períodos
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateExistingData() {
  try {
    console.log('🔄 Iniciando migración de datos existentes...');

    // 1. Crear período por defecto para datos existentes (Julio 2024)
    const defaultPeriod = await prisma.periodos_datos.upsert({
      where: {
        mes_anio: {
          mes: 7,
          anio: 2024
        }
      },
      update: {},
      create: {
        mes: 7,
        anio: 2024,
        descripcion: 'Datos Iniciales - Julio 2024',
        activo: true
      }
    });

    console.log(`✅ Período por defecto creado: ${defaultPeriod.descripcion}`);

    // 2. Contar registros sin período asignado
    const recordsWithoutPeriod = await prisma.indicadores_tramite_secretaria.count({
      where: {
        periodo_id: null
      }
    });

    console.log(`📊 Registros sin período: ${recordsWithoutPeriod}`);

    if (recordsWithoutPeriod > 0) {
      // 3. Asignar período por defecto a registros existentes
      const updateResult = await prisma.indicadores_tramite_secretaria.updateMany({
        where: {
          periodo_id: null
        },
        data: {
          periodo_id: defaultPeriod.id
        }
      });

      console.log(`✅ ${updateResult.count} registros actualizados con período por defecto`);
    }

    // 4. Verificar migración
    const totalRecords = await prisma.indicadores_tramite_secretaria.count();
    const recordsWithPeriod = await prisma.indicadores_tramite_secretaria.count({
      where: {
        periodo_id: {
          not: null
        }
      }
    });

    console.log(`📈 Resumen de migración:`);
    console.log(`   - Total de registros: ${totalRecords}`);
    console.log(`   - Registros con período: ${recordsWithPeriod}`);
    console.log(`   - Registros sin período: ${totalRecords - recordsWithPeriod}`);

    if (totalRecords === recordsWithPeriod) {
      console.log('🎉 ¡Migración completada exitosamente!');
    } else {
      console.log('⚠️  Algunos registros no fueron migrados');
    }

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración
migrateExistingData()
  .catch((error) => {
    console.error('💥 Migración falló:', error);
    process.exit(1);
  });
