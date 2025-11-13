import express from "express";
import { z } from "zod";
const userRouter = express();
import prisma from "../db/index.js";
import dotenv from "dotenv";
import { signUpSchema, signInSchema } from "@shiva200701/todotypes";
import crypto from "crypto";
import { hashPassword, verifyPassword } from "../utils/passwordHasher.js";

dotenv.config();

userRouter.use(express.json());

userRouter.post("/signup", async (req, res) => {
  const { data, success, error } = signUpSchema.safeParse(req.body);

  if (!success) {
    return res.status(400).json({
      msg: "send valid data",
      error,
    });
  }

  const { username, password, email } = data;
  const { hashedPassword } = await hashPassword(password);
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });
    if (user) {
      if (username == user.username) {
        return res.status(400).json({
          msg: "username already taken",
        });
      }
      if (email == user.email) {
        return res.status(400).json({
          msg: "email already taken",
        });
      }
    }

    const newUser = await prisma.user.create({
      data: {
        username,
        hashedPassword,
        email,
      },
    });
    //create session for user
    req.session.userId = newUser.id;
    return res.status(201).json({
      msg: "user created sucessfully",
    });
  } catch (error) {
    console.error("error inserting user", error);
    return res.status(400).json({
      msg: error,
    });
  }
});

userRouter.post("/signin", async (req, res) => {
  const { data, success, error } = signInSchema.safeParse(req.body);

  if (!success) {
    return res.status(400).json({
      msg: "send valid data",
      error,
    });
  }

  const { username, password } = data;

  try {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    if (!user) {
      return res.status(400).json({
        msg: "User does not exist",
      });
    }

    if (!user.hashedPassword || !await verifyPassword(password, user.hashedPassword)) {
      return res.status(400).json({
        msg: "Please Enter a Valid password",
      });
    }
     // Normal flow - just set userId and save
     req.session.userId = user.id;
    
     req.session.save((err) => {
       if (err) {
         console.error("Session save error:", err);
         return res.status(500).json({ msg: "Session error" });
       }
       
       // Manually set cookie since express-session isn't doing it
       const secret = process.env.SESSION_SECRET || '';
       
       // Sign the session ID (express-session format)
       const signature = crypto
         .createHmac('sha256', secret)
         .update(req.sessionID)
         .digest('base64')
         .replace(/=+$/, '');
       
       const signedId = `s:${req.sessionID}.${signature}`;
       
       // Build cookie string
       const cookieParts = [
         `connect.sid=${encodeURIComponent(signedId)}`,
         `Path=/`,
         `HttpOnly`,
         `Max-Age=86400`, // 24 hours
       ];
       
       // Add production-specific attributes
       if (process.env.NODE_ENV === "production") {
         cookieParts.push(`Secure`);
         cookieParts.push(`Domain=.shiva-raghav.com`);
       }
       
       cookieParts.push(`SameSite=Lax`);
       
       res.setHeader('Set-Cookie', cookieParts.join('; '));
       
       return res.status(200).json({
         msg: "Logged in successfully",
       });
     });
  } catch (error) {
    console.error("error inserting user", error);
    return res.status(400).json({
      msg: error,
    });
  }
});

userRouter.post("/logout", async (req, res) => {
  if (req.session) {
    console.log(req.session);

    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ msg: "Failed to logout" });
      }

      return res.status(200).json({ msg: "Logged out successfully" });
    });
  } else {
    return res.status(401).json({
      msg: "No active session to log out from",
    });
  }
});

export default userRouter;
