# Interactify API (TypeScript)

Backend en TypeScript para Interactify usando Firebase Admin SDK y Express.

## Funcionalidades Implementadas

### HU1: Autenticación
- ✅ Registro con email y contraseña (firstName, lastName, email, password)
- ✅ Login con email y contraseña
- ✅ Login con Google
- ✅ Login con GitHub
- ✅ Logout
- ✅ Validación de formularios (email válido, contraseña mínimo 6 caracteres)

### HU2: Perfil de Usuario
- ✅ Ver perfil (nombre y email)
- ✅ Editar nombre (firstName, lastName)
- ⏳ Guardado en Firestore (preparado, pendiente configuración)

## Quickstart

1. Copia `.env.example` a `.env` y configura `FIREBASE_SERVICE_ACCOUNT_PATH` (o `FIREBASE_SERVICE_ACCOUNT_BASE64`).
2. Instala dependencias:

```bash
npm install
```

3. Ejecuta en desarrollo:

```bash
npm run dev
```

## Endpoints

### Autenticación

- `POST /api/auth/signup` - Registro de usuario
  - Body: `{ firstName, lastName, email, password }`
  
- `POST /api/auth/login` - Login con email/password
  - Body: `{ idToken }` (obtenido del cliente Firebase)
  
- `POST /api/auth/login/google` - Login con Google
  - Body: `{ idToken }` (obtenido del cliente Firebase)
  
- `POST /api/auth/login/github` - Login con GitHub
  - Body: `{ idToken }` (obtenido del cliente Firebase)
  
- `POST /api/auth/logout` - Logout

- `POST /api/auth/verify` - Verificar token

### Perfil de Usuario

- `GET /api/user/profile` - Obtener perfil (requiere autenticación)
- `POST /api/user/update` - Actualizar perfil (requiere autenticación)
  - Body: `{ firstName, lastName }`

## Archivos principales

- `src/index.ts` - servidor Express principal
- `src/services/firebaseAdmin.ts` - helper para inicializar Firebase Admin
- `src/routes/auth.ts` - rutas de autenticación
- `src/controllers/authController.ts` - controladores para auth y perfil
- `src/middleware/authMiddleware.ts` - middleware para verificar `idToken`

## Notas sobre Firebase

- Para desarrollo local, descarga el JSON de la cuenta de servicio desde Firebase Console y apunta `FIREBASE_SERVICE_ACCOUNT_PATH` a ese archivo. No subir ese archivo al repositorio.
- En despliegues (Vercel, Heroku) puedes usar `FIREBASE_SERVICE_ACCOUNT_BASE64` con el JSON codificado en base64.
- **Firestore**: El código está preparado para guardar datos adicionales en Firestore. Cuando tengas las credenciales, descomenta las secciones marcadas con `TODO` en `authController.ts`.

## Uso del Cliente

El cliente debe:
1. Autenticarse con Firebase Web SDK (email/password, Google, o GitHub)
2. Obtener el `idToken` del usuario autenticado
3. Enviar el `idToken` en el header `Authorization: Bearer <idToken>` para acceder a rutas protegidas
