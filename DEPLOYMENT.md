# Guía de Despliegue en Producción

## Prerrequisitos

### 1. Configurar SSL en el servidor

```bash
# Instalar certbot en Rocky Linux
sudo dnf install certbot

# Obtener certificado SSL gratuito
sudo certbot certonly --standalone -d srv885729.hstgr.cloud

# Crear directorio SSL en el proyecto
mkdir -p ssl

# Copiar certificados (ajustar rutas según certbot)
sudo cp /etc/letsencrypt/live/srv885729.hstgr.cloud/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/srv885729.hstgr.cloud/privkey.pem ssl/key.pem

# Configurar permisos
sudo chmod 644 ssl/cert.pem
sudo chmod 600 ssl/key.pem
sudo chown $USER:$USER ssl/*
```

### 2. Configurar variables de entorno

```bash
# Copiar archivo de entorno
cp .env.production .env

# IMPORTANTE: Editar y cambiar la contraseña de la base de datos
nano .env
```

## Despliegue

### 1. Limpiar contenedores existentes (si los hay)

```bash
# Detener y eliminar contenedores existentes
docker stop $(docker ps -q)
docker rm $(docker ps -aq)
docker system prune -f
```

### 2. Desplegar la aplicación

```bash
# Construir y ejecutar con variables de entorno
docker-compose --env-file .env up -d --build
```

### 3. Verificar el despliegue

```bash
# Verificar que los contenedores estén corriendo
docker ps

# Verificar logs
docker-compose logs -f

# Probar la aplicación
curl -k https://srv885729.hstgr.cloud/api/status
```

## Configuración de Seguridad

### Headers de Seguridad Configurados:
- ✅ HSTS (Strict-Transport-Security)
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ X-XSS-Protection
- ✅ Referrer-Policy

### SSL/TLS:
- ✅ Redirección automática HTTP → HTTPS
- ✅ TLS 1.2 y 1.3
- ✅ Cifrados seguros
- ✅ Certificados SSL configurados

## Puertos Expuestos

- **Puerto 80**: Redirección a HTTPS
- **Puerto 443**: HTTPS (SSL/TLS)

## Estructura de Archivos SSL

```
ssl/
├── cert.pem    # Certificado SSL
└── key.pem     # Clave privada SSL
```

## Troubleshooting

### Error de certificados SSL
```bash
# Verificar certificados
openssl x509 -in ssl/cert.pem -text -noout
openssl rsa -in ssl/key.pem -check
```

### Error de permisos
```bash
# Corregir permisos de certificados
sudo chown $USER:$USER ssl/*
sudo chmod 644 ssl/cert.pem
sudo chmod 600 ssl/key.pem
```

### Verificar conectividad
```bash
# Probar conexión HTTPS
curl -k https://srv885729.hstgr.cloud
```
