import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch full user data including collegeId
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        collegeId: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Optional authentication - doesn't fail if no token, but sets req.user if token is valid
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      // No token, continue without setting req.user
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch full user data including collegeId
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        collegeId: true
      }
    });

    if (user) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Invalid token, continue without setting req.user
    next();
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    console.log('Checking role - User role:', req.user?.role, 'Required roles:', roles);
    
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // If roles is an array, check if user's role is in the array
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
