import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env.js";

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, password: hash, name },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: "User created",
      success: true,
      token,
      user: userWithoutPassword,
    });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(400).json({ error: "Email already in use" });
    }

    res.status(500).json({ error: "Registration failed" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.json({ error: "Invalid Email" });
    }

    if (!user.password) {
      return res.json({ error: "Please login using google" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.json({ error: "Invalid Password" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const googleLogin = async (req, res) => {
  const { idToken } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(400).json({ error: "Invalid Google Token" });
    }

    const user = await prisma.user.upsert({
      where: { email: payload.email },
      update: { googleId: payload.sub },
      create: {
        email: payload.email,
        name: payload.name,
        googleId: payload.sub,
      },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    console.log(token);
    const { password, ...userWithoutPassword } = user;

    res.json({ token: token, user: userWithoutPassword });
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(401).json({ error: "Authentication failed" });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, googleId: true },
    });

    if (!user) {
      return res.json({ error: "user not found" });
    }

    res.json({ user });
  } catch (err) {
    res.json({ error: "Server error" });
  }
};
