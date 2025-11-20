import admin from 'firebase-admin';
import fs from 'fs';

export function init() {
  if (admin.apps && admin.apps.length) return admin.app();

  const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  let serviceAccount: any = undefined;

  if (path) {
    if (!fs.existsSync(path)) {
      throw new Error(`FIREBASE_SERVICE_ACCOUNT_PATH file not found: ${path}`);
    }
    serviceAccount = JSON.parse(fs.readFileSync(path, 'utf8'));
  } else if (b64) {
    const json = Buffer.from(b64, 'base64').toString('utf8');
    serviceAccount = JSON.parse(json);
  }

  const config: any = {};
  if (process.env.FIREBASE_DATABASE_URL) config.databaseURL = process.env.FIREBASE_DATABASE_URL;

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      ...config,
    });
  } else {
    admin.initializeApp({
      ...config,
    });
  }

  return admin;
}

export default { init };
