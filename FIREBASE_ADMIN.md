**Firebase Admin Setup (Interactify-API)**

Quick steps to enable server-side Firebase token verification using the existing `src/services/firebaseAdmin.ts` and the protected test route at `/api/protected/test-protected`.

- Provide service account JSON to the server in one of two ways:
  - File path: set `FIREBASE_SERVICE_ACCOUNT_PATH` to the absolute path of the JSON file.
  - Base64: set `FIREBASE_SERVICE_ACCOUNT_BASE64` to the base64-encoded JSON contents.

- Optional: set `FIREBASE_DATABASE_URL` if you need Realtime DB URL.

Example (PowerShell) using a file:

```
$env:FIREBASE_SERVICE_ACCOUNT_PATH = 'C:\path\to\service-account.json';
npm run dev
```

Example (PowerShell) using base64:

```
$env:FIREBASE_SERVICE_ACCOUNT_BASE64 = Get-Content 'C:\path\to\service-account.json' -Raw | Out-String | ForEach-Object { [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($_)) };
npm run dev
```

How to test the protected endpoint from the client:

1. On the frontend, after a successful Firebase login, get the ID token:

```
const idToken = await getAuth().currentUser.getIdToken();
```

2. Call the protected endpoint with the `Authorization` header:

```
curl -H "Authorization: Bearer <ID_TOKEN>" http://localhost:5000/api/protected/test-protected
```

The endpoint responds with JSON including the decoded token (`uid` and other claims).

Notes:
- The server already exposes middleware in `src/middleware/authMiddleware.ts` which uses the admin SDK.
- If you prefer the standard Firebase env var `GOOGLE_APPLICATION_CREDENTIALS`, you can set that before starting the process; the admin SDK will pick it up automatically. The repository helper supports direct path/base64 as well.
