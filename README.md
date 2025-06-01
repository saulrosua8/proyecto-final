# Instrucciones para levantar los contenedores Docker

1. **Asegúrate de tener Docker y Docker Compose instalados en tu sistema.**

2. Abre una terminal en la raíz del proyecto (`proyecto-final`).

3. Ejecuta el siguiente comando para levantar todos los servicios definidos en `docker-compose.yml`:

```sh
docker-compose up --build
```

Esto construirá y levantará los contenedores necesarios para el backend, frontend y base de datos.

4. Para detener los contenedores, usa:

```sh
docker-compose down
```

---

- El frontend estará disponible en el puerto que definas en el `docker-compose.yml` (por defecto suele ser el 5173 o 3000).
- El backend estará disponible en el puerto 3000 (o el que definas en el compose).
- La base de datos (MySQL/MariaDB) estará disponible en el puerto 3306 (o el que definas).

**Recuerda:** Si es la primera vez que levantas los contenedores, revisa que los archivos de configuración y variables de entorno estén correctamente configurados.

---

Para más detalles, revisa los archivos `docker-compose.yml` y los Dockerfile de cada servicio.

# DOCUMENTACIÓN

Documentación Técnica – Sistema de Reservas de Clubs de Pádel
Índice
Descripción General
Arquitectura General
Backend
Estructura y tecnologías
Modelos de datos
Endpoints principales
Autenticación y roles
Dependencias
Frontend
Estructura y tecnologías
Componentes principales
Gestión de rutas y roles
Estilos y librerías UI
Dependencias
Instalación y Ejecución
Notas adicionales
1. Descripción General
Aplicación web para la gestión de reservas de pistas de pádel en clubs. Permite a administradores crear clubs, a los clubs gestionar sus pistas y reservas, y a los usuarios reservar pistas. Incluye paneles de control, estadísticas y autenticación por roles.

2. Arquitectura General
Backend: Node.js + Express + MySQL
Frontend: React + Tailwind CSS
Comunicación: API RESTful (JSON)
Autenticación: JWT (JSON Web Token)
Roles: Administrador, Club, Cliente
3. Backend
Estructura y Tecnologías
Node.js, Express, MySQL
Estructura modular: controladores, rutas, middlewares, configuración DB
Uso de JWT para autenticación y autorización
Multer para subida de imágenes (logos)
node-cron para tareas programadas (generación de horarios)
Modelos de Datos Principales
Definidos en db.sql:

usuarios:
id_usuario (PK), nombre, email, contraseña (hash), rol
clubes:
id_club (PK), nombre, provincia, dirección, teléfono, id_usuario (FK), apertura, cierre, descripción, logo, color, url_maps
pistas:
id_pista (PK), id_club (FK), nombre, tipo, precio, duración
horarios_stack:
id_horario (PK), id_pista (FK), fecha, hora_inicio, hora_fin, precio, disponibilidad
reservas:
id_reserva (PK), id_horario (FK), id_usuario (FK), precio, fecha, hora_inicio, horario_fin
Endpoints Principales
Usuarios
POST /api/usuarios – Crear usuario
POST /api/login – Login
POST /api/validate-token – Validar token
GET /api/usuarios – Listar usuarios (admin)
Clubes
GET /api/clubs – Listar clubs
POST /api/clubs – Crear club
PUT /api/clubs/:id_club – Editar club
DELETE /api/clubs/:id_club – Eliminar club
GET /api/clubs/search?query=... – Buscar clubs
GET /api/clubs/user – Clubs del usuario autenticado
POST /api/clubs/uploadClubLogo/:id_club – Subir logo
GET /api/clubs/:id_club/url_maps – Obtener URL de Google Maps
Pistas
POST /api/pistas – Listar pistas por club
POST /api/pistas/create – Crear pista
PUT /api/pistas/:id_pista – Editar pista
DELETE /api/pistas/:id_pista – Eliminar pista
Reservas
POST /api/reservas/create – Crear reserva
GET /api/reservas/usuario/:id_usuario – Reservas de usuario
GET /api/reservas/:fecha – Reservas por fecha
POST /api/reservas/cancelar/:id_reserva – Cancelar reserva
Estadísticas:
/api/reservas/mas-reservadas/:id_club
/api/reservas/horas-mas-reservadas/:id_club
/api/reservas/clientes-mas-reservas/:id_club
/api/reservas/ganancias/:id_club
Horarios
GET /api/horarios/:id_club/:fecha – Horarios disponibles
POST /api/horarios/toggle/:id_horario – Cambiar disponibilidad
Autenticación y Roles
JWT:
Login genera token, guardado en localStorage (frontend)
Middleware protege rutas sensibles
Roles:
'Administrador': gestión global (clubs, usuarios)
'Club': gestión de su club, pistas y reservas
'Cliente': reserva y gestión de sus reservas
Dependencias Backend
express, mysql2, dotenv, bcrypt, jsonwebtoken, multer, cors, node-cron
4. Frontend
Estructura y Tecnologías
React (funcional, hooks, context)
Tailwind CSS para estilos
React Router para navegación
Context API para autenticación global
Componentes Principales
Dashboard.jsx:
Vista principal, búsqueda y listado de clubs, panel de acciones según rol
MasterView.jsx:
Gestión de clubs (crear, editar, eliminar) – solo admin
AdminView.jsx:
Gestión de pistas, personalización de club, estadísticas (gráficos) – admin/club
ReservasView.jsx:
Gestión de reservas por club y fecha
ReservasUser.jsx:
Visualización y cancelación de reservas del usuario
ClubView.tsx:
Vista detallada de club, horarios y reservas
Login.jsx / Register.jsx:
Autenticación y registro
PrivateRoute.jsx:
Protección de rutas según rol
AuthContext.jsx:
Contexto global de usuario y token
Gestión de rutas y roles
Rutas protegidas con PrivateRoute
Redirección según rol tras login
Paneles y acciones visibles según permisos
Estilos y librerías UI
Tailwind CSS:
Configurado en tailwind.config.js y src/index.css
Gráficos:
react-chartjs-2, chart.js
Notificaciones:
react-hot-toast
Dependencias Frontend
react, react-dom, react-router-dom, tailwindcss, react-hot-toast, react-chartjs-2, chart.js, dayjs
5. Instalación y Ejecución
Requisitos previos
Node.js (v18+ recomendado)
MySQL
Pasos
Clonar el repositorio
Configurar la base de datos
Crear la base de datos y tablas usando el script db.sql
Configurar credenciales en .env (backend)
Instalar dependencias
En la raíz del proyecto:
En backend:
En frontend:
Ejecutar el proyecto
Desde la raíz:
Esto ejecuta backend y frontend en paralelo (ver scripts en package.json)
Frontend: http://localhost:5173
Backend: http://localhost:3000
6. Notas adicionales
El sistema está preparado para despliegue local. Para producción, configurar variables de entorno, CORS y seguridad adicional.
El backend incluye tareas programadas para generación automática de horarios diarios.
El frontend es responsive y utiliza componentes reutilizables y estilos modernos.
El sistema de roles permite una gestión granular de permisos y vistas.


