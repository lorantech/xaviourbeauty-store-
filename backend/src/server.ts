import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { sanitizeRequest } from "./middleware/sanitize";

import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import cartRoutes from "./routes/cartRoutes";
import orderRoutes from "./routes/orderRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import ceoRoutes from "./routes/ceoRoutes";
import testimonialRoutes from "./routes/testimonialRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";

const app = express();

app.use(helmet());

const allowedOrigins = [
  env.frontendUrl,
  "https://xaviourbeautystore.vercel.app",
  "https://xaviour.vercel.app",
  "https://frontend-tau-orpin-61.vercel.app",
  /\.vercel\.app$/,
];

app.use((req: any, res: any, next: any) => {
  const origin = req.headers.origin;
  res.setHeader("Access-Control-Allow-Origin", origin || "https://frontend-totk7ugk7-loran4.vercel.app");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Requested-With,Accept");
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});

app.use(compression());
app.use(
  express.json({
    limit: "10mb",
    verify: (req: any, _res: any, buf: any) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeRequest);
app.use(hpp());
app.use(cookieParser());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 }));

app.use("/api/payments/webhook", express.raw({ type: "*/*" }), (req: any, _res: any, next: any) => {
  if (Buffer.isBuffer(req.body)) {
    try { req.body = JSON.parse(req.body.toString()); } catch { req.body = {}; }
  }
  next();
});

app.get("/api/health", (_req: any, res: any) => res.json({ ok: true }));
app.get("/api", (_req: any, res: any) => res.json({ ok: true, message: "Xaviourbeautystore API" }));
app.get("/api/", (_req: any, res: any) => res.json({ ok: true, message: "Xaviourbeautystore API" }));
app.get("/", (_req: any, res: any) => res.json({ ok: true, message: "Xaviourbeautystore API" }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/ceo-corner", ceoRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admin", dashboardRoutes);

app.use(errorHandler);

let isConnected = false;
const connectOnce = async () => {
  if (isConnected) return;
  await connectDB();
  isConnected = true;
};

if (process.env.VERCEL) {
  connectOnce().catch((e: any) => console.error("DB connect error:", e.message));
} else {
  const start = async () => {
    await connectDB();
    app.listen(env.port, () => console.log(`Backend running on port ${env.port}`));
  };
  start().catch((e: any) => {
    console.error("Failed to start server:", e);
    process.exit(1);
  });
}

export default app;
export { app };
