# OpenSound Backend

Backend para la aplicación móvil OpenSound

## Características

- Autenticación con JWT
- Registro y login de usuarios
- Base de datos MongoDB Atlas
- API REST
- CORS configurado para apps móviles

## Requisitos

- Node.js 16+
- MongoDB Atlas (cuenta gratuita)
- npm o yarn

## Instalación

1. Clona el repositorio
2. Instala dependencias:
   \`\`\`bash
   npm install
   \`\`\`

3. Copia `.env.example` a `.env` y configura tus variables:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

4. Edita `.env` con tus credenciales de MongoDB y JWT_SECRET

## Desarrollo

\`\`\`bash
npm run dev
\`\`\`

El servidor estará disponible en `http://localhost:4000`

## Producción

\`\`\`bash
npm start
\`\`\`

## Endpoints

### Health Check

- `GET /health` - Verifica que el servidor esté funcionando

### Autenticación

- `POST /auth/register` - Registrar nuevo usuario
  \`\`\`json
  {
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "mipassword123"
  }
  \`\`\`

- `POST /auth/login` - Iniciar sesión
  \`\`\`json
  {
  "email": "juan@example.com",
  "password": "mipassword123"
  }
  \`\`\`

- `GET /auth/me` - Obtener usuario actual (requiere token)
  - Header: `Authorization: Bearer <token>`

## Despliegue en EC2

1. Conecta a tu instancia EC2
2. Instala Node.js y npm
3. Clona el repositorio
4. Configura el archivo `.env` con tus credenciales
5. Instala PM2: `npm install -g pm2`
6. Inicia la app: `pm2 start src/index.js --name opensound-backend`
7. Configura PM2 para iniciar al arrancar: `pm2 startup` y `pm2 save`
8. Abre el puerto 4000 en el Security Group de EC2

### Configurar dominio (opcional)

Si tienes un dominio, configura Nginx como proxy inverso:

\`\`\`nginx
server {
listen 80;
server_name tudominio.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

}
\`\`\`

## Conectar desde la App Móvil

En tu app móvil, configura la URL base:

**Desarrollo local:**
\`\`\`
http://localhost:4000
\`\`\`

**Producción (EC2):**
\`\`\`
http://tu-ip-publica-ec2:4000
\`\`\`

O si configuraste dominio:
\`\`\`
http://tudominio.com
\`\`\`

## Estructura del Proyecto

\`\`\`
opensound-backend/
├── src/
│ ├── db.js # Conexión a MongoDB
│ ├── index.js # Servidor Express
│ ├── middleware/
│ │ └── auth.js # Middleware de autenticación JWT
│ ├── models/
│ │ └── User.js # Modelo de usuario
│ └── routes/
│ └── auth.js # Rutas de autenticación
├── .env # Variables de entorno (NO subir a git)
├── .env.example # Ejemplo de variables de entorno
├── package.json
└── README.md
\`\`\`
