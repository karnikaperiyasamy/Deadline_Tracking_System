import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { config } from '../config';
import { JwtPayload } from '../types';
import { EmailService } from './email.service';

export class AuthService {
  static async register(name: string, email: string, password: string) {
    const normalizedEmail = email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const code = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');

    await prisma.registrationOtp.deleteMany({ where: { email: normalizedEmail } });
    await prisma.registrationOtp.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        codeHash,
        expiresAt,
      },
    });

    try {
      await EmailService.sendOTPEmail(normalizedEmail, name, code);
    } catch (error) {
      await prisma.registrationOtp.deleteMany({ where: { email: normalizedEmail } });
      throw error;
    }

    return { email: normalizedEmail, expiresAt };
  }

  static async verifyRegistration(email: string, code: string) {
    const pending = await prisma.registrationOtp.findFirst({ where: { email: email.toLowerCase() } });
    if (!pending || pending.expiresAt < new Date()) {
      throw new Error('This verification code has expired. Please request a new code.');
    }

    let isValid = false;
    if (pending.codeHash.startsWith('$2')) {
      isValid = await bcrypt.compare(code, pending.codeHash);
    } else {
      const inputHash = crypto.createHash('sha256').update(code).digest('hex');
      isValid = inputHash === pending.codeHash;
    }

    if (!isValid) {
      throw new Error('Invalid 6-digit verification code.');
    }

    const user = await prisma.user.create({
      data: {
        name: pending.name,
        email: pending.email,
        passwordHash: pending.passwordHash,
        settings: { create: { theme: 'dark', timezone: 'UTC', notificationEmail: true } },
      },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    await prisma.registrationOtp.deleteMany({ where: { email: pending.email } });
    return { user, token: this.generateToken(user.id, user.email) };
  }

  static async resendRegistrationOtp(email: string) {
    const normalizedEmail = email.toLowerCase();
    const pending = await prisma.registrationOtp.findFirst({ where: { email: normalizedEmail } });
    if (!pending) {
      throw new Error('No pending registration found for this email. Please sign up again.');
    }

    const code = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');

    await prisma.registrationOtp.update({
      where: { id: pending.id },
      data: { codeHash, expiresAt },
    });

    try {
      await EmailService.sendOTPEmail(normalizedEmail, pending.name, code);
    } catch (error) {
      await prisma.registrationOtp.update({
        where: { id: pending.id },
        data: { codeHash: pending.codeHash, expiresAt: pending.expiresAt },
      });
      throw error;
    }

    return { email: normalizedEmail, expiresAt };
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new Error('Invalid email or password credentials.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password credentials.');
    }

    const token = this.generateToken(user.id, user.email);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    return { user: safeUser, token };
  }

  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        settings: true,
      },
    });

    if (!user) {
      throw new Error('User account not found.');
    }

    return user;
  }

  static async updateProfile(userId: string, name?: string) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return updated;
  }

  static async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found.');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new Error('Current password does not match.');
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });
  }

  static generateToken(userId: string, email: string): string {
    const payload: JwtPayload = { userId, email };
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as any,
    });
  }
}
