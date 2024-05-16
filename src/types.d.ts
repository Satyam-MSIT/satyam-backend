import { UserType } from "./models/User";

declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: UserType;
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
      CLOUDINARY_API_KEY: string;
      CLOUDINARY_API_SECRET: string;
      CLOUDINARY_CLOUD_NAME: string;
      MEGA_EMAIL: string;
      MEGA_PASSWORD: string;
      RENDER_EXTERNAL_URL: string | undefined;
    }
  }
}
