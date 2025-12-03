/**
 * Auth controller
 *
 * Exposes handlers for authentication-related routes used by the frontend.
 * Important notes:
 * - Authentication (passwords, social sign-in) is handled by Firebase Auth on the client.
 * - The server verifies the Firebase ID token (sent by the client) using `firebase-admin`.
 * - The server creates/ensures a Firestore `users` profile document for application data.
 *
 * Endpoints and expected payloads (overview):
 * - POST /api/auth/signup
 *     body: { firstName, lastName, email, password }
 *     Creates a Firebase Auth user (server-side) and a Firestore profile.
 * - POST /api/auth/login
 *     body: { idToken }
 *     Verifies the ID token and returns merged Auth + Firestore profile.
 * - POST /api/auth/login/google
 * - POST /api/auth/login/github
 *     body: { idToken }
 *     Social sign-ins: client obtains ID token via Firebase client SDK and sends it here.
 * - GET /api/user/profile (protected)
 *     Header: Authorization: Bearer <idToken>
 *     Returns user profile data.
 * - PUT /api/user/update (protected)
 *     Header: Authorization: Bearer <idToken>
 *     body: { firstName, lastName }
 *
 * Error handling:
 * - Returns 400 for missing or invalid payloads, 401 for token issues, 409 for email conflict.
 */
import { Request, Response, NextFunction } from 'express';
import firebaseAdmin from '../services/firebaseAdmin';
import userModel from '../models/User';
import User from '../models/User';
import { AuthEmail } from '../emails/AuthEmail';

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

    // Two modes supported for signup:
    // 1) Client-side creates the Firebase Auth user (recommended): client sends { idToken, firstName, lastName }
    //    Server verifies idToken and creates/ensures the Firestore profile for the uid.
    // 2) Server-side creation: client sends { firstName, lastName, email, password } and server creates the Auth user.
    const { idToken, firstName, lastName, email, password } = req.body;

    if (idToken) {
      // Mode 1: verify token and create/ensure profile
      const decoded = await admin.auth().verifyIdToken(idToken);
      const uid = decoded.uid;

      // Basic validation for names
      if (!firstName || !lastName) {
        return res.status(400).json({ error: 'firstName and lastName are required when using idToken' });
      }

      try {
        await userModel.createUserProfile(uid, { firstName, lastName, email: decoded.email || email });
      } catch (e) {
        console.warn('[signup] Failed to create Firestore profile:', (e as any)?.message || e);
      }

      return res.status(201).json({
        message: 'Usuario registrado exitosamente (client-side auth)',
        user: { uid, email: decoded.email, displayName: decoded.name, firstName, lastName },
        token: idToken,
      });
    }

    // Mode 2: server-side create
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son requeridos: firstName, lastName, email, password' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Crear usuario en Firebase Auth (server-side)
    const displayName = `${firstName} ${lastName}`;
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    try {
      await userModel.createUserProfile(userRecord.uid, { firstName, lastName, email });
    } catch (e) {
      console.warn('[signup] Failed to create Firestore profile:', (e as any)?.message || e);
    }

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

    // Ensure Firestore profile exists (create if missing)
    try {
      const existing = await userModel.getUserProfile(userRecord.uid);
      if (!existing) {
        const nameParts = (userRecord.displayName || '').split(' ');
        await userModel.createUserProfile(userRecord.uid, {
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: userRecord.email || undefined,
        });
      }
    } catch (e) {
      console.warn('[login] could not ensure Firestore profile', (e as any)?.message || e);
    }

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

    // Ensure Firestore profile exists (create if missing)
    try {
      const existing = await userModel.getUserProfile(userRecord.uid);
      if (!existing) {
        const nameParts = (userRecord.displayName || '').split(' ');
        await userModel.createUserProfile(userRecord.uid, {
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: userRecord.email || undefined,
        });
      }
    } catch (e) {
      console.warn('[loginWithGoogle] could not create Firestore profile', (e as any)?.message || e);
    }

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

    // Ensure Firestore profile exists (create if missing)
    try {
      const existing = await userModel.getUserProfile(userRecord.uid);
      if (!existing) {
        const nameParts = (userRecord.displayName || '').split(' ');
        await userModel.createUserProfile(userRecord.uid, {
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: userRecord.email || undefined,
        });
      }
    } catch (e) {
      console.warn('[loginWithGitHub] could not create Firestore profile', (e as any)?.message || e);
    }

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

    // Obtener información adicional de Firestore si existe
    let userData = null
    try {
      userData = await userModel.getUserProfile(user.uid)
    } catch (e) {
      console.warn('[getProfile] could not read Firestore profile', (e as any)?.message || e)
    }

    // Merge Auth and Firestore profile fields
    const firstName = userData?.firstName || (userRecord.displayName ? userRecord.displayName.split(' ')[0] : '')
    const lastName = userData?.lastName || (userRecord.displayName ? userRecord.displayName.split(' ').slice(1).join(' ') : '')

    res.json({
      firstName,
      lastName,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      uid: userRecord.uid,
      profile: userData,
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

    // Actualizar en Firestore si está configurado
    try {
      await userModel.updateUserProfile(user.uid, { firstName, lastName })
    } catch (e) {
      console.warn('[updateProfile] could not update Firestore profile', (e as any)?.message || e)
    }

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

/**
 * Eliminar cuenta del usuario autenticado
 * - Borra el documento de perfil en Firestore (si existe)
 * - Borra el usuario de Firebase Auth mediante admin SDK
 */
export async function deleteAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const admin = firebaseAdmin.init();
    const user = (req as any).user; // Viene del middleware

    if (!user || !user.uid) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Intentar eliminar el perfil en Firestore, pero no abortar si falla
    try {
      await userModel.deleteUserProfile(user.uid);
    } catch (e) {
      console.warn('[deleteAccount] could not delete Firestore profile', (e as any)?.message || e);
    }

    // Eliminar el usuario en Firebase Auth
    await admin.auth().deleteUser(user.uid);

    res.json({ message: 'Cuenta eliminada exitosamente' });
  } catch (err) {
    next(err);
  }
}

/**
 * Initiates the password recovery process.
 *
 * @async
 * @function forgotPassword
 * @param {Request} req - HTTP request object
 * @param {Response} res - HTTP response object
 * @returns {Promise<void>}
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void | Response> => {
  const { email } = req.body
  const user = await User.getUserByEmail({ email })

  if (!user) {
    const error = new Error('There is no user with that email')
    return res.status(404).json({ error: error.message })
  }

  await AuthEmail.sendConfirmationEmail({ email: user.email, id: user.uid.toString() })

  res.json({ msg: 'We have sent an email with instructions' })
}

/**
 * Resets a user's password using an ID received in the query parameters.
 *
 * @async
 * @function resetPassword
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Promise<void>}
 *
 * @example
 * // POST /reset-password?id=123
 * // Body: { "password": "12345678", "confirmPassword": "12345678" }
 * // Response: { "msg": "Password updated successfully" }
 */
export const resetPassword = async (req: Request, res: Response): Promise<void | Response> => {
  const { password, confirmPassword } = req.body
  const { id } = req.query

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' })
  }

  const user = await User.getUserProfile(id as string)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  // Actualizar la contraseña en Firebase Authentication
  try {
    const admin = firebaseAdmin.init()
    await admin.auth().updateUser(id as string, {
      password: password
    })
    
    res.json({ msg: 'Password updated successfully' })
  } catch (error) {
    console.error('Error updating password:', error)
    res.status(500).json({ error: 'Failed to update password' })
  }
}