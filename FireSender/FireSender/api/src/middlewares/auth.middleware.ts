import { Request, Response, NextFunction } from 'express';
import { validateToken } from '../routes/auth.route';

// Middleware to check user plan and access to filters
export const AuthMiddleware = async (req: any, res: Response, next: NextFunction) => {
    const authorization = req.headers['authorization'];
    if (!authorization) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    try {
        const user = validateToken(authorization.split(' ')[1]);
        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Unauthorized' });
    }
}

