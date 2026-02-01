import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import cors from "cors";
import "dotenv/config";
import express from "express";
import session from "express-session";
import cron from "node-cron";
import passport from "passport";

import "./config/passport";
import { runPruning } from "./config/pruningService";
import { prisma } from "./lib/prisma";
import adminRouter from "./routes/adminRoutes";
import authRouter from "./routes/authRoutes";
import excommRouter from "./routes/excommRoutes";
import memberRouter from "./routes/memberRoutes";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
const app = express();

const isProduction = process.env.NODE_ENV === "production";

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

if (isProduction) {
  app.set("trust proxy", 1);
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || "6SaM6PDmJU07TCeReoT1yl9wqRwkzJMM",
    resave: false,
    saveUninitialized: true,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
    cookie: {
      secure: isProduction,
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/moderator", excommRouter);
app.use("/api/member", memberRouter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.json({ message: "hello" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`App listening at port ${port}`));

cron.schedule(
  "0 5 1 * *",
  () => {
    console.log(
      "----------------------------------------------------------------------------"
    );
    console.log("Running scheduled cron job");
    runPruning();
    console.log(
      "----------------------------------------------------------------------------"
    );
  },
  {
    timezone: "Asia/Kolkata",
  }
);
