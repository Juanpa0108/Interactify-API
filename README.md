# Interactify API (TypeScript template)

Plantilla mínima de backend en TypeScript preparada para usar Firebase Admin SDK.

Quickstart

1. Copia `.env.example` a `.env` y configura `FIREBASE_SERVICE_ACCOUNT_PATH` (o `FIREBASE_SERVICE_ACCOUNT_BASE64`).
2. Instala dependencias:

```powershell
cd "c:\Users\Windows 11\Desktop\PI1\Tercer proyecto\Interactify-API"
npm install
```

3. Ejecuta en desarrollo:

```powershell
npm run dev
```

Archivos principales

- `src/index.ts` - servidor Express principal
- `src/services/firebaseAdmin.ts` - helper para inicializar Firebase Admin
- `src/routes/auth.ts` - rutas de ejemplo para auth
- `src/controllers/authController.ts` - controladores para auth
- `src/middleware/authMiddleware.ts` - middleware para verificar `idToken`

Notas sobre Firebase

- Para desarrollo local, descarga el JSON de la cuenta de servicio desde Firebase Console y apunta `FIREBASE_SERVICE_ACCOUNT_PATH` a ese archivo. No subir ese archivo al repositorio.
- En despliegues (Vercel, Heroku) puedes usar `FIREBASE_SERVICE_ACCOUNT_BASE64` con el JSON codificado en base64.

Ejemplo rápido de uso (cliente):

- Cliente obtiene `idToken` con Firebase Web SDK tras login y lo envía en `Authorization: Bearer <idToken>` para acceder a rutas protegidas.
