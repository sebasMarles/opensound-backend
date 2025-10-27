# OpenSound Backend

Backend para la aplicación móvil OpenSound - Proyecto Universitario

## Características

- Autenticación con JWT
- Registro y login de usuarios
- Sistema de roles (user/admin)
- Panel de administración
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

5. Crea el usuario administrador inicial:
   \`\`\`bash
   npm run seed:admin
   \`\`\`

Esto creará un usuario administrador con:

- Email: `admin123@admin.com`
- Password: `admin123`
- Role: `admin`

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

- `POST /auth/register` - Registrar nuevo usuario (siempre con role "user")
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

### Administración (requiere role "admin")

Todas las rutas de administración requieren:

- Header: `Authorization: Bearer <token-de-admin>`

#### Gestión de Usuarios

- `GET /admin/users` - Listar todos los usuarios

  - Query params opcionales:
    - `?search=nombre` - Buscar por nombre o email

  Ejemplo:
  \`\`\`bash
  curl -H "Authorization: Bearer <token>" \
   http://localhost:4000/admin/users?search=juan
  \`\`\`

- `PUT /admin/users/:id` - Actualizar usuario
  \`\`\`json
  {
  "name": "Nuevo Nombre",
  "email": "nuevo@email.com",
  "role": "admin"
  }
  \`\`\`

  Ejemplo:
  \`\`\`bash
  curl -X PUT \
   -H "Authorization: Bearer <token>" \
   -H "Content-Type: application/json" \
   -d '{"role":"admin"}' \
   http://localhost:4000/admin/users/507f1f77bcf86cd799439011
  \`\`\`

- `DELETE /admin/users/:id` - Eliminar usuario

  - No permite que el admin se elimine a sí mismo

  Ejemplo:
  \`\`\`bash
  curl -X DELETE \
   -H "Authorization: Bearer <token>" \
   http://localhost:4000/admin/users/507f1f77bcf86cd799439011
  \`\`\`

#### Estadísticas

- `GET /admin/stats` - Obtener estadísticas del sistema

  Respuesta:
  \`\`\`json
  {
  "totalUsers": 150,
  "totalAdmins": 3,
  "recentUsers": [
  {
  "id": "...",
  "name": "Usuario Reciente",
  "email": "usuario@example.com",
  "role": "user",
  "createdAt": "2025-01-15T10:30:00.000Z"
  }
  ]
  }
  \`\`\`

## Ejemplos de Uso

### Registrar un usuario

\`\`\`bash
curl -X POST http://localhost:4000/auth/register \
 -H "Content-Type: application/json" \
 -d '{
"name": "Juan Pérez",
"email": "juan@example.com",
"password": "password123"
}'
\`\`\`

### Iniciar sesión como admin

\`\`\`bash
curl -X POST http://localhost:4000/auth/login \
 -H "Content-Type: application/json" \
 -d '{
"email": "admin123@admin.com",
"password": "admin123"
}'
\`\`\`

### Listar usuarios (como admin)

\`\`\`bash
curl http://localhost:4000/admin/users \
 -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
\`\`\`

## Despliegue en EC2

1. Conecta a tu instancia EC2
2. Instala Node.js y npm
3. Clona el repositorio
4. Configura el archivo `.env` con tus credenciales
5. Instala dependencias: `npm install`
6. Crea el usuario admin: `npm run seed:admin`
7. Instala PM2: `npm install -g pm2`
8. Inicia la app: `pm2 start src/index.js --name opensound-backend`
9. Configura PM2 para iniciar al arrancar: `pm2 startup` y `pm2 save`
10. Abre el puerto 4000 en el Security Group de EC2

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
http://192.168.1.X:4000
\`\`\`

**Producción (EC2):**
\`\`\`
http://tu-ip-publica-ec2:4000
\`\`\`

O si configuraste dominio:
\`\`\`
https://tudominio.com
\`\`\`

## Estructura del Proyecto

\`\`\`
opensound-backend/
├── src/
│ ├── db.js # Conexión a MongoDB
│ ├── index.js # Servidor Express
│ ├── middleware/
│ │ ├── auth.js # Middleware de autenticación JWT
│ │ └── authorize.js # Middleware de autorización por roles
│ ├── models/
│ │ └── User.js # Modelo de usuario
│ ├── routes/
│ │ ├── auth.js # Rutas de autenticación
│ │ └── admin.js # Rutas de administración
│ └── scripts/
│ └── seedAdmin.js # Script para crear usuario admin
├── .env # Variables de entorno (NO subir a git)
├── .env.example # Ejemplo de variables de entorno
├── package.json
└── README.md
\`\`\`

## Sistema de Roles

El backend implementa dos roles:

- **user**: Usuario normal, puede registrarse, iniciar sesión y usar la app
- **admin**: Administrador, tiene acceso a todas las rutas de `/admin`

### Seguridad de Roles

- Los usuarios que se registran siempre tienen role "user"
- Solo un admin puede cambiar el role de un usuario
- Los admins no pueden eliminarse a sí mismos
- Todas las rutas de admin están protegidas con middleware de autorización

## Seguridad

Este es un proyecto universitario con seguridad básica. Para producción real, considera:

- Rate limiting
- Validación más robusta
- HTTPS obligatorio
- Rotación de secretos JWT
- Logging estructurado
- Monitoreo de errores

## Licencia

Proyecto Universitario - Uso Educativo
