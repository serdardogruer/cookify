import { PrismaClient, User } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateToken } from '../utils/jwt';
import { verifyGoogleToken } from '../utils/google-auth';
import kitchenService from './kitchen.service';

const prisma = new PrismaClient();

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
  kitchen?: {
    id: number;
    name: string;
    inviteCode: string;
  };
}

export class AuthService {
  /**
   * Kullanıcı kaydı yapar ve otomatik mutfak oluşturur
   * @param input - Kayıt bilgileri
   * @returns Kullanıcı, token ve mutfak bilgisi
   */
  async register(input: RegisterInput): Promise<AuthResponse> {
    // E-posta kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error('Bu e-posta adresi zaten kullanılıyor');
    }

    // Parolayı hashle
    const hashedPassword = await hashPassword(input.password);

    // Kullanıcı oluştur
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashedPassword,
        plainPassword: input.password, // Admin için plain text şifre
      },
    });

    // Otomatik mutfak oluştur (Task 3.1)
    const { kitchen, membership } = await kitchenService.createKitchenForNewUser(
      user.id,
      user.name
    );

    // JWT token oluştur
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    // Parolayı response'dan çıkar
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      kitchen: {
        id: kitchen.id,
        name: kitchen.name,
        inviteCode: kitchen.inviteCode,
      },
    };
  }

  /**
   * Kullanıcı girişi yapar
   * @param input - Giriş bilgileri
   * @returns Kullanıcı ve token bilgisi
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new Error('E-posta veya parola hatalı');
    }

    // Google ile kayıt olmuş kullanıcılar için şifre kontrolü yapma
    if (!user.password) {
      throw new Error('Bu hesap Google ile oluşturulmuş. Lütfen Google ile giriş yapın.');
    }

    // Parolayı doğrula
    const isPasswordValid = await comparePassword(input.password, user.password);

    if (!isPasswordValid) {
      throw new Error('E-posta veya parola hatalı');
    }

    // JWT token oluştur
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    // Parolayı response'dan çıkar
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Google OAuth ile giriş yapar
   * @param token - Google ID token
   * @returns Kullanıcı ve token bilgisi
   */
  async googleAuth(token: string): Promise<AuthResponse> {
    // Google token'ı doğrula
    const googleUser = await verifyGoogleToken(token);

    // Kullanıcıyı Google ID ile ara
    let user = await prisma.user.findUnique({
      where: { googleId: googleUser.googleId },
    });

    // Eğer Google ID ile bulunamazsa, email ile ara
    if (!user) {
      user = await prisma.user.findUnique({
        where: { email: googleUser.email },
      });

      // Email ile bulunduysa, Google ID'yi ekle
      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { 
            googleId: googleUser.googleId,
            profileImage: googleUser.picture || user.profileImage,
          },
        });
      }
    }

    // Hiç kullanıcı yoksa yeni oluştur
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: googleUser.name,
          email: googleUser.email,
          googleId: googleUser.googleId,
          profileImage: googleUser.picture,
        },
      });

      // Otomatik mutfak oluştur
      const { kitchen } = await kitchenService.createKitchenForNewUser(
        user.id,
        user.name
      );

      // JWT token oluştur
      const token = generateToken({
        userId: user.id,
        email: user.email,
      });

      const { password: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        token,
        kitchen: {
          id: kitchen.id,
          name: kitchen.name,
          inviteCode: kitchen.inviteCode,
        },
      };
    }

    // Mevcut kullanıcı için token oluştur
    const jwtToken = generateToken({
      userId: user.id,
      email: user.email,
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token: jwtToken,
    };
  }

  /**
   * Kullanıcı bilgilerini getirir
   * @param userId - Kullanıcı ID
   * @returns Kullanıcı bilgisi
   */
  async getUserById(userId: number): Promise<Omit<User, 'password'> | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export const authService = new AuthService();
export default authService;
