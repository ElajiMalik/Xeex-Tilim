import jwt from 'jsonwebtoken';
import { Role, hasRequiredRole } from '../common/roles.js';
import { users } from '../data/store.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me';

export function createToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '8h' },
  );
}

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant.' });
  }

  try {
    const token = authHeader.slice(7);
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Token invalide.' });
  }
}

export function requireRole(minRole = Role.CITOYEN) {
  return (req, res, next) => {
    if (!req.user?.role) {
      return res.status(403).json({ message: 'Rôle absent du token.' });
    }

    if (!hasRequiredRole(req.user.role, minRole)) {
      return res.status(403).json({
        message: `Accès refusé. Rôle minimum requis: ${minRole}. Votre rôle: ${req.user.role}.`,
      });
    }

    return next();
  };
}

export function loginHandler(req, res) {
  const { email, mot_de_passe: motDePasse } = req.body;
  const user = users.find((u) => u.email === email && u.mot_de_passe === motDePasse);

  if (!user) {
    return res.status(401).json({ message: 'Identifiants invalides.' });
  }

  return res.json({ access_token: createToken(user) });
}
