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

// --- Security / transport headers -----------------------------------------
app.use(helmet());

// --- CORS -------------------------------------------------------------------
// `cors()` MUST be registered before any middleware that can throw. If an
// earlier middleware errors out, the error response would otherwise be
// generated without any `Access-Control-Allow-Origin` header, and the browser
// hides it from the client — axios then reports a generic "Network Error"
// instead of the real status/message.
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);

app.use(compression());

// --- Body parsing -----------------------------------------------------------
app.use(
  express.json({
    limit: "10mb",
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// --- Sanitization -----------------------------------------------------------
// Must run AFTER the body parsers (it needs `req.body`) and BEFORE `hpp`.
// It replaces Express 5's `express-mongo-sanitize`, which crashed every
// request by assigning to the getter-only `req.query`.
app.use(sanitizeRequest);

// --- HTTP parameter pollution ----------------------------------------------
// `hpp` mutates `req.query` in place. That only works because
// `sanitizeRequest` has already shadowed `req.query` with a stable, writable
// own property — on Express 5 `hpp`'s mutations would otherwise be thrown
// away on the next access of `req.query`.
app.use(hpp());

app.use(cookieParser());

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 }));

// rawBody for Paystack webhook signature is captured via express.json verify above.
// No extra raw middleware needed here.

app.get("/api/health", (_req, res) => res.json({ ok: true }));

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

const start = async () => {
  await connectDB();
  app.listen(env.port, () => console.log(`Backend running on port ${env.port}`));
};

start();
