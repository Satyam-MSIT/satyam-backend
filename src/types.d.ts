export {};

declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: any;
    }
  }
  namespace NodeJS {
    interface ProcessEnv {
      CORS: string;
      PORT: string;
      URI: string;
      AUTH_SECRET: string;
      ENCODE_SECRET: string;
      EMAIL_SECRET: string;
      LINK_SECRET: string;
      GMAIL_USER: string;
      GMAIL_PASS: string;
      MEGA_EMAIL: string;
      MEGA_PASSWORD: string;
      RENDER_EXTERNAL_URL: string | undefined;
    }
  }
}
