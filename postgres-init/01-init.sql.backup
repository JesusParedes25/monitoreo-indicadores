-- Inicializar la base de datos para el Observatorio Regulatorio
-- Este script creará las tablas necesarias basadas en el esquema de Prisma

-- Crear tablas
CREATE TABLE IF NOT EXISTS "municipios_indicadores" (
  "id" SERIAL PRIMARY KEY,
  "municipio" VARCHAR(254),
  "enlace" BOOLEAN,
  "pamr" BOOLEAN,
  "cnartys" BOOLEAN,
  "cvegeo" VARCHAR(11)
);

CREATE TABLE IF NOT EXISTS "secretaria" (
  "id" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(255) UNIQUE
);

CREATE TABLE IF NOT EXISTS "indicadores_tramite_secretaria" (
  "id" SERIAL PRIMARY KEY,
  "secretaria_id" INTEGER NOT NULL,
  "tramite" VARCHAR(255) NOT NULL,
  "nivel_digitalizacion" FLOAT,
  "capacitacion_modulo1" BOOLEAN,
  "boceto_modelado" BOOLEAN,
  "bizagi_modelado" BOOLEAN,
  "vo_bo_bizagi" BOOLEAN,
  "capacitacion_modulo2" BOOLEAN,
  "acciones_reingenieria" BOOLEAN,
  "vo_bo_acciones_reingenieria" BOOLEAN,
  "capacitacion_modulo3" BOOLEAN,
  "boceto_acuerdo" BOOLEAN,
  "vo_bo_acuerdo" BOOLEAN,
  "publicado" BOOLEAN,
  FOREIGN KEY ("secretaria_id") REFERENCES "secretaria"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- Insertar algunas secretarías de ejemplo si la tabla está vacía
INSERT INTO "secretaria" ("nombre")
SELECT 'Procuraduría General de Justicia'
WHERE NOT EXISTS (SELECT 1 FROM "secretaria" WHERE "nombre" = 'Procuraduría General de Justicia');

INSERT INTO "secretaria" ("nombre")
SELECT 'Secretaría de Finanzas'
WHERE NOT EXISTS (SELECT 1 FROM "secretaria" WHERE "nombre" = 'Secretaría de Finanzas');

INSERT INTO "secretaria" ("nombre")
SELECT 'Secretaría de Movilidad'
WHERE NOT EXISTS (SELECT 1 FROM "secretaria" WHERE "nombre" = 'Secretaría de Movilidad');

-- Insertar algunos trámites de ejemplo si la tabla está vacía
INSERT INTO "indicadores_tramite_secretaria" ("secretaria_id", "tramite", "nivel_digitalizacion", "publicado")
SELECT 
  (SELECT "id" FROM "secretaria" WHERE "nombre" = 'Procuraduría General de Justicia'),
  'Alerta AMBER en Hidalgo',
  3.5,
  true
WHERE NOT EXISTS (SELECT 1 FROM "indicadores_tramite_secretaria" WHERE "tramite" = 'Alerta AMBER en Hidalgo');

INSERT INTO "indicadores_tramite_secretaria" ("secretaria_id", "tramite", "nivel_digitalizacion", "publicado")
SELECT 
  (SELECT "id" FROM "secretaria" WHERE "nombre" = 'Procuraduría General de Justicia'),
  'Atención ciudadana y recepción de quejas o denuncias en contra de servidores públicos de la PGJH',
  1.0,
  false
WHERE NOT EXISTS (SELECT 1 FROM "indicadores_tramite_secretaria" WHERE "tramite" = 'Atención ciudadana y recepción de quejas o denuncias en contra de servidores públicos de la PGJH');

INSERT INTO "indicadores_tramite_secretaria" ("secretaria_id", "tramite", "nivel_digitalizacion", "publicado")
SELECT 
  (SELECT "id" FROM "secretaria" WHERE "nombre" = 'Procuraduría General de Justicia'),
  'Constancia de vehículo no robado',
  3.1,
  true
WHERE NOT EXISTS (SELECT 1 FROM "indicadores_tramite_secretaria" WHERE "tramite" = 'Constancia de vehículo no robado');
