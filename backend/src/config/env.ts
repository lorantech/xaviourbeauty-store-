import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  jwtSecret: process.env.JWT_SECRET || "dev_secret_change_me",
  jwtExpiresIn: "7d",
  paystackSecret: process.env.PAYSTACK_SECRET_KEY || "",
  paystackPublic: process.env.PAYSTACK_PUBLIC_KEY || "",
  cloudinaryCloud: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinarySecret: process.env.CLOUDINARY_API_SECRET || "",
  emailHost: process.env.EMAIL_HOST || "",
  emailPort: Number(process.env.EMAIL_PORT || 587),
  emailUser: process.env.EMAIL_USER || "",
  emailPass: process.env.EMAIL_PASSWORD || "",
  emailFrom: process.env.EMAIL_FROM || "noreply@xaviourbeautystore.com",
  resetUrl: process.env.PASSWORD_RESET_URL || "http://localhost:3000/reset-password",
};
