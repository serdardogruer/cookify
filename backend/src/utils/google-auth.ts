import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export interface GoogleUserInfo {
  email: string;
  name: string;
  picture?: string;
  googleId: string;
}

/**
 * Google ID token'ı doğrular ve kullanıcı bilgilerini döner
 */
export async function verifyGoogleToken(token: string): Promise<GoogleUserInfo> {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    if (!payload || !payload.email || !payload.sub) {
      throw new Error('Geçersiz Google token');
    }

    return {
      email: payload.email,
      name: payload.name || payload.email.split('@')[0],
      picture: payload.picture,
      googleId: payload.sub,
    };
  } catch (error) {
    throw new Error('Google token doğrulaması başarısız');
  }
}
