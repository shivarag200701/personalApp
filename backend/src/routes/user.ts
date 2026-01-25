import express from "express";
import { z } from "zod";
const userRouter = express();
import prisma from "../db/index.js";
import dotenv from "dotenv";
import { signUpSchema, signInSchema, changePasswordSchema, ChangeUsernameSchema} from "@shiva200701/todotypes";
import crypto from "crypto";
import { hashPassword, verifyPassword } from "../utils/passwordHasher.js";
import { requireLogin } from "../middleware.js";


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
        isPasswordSet: true,
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

    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ msg: "Failed to logout" });
      }

      return res.status(200).json({ msg: "Logged out successfully"});
    });
  } else {
    return res.status(401).json({
      msg: "No active session to log out from",
    });
  }
});

userRouter.put("/password", async (req,res) => {
    const userId = req.session.userId

    if(!userId){
      return res.status(401).json({
        msg:"Unauthorized"
      })
    }
    const {data,success,error} = changePasswordSchema.safeParse(req.body)
      if (!success) {
        return res.status(400).json({
          msg: "send valid data",
          error,
        });
      }
    const {currentPassword,newPassword,confirmNewPassword} = data

    if (confirmNewPassword != newPassword){
      return res.status(404).json({
        msg:"New passwords don't match"
      })
    }

    try{
      const user = await prisma.user.findUnique({
        where:{id:userId},
        select:{
          id: true,
          hashedPassword: true,
          isPasswordSet: true
        }
      })

      if(!user){
        return res.status(404).json({
          msg:"User not found"
        })
      }

      if(!user.isPasswordSet || !user.hashedPassword){
        return res.status(404).json({
          msg:"Password is not set"
        })
      }

      const isPasswordValid = await verifyPassword(currentPassword,user.hashedPassword)

      if(!isPasswordValid){
        return res.status(404).json({
          msg:"current password is not incorrect"
        })
      }

      const {hashedPassword:newHashedPassword} = await hashPassword(newPassword)

      const updatedUser = await prisma.user.update({
        where:{
          id:userId
        },
        data:{
          hashedPassword:newHashedPassword
        }
      })

      return res.status(200).json({
        msg:"Password updated sucessfully"
      })

    }catch(error){
      console.error("error updating password", error);
      return res.status(400).json({
      msg: error,
    });
    }

    })

userRouter.put("/username", async (req,res) =>{
  const userId = req.session.userId

    if(!userId){
      return res.status(401).json({
        msg:"Unauthorized"
      })
    }
    const {data,success,error} = ChangeUsernameSchema.safeParse(req.body)
      if (!success) {
        return res.status(400).json({
          msg: "send valid data",
          error,
        });
      }
      const {username:newUsername} = data
      try{

      const updatedUser = await prisma.user.update({
          where:{id:userId},
          data:{
            username: newUsername
          }
      })
      return res.status(200).json({
        msg:`Username updated sucessfully to ${updatedUser.username}`
      })
    }
    
    catch(error){
      console.error("error updating username", error);
      return res.status(400).json({
      msg: error,
    });
    }
})

    



userRouter.get("/profile", requireLogin, async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({
      msg: "Not authorized",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        isPasswordSet: true,
        oauthAccounts: {
          where: { provider: "google" },
          select: {
            pictureUrl: true,
            provider: true,
          },
          take: 1,
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        msg: "User not found",
      });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isPasswordSet: user.isPasswordSet,
        pictureUrl: user.oauthAccounts?.[0]?.pictureUrl || null,
        provider: user.oauthAccounts?.[0]?.provider || null,
        isOAuthLinked: user.oauthAccounts?.length > 0,

      },
    });
  } catch (error) {
    console.error("Error fetching user profile", error);
    return res.status(500).json({
      msg: "Failed to fetch user profile",
    });
  }
});

export default userRouter;
