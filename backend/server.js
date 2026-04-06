import express from "express";
import cors from "cors";
import authroutes from "./routes/auth.js";
import libroutes from "./routes/library.js";
import { env } from "./config/env.js";
import prisma from "./config/prisma.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5000",
    credentials: true,
  }),
);
app.use(express.json());

app.use("/auth", authroutes);
app.use("/library", libroutes);

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(env.PORT, () => {
  console.log(`Listening on ${env.PORT}`);
});
