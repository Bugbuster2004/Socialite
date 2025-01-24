import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(express.json());// this helps to extract the json data from req.body
app.use(cookieParser());// it will aloow to parse the cookies that is we can take the value out from jwt
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend/vite-project/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend/vite-project/dist", "index.html"));
  });
}
console.log("Static files served from:", path.join(__dirname, "frontend/vite-project/dist"));


server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});