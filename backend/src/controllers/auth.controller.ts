import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mlcs-super-secret-key-2026';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { username: username || 'admin' }
      });

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        data: {
          token,
          user: {
            name: user.name,
            username: user.username,
            role: user.role
          }
        }
      });
    } catch (error) { next(error); }
  }

  static async setup(req: Request, res: Response, next: NextFunction) {
    try {
      const userCount = await prisma.user.count();
      if (userCount > 0) {
        return res.status(400).json({ success: false, message: 'Setup already completed' });
      }

      const { username, password, name } = req.body;
      const hashedPassword = await bcrypt.hash(password || 'admin123', 10);

      const user = await prisma.user.create({
        data: {
          username: username || 'admin',
          password: hashedPassword,
          name: name || 'Mazhar Abbas',
          role: 'ADMIN'
        }
      });

      res.status(201).json({ success: true, message: 'Admin user created successfully' });
    } catch (error) { next(error); }
  }

  static async updatePassword(req: any, res: Response, next: NextFunction) {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = req.user.id;

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) return res.status(400).json({ success: false, message: 'Incorrect current password' });

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword }
      });

      res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) { next(error); }
  }
}
