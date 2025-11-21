import { Request, Response, NextFunction } from 'express';
import firebaseAdmin from '../services/firebaseAdmin';

// Validación de email
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
};

// Validación de contraseña (mínimo 6 caracteres)
const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

/**
 * Registro de usuario con email y contraseña
 * Campos: firstName, lastName, email, password
 */
export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const admin = firebaseAdmin.init();
    const { firstName, lastName, email, password } = req.body;

    // Validaciones
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son requeridos: firstName, lastName, email, password' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Crear usuario en Firebase Auth
    const displayName = `${firstName} ${lastName}`;
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    // Guardar información adicional en Firestore (preparado para cuando se configure)
    // TODO: Guardar firstName, lastName, email en Firestore cuando esté configurado
    // const db = admin.firestore();
    // await db.collection('users').doc(userRecord.uid).set({
    //   firstName,
    //   lastName,
    //   email,
    //   createdAt: admin.firestore.FieldValue.serverTimestamp(),
    // });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        firstName,
        lastName,
      },
    });
  } catch (err: any) {
    if (err.code === 'auth/email-already-exists') {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    if (err.code === 'auth/invalid-email') {
      return res.status(400).json({ error: 'Email inválido' });
    }
    if (err.code === 'auth/weak-password') {
      return res.status(400).json({ error: 'La contraseña es muy débil' });
    }
    next(err);
  }
}

/**
 * Login con email y contraseña
 * El cliente debe usar Firebase SDK para autenticar y luego enviar el idToken
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const admin = firebaseAdmin.init();
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'idToken requerido' });
    }

    // Verificar el token de Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Obtener información del usuario
    const userRecord = await admin.auth().getUser(decodedToken.uid);

    res.json({
      message: 'Login exitoso',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
      },
      token: idToken, // Devolver el token para que el cliente lo guarde
    });
  } catch (err: any) {
    if (err.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    if (err.code === 'auth/id-token-revoked') {
      return res.status(401).json({ error: 'Token revocado' });
    }
    if (err.code === 'auth/invalid-id-token') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    next(err);
  }
}

/**
 * Login con Google
 * El cliente debe usar Firebase SDK para autenticar con Google y luego enviar el idToken
 */
export async function loginWithGoogle(req: Request, res: Response, next: NextFunction) {
  try {
    const admin = firebaseAdmin.init();
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'idToken requerido' });
    }

    // Verificar el token de Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Obtener información del usuario
    const userRecord = await admin.auth().getUser(decodedToken.uid);

    // Si el usuario no existe en Firestore, crearlo (preparado para cuando se configure)
    // TODO: Verificar/crear usuario en Firestore cuando esté configurado

    res.json({
      message: 'Login con Google exitoso',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
      },
      token: idToken,
    });
  } catch (err: any) {
    if (err.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    if (err.code === 'auth/invalid-id-token') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    next(err);
  }
}

/**
 * Login con GitHub
 * El cliente debe usar Firebase SDK para autenticar con GitHub y luego enviar el idToken
 */
export async function loginWithGitHub(req: Request, res: Response, next: NextFunction) {
  try {
    const admin = firebaseAdmin.init();
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'idToken requerido' });
    }

    // Verificar el token de Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Obtener información del usuario
    const userRecord = await admin.auth().getUser(decodedToken.uid);

    // Si el usuario no existe en Firestore, crearlo (preparado para cuando se configure)
    // TODO: Verificar/crear usuario en Firestore cuando esté configurado

    res.json({
      message: 'Login con GitHub exitoso',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
      },
      token: idToken,
    });
  } catch (err: any) {
    if (err.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    if (err.code === 'auth/invalid-id-token') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    next(err);
  }
}

/**
 * Logout
 * El cliente debe revocar el token en su lado, este endpoint solo confirma
 */
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    // Firebase Auth maneja el logout en el cliente
    // Este endpoint puede usarse para logging o limpieza adicional si es necesario
    res.json({ message: 'Logout exitoso' });
  } catch (err) {
    next(err);
  }
}

/**
 * Verificar token (endpoint auxiliar)
 */
export async function verifyToken(req: Request, res: Response, next: NextFunction) {
  try {
    const admin = firebaseAdmin.init();
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'idToken requerido' });

    const decoded = await admin.auth().verifyIdToken(idToken);
    res.json({ uid: decoded.uid, decoded });
  } catch (err) {
    next(err);
  }
}

/**
 * Obtener perfil del usuario autenticado
 */
export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const admin = firebaseAdmin.init();
    const user = (req as any).user; // Viene del middleware

    if (!user || !user.uid) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Obtener información completa del usuario
    const userRecord = await admin.auth().getUser(user.uid);

    // TODO: Obtener información adicional de Firestore cuando esté configurado
    // const db = admin.firestore();
    // const userDoc = await db.collection('users').doc(user.uid).get();
    // const userData = userDoc.data();

    // Por ahora, extraer firstName y lastName del displayName si existe
    let firstName = '';
    let lastName = '';
    if (userRecord.displayName) {
      const nameParts = userRecord.displayName.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }

    res.json({
      firstName,
      lastName,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      uid: userRecord.uid,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Actualizar perfil del usuario
 * Por ahora solo actualiza el displayName en Firebase Auth
 * TODO: Actualizar en Firestore cuando esté configurado
 */
export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const admin = firebaseAdmin.init();
    const user = (req as any).user; // Viene del middleware

    if (!user || !user.uid) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const { firstName, lastName } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'firstName y lastName son requeridos' });
    }

    const displayName = `${firstName} ${lastName}`;

    // Actualizar en Firebase Auth
    await admin.auth().updateUser(user.uid, {
      displayName,
    });

    // TODO: Actualizar en Firestore cuando esté configurado
    // const db = admin.firestore();
    // await db.collection('users').doc(user.uid).update({
    //   firstName,
    //   lastName,
    //   updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    // });

    // Obtener usuario actualizado
    const userRecord = await admin.auth().getUser(user.uid);

    res.json({
      message: 'Perfil actualizado exitosamente',
      user: {
        firstName,
        lastName,
        email: userRecord.email,
        displayName: userRecord.displayName,
        uid: userRecord.uid,
      },
    });
  } catch (err) {
    next(err);
  }
}
