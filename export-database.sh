#!/bin/bash
echo "Exportando esquema de base de datos..."
PGPASSWORD=Gob13rnoDB$ pg_dump -U postgres -h localhost -p 5432 -d observatorio_regulatorio -s > postgres-init/01-schema.sql

echo "Exportando datos de la base de datos..."
PGPASSWORD=Gob13rnoDB$ pg_dump -U postgres -h localhost -p 5432 -d observatorio_regulatorio -a > postgres-init/02-data.sql

echo "Exportación completada. Los archivos se encuentran en la carpeta postgres-init/"
echo "Ahora puedes construir y ejecutar los contenedores Docker con: docker-compose up -d"
