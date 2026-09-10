import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend directory or current working directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });

const readEnv = (key: string, opts?: { stripSpaces?: boolean }) => {
  const value = process.env[key] ?? '';
  const trimmed = value.trim();
  return opts?.stripSpaces ? trimmed.replace(/\s+/g, '') : trimmed;
};

const defaultNeonUrl =
  'postgresql://neondb_owner:npg_zriZkC1WQph9@ep-hidden-shape-b3qm86ks-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=15';

const getDatabaseUrl = () => {
  const url = readEnv('DATABASE_URL');
  if (!url || url.includes('skillbridge') || url.includes('dpg-dabv7k6k1f9s73dlugog')) {
    return defaultNeonUrl;
  }
  return url;
};

export const config = {
  env: readEnv('NODE_ENV') || 'development',
  port: parseInt(readEnv('PORT') || '5000', 10),
  clientUrls: readEnv('CLIENT_URL')
    ? readEnv('CLIENT_URL').split(',').map((url) => url.trim())
    : ['http://localhost:5173'],
  databaseUrl: getDatabaseUrl(),
  jwt: {
    secret: readEnv('JWT_SECRET') || 'fallback_jwt_secret_lifeos_dev',
    expiresIn: readEnv('JWT_EXPIRES_IN') || '7d',
  },
  ai: {
    provider: readEnv('AI_PROVIDER') || 'groq',
    apiKey: readEnv('AI_API_KEY') || '',
    groqApiKey: readEnv('GROQ_API_KEY') || '',
    model: readEnv('AI_MODEL') || 'openai/gpt-oss-120b',
  },
  smtp: {
    host: readEnv('SMTP_HOST') || 'smtp.gmail.com',
    port: parseInt(readEnv('SMTP_PORT') || '465', 10),
    user: readEnv('SMTP_USER') || 'karnikap376@gmail.com',
    pass: readEnv('SMTP_PASS', { stripSpaces: true }) || 'emzswvazajwkeoqi',
    from: readEnv('SMTP_FROM') || '"LifeOS Deadline Alerts" <karnikap376@gmail.com>',
    resendApiKey: readEnv('RESEND_API_KEY'),
  },
};
