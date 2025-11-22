import express from "express"
import {generateGoogleOAuthUrl, getGoogleTokens, refreshGoogleTokens} from "../services/oauth/googleOAuth.js";
import { setState, getState, deleteState, type StateData } from "../services/oauth/stateStore.js";
import prisma from "../db/index.js";
import crypto from "crypto";
import { requireLogin } from "../middleware.js";

const oauthRouter = express();

const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

function setSessionCookie(req: express.Request, res: express.Response, userId: number): Promise<void> {
    return new Promise((resolve, reject) => {
    req.session.userId = userId;

    req.session.save((err) => {
        if (err) {
            console.error("Session save error:", err);
            return res.status(500).json({ msg: "Session error" });
        }

        const secret = process.env.SESSION_SECRET || '';
        const signature = crypto
            .createHmac('sha256', secret)
            .update(req.sessionID)
            .digest('base64')
            .replace(/=+$/, '');
        const signedId = `s:${req.sessionID}.${signature}`;
        const cookieParts = [
            `connect.sid=${encodeURIComponent(signedId)}`,
            `Path=/`,
            `HttpOnly`,
            `Max-Age=86400`, // 24 hours
        ];
        if (process.env.NODE_ENV === "production") {
            cookieParts.push(`Secure`);
            cookieParts.push(`Domain=.shiva-raghav.com`);
        }
        cookieParts.push(`SameSite=Lax`);
        res.setHeader('Set-Cookie', cookieParts.join('; '));
        resolve();
    });
    });
}


oauthRouter.get("/google/connect", async (req,res) => {
    try{
        const state = crypto.randomBytes(32).toString('hex');
        const userId = req.session.userId;
        // for now, we are only supporting login
        // const type: 'login' | 'connect' = userId ? 'connect' : 'login';
        const type = "login";

        const stateData: StateData = {
            type,
            ...(userId !== undefined && { userId }),
            timestamp: Date.now(),
        };

        await setState(state, stateData);

        const authUrl = generateGoogleOAuthUrl(state);

        res.json({
            authUrl,
            state,
        })
    } catch (error) {
        console.error('Error initializing google oauth:', error);
        return res.status(500).json({msg: 'Failed to initialize google oauth'});
    }
})

oauthRouter.get("/google/callback", async (req,res) => {
    const {code, state, error} = req.query;
    console.log("code:", code);
    console.log("state:", state);
    console.log("error:", error);

    if(error){
        console.error('Google OAuth error:',error);
        return res.redirect(`${FRONTEND_URL}/signin?error=${error}`)
        
    }
    if (!code || typeof code !== 'string') {
        return res.redirect(`${FRONTEND_URL}/signin?error=missing_code`);
      }
    
      if (!state || typeof state !== 'string') {
        return res.redirect(`${FRONTEND_URL}/signin?error=invalid_state`);
      }

      try{
        const stateData = await getState(state);
        if(!stateData){
            return res.redirect(`${FRONTEND_URL}/signin?error=expired_state`);
        }

        await deleteState(state);

        //exchange code for tokens
        const {accessToken, refreshToken, expiresAt, userInfo} = await getGoogleTokens(code as string);
        console.log("type:", stateData.type);
        console.log("userInfo:", userInfo);
        

            if(stateData.type === 'login'){

            //user not logged in
            let user = await prisma.user.findUnique({
                where: {
                    email: userInfo.email,
                },
            });
            console.log('user:',user);
            if(user){
                console.log("here");
                
                await prisma.oAuthAccount.upsert({
                    where:{
                        userId_provider:{
                            userId: user.id,
                            provider: 'google',
                        },
                    },
                    update: {
                        accessToken,
                        refreshToken,
                        tokenExpiresAt: expiresAt,
                        providerAccountId: userInfo.id,
                        updatedAt: new Date(),
                        pictureUrl: userInfo.pictureUrl
                    },
                    create:{
                        userId: user.id,
                        provider: 'google',
                        providerAccountId: userInfo.id,
                        accessToken,
                        refreshToken,
                        tokenExpiresAt: expiresAt,
                        scope: 'email profile',
                        pictureUrl: userInfo.pictureUrl
                    },
                });
                await setSessionCookie(req, res, user.id);
                return res.redirect(`${FRONTEND_URL}/dashboard?success=google_sign_in`);
            }

            if(!user){
                // create new user from google info

                const baseUsername = userInfo.email.split('@')[0];
                let username = baseUsername;
                let suffix = 1;
                if(!username || username.trim() === ''){
                    username = `user_${suffix}`;
                    suffix++;
                }
                while (await prisma.user.findUnique({where: {username}})){
                    username = `user_${suffix}`;
                    suffix++;
                }

                user = await prisma.user.create({
                    data:{
                        email: userInfo.email,
                        username,
                        hashedPassword: null,
                    }
                })

                await prisma.oAuthAccount.upsert({
                    where:{
                        userId_provider:{
                            userId: user.id,
                            provider: 'google',
                        },
                    },
                        update: {
                            accessToken,
                            refreshToken,
                            tokenExpiresAt: expiresAt,
                            providerAccountId: userInfo.id,
                            updatedAt: new Date(),
                        },
                        create:{
                            userId: user.id,
                            provider: 'google',
                            providerAccountId: userInfo.id,
                            accessToken,
                            refreshToken,
                            tokenExpiresAt: expiresAt,
                            scope: 'email profile',
                            pictureUrl: userInfo.pictureUrl
                        },
                    });
                    await setSessionCookie(req, res, user.id);
                    return res.redirect(`${FRONTEND_URL}/dashboard?success=google_sign_in`);
                }
            }
            else if(stateData.type === 'connect' && stateData.userId){
                //calender
                 
                    const userId = stateData.userId;

                    // Verify session matches state (extra security check)
                    if (req.session.userId !== userId) {
                        return res.redirect(`${FRONTEND_URL}/settings?error=session_mismatch`);
                    }

                    // Create or update OAuth account for calendar integration
                    await prisma.oAuthAccount.upsert({
                        where: {
                        userId_provider: {
                            userId,
                            provider: 'google',
                        },
                        },
                        update: {
                        accessToken,
                        refreshToken,
                        tokenExpiresAt: expiresAt,
                        providerAccountId: userInfo.id,
                        updatedAt: new Date(),
                        },
                        create: {
                        userId,
                        provider: 'google',
                        providerAccountId: userInfo.id,
                        accessToken,
                        refreshToken,
                        tokenExpiresAt: expiresAt,
                        scope: 'email profile',
                        pictureUrl: userInfo.pictureUrl
                        },
                        });
                        return res.redirect(`${FRONTEND_URL}/settings?success=google_calendar_connected`);
            }
            else{
                return res.redirect(`${FRONTEND_URL}/signin?error=invalid_state`);
            }
            
        } catch (error) {
            console.error('Error processing google oauth callback:', error);
            return res.redirect(`${FRONTEND_URL}/signin?error=oauth_failed`);
        }
})

oauthRouter.get("/accounts",requireLogin,async (req,res) => {
    const userId = req.session.userId;
    if(!userId){
        return res.status(401).json({msg: 'Unauthorized'});
    }

    try{
        const accounts = await prisma.oAuthAccount.findMany({
            where: { userId },
            select: {
                id: true,
                provider: true,
                providerAccountId: true,
                tokenExpiresAt: true,
                createdAt: true,
                updatedAt: true,
            }
        })
        return res.status(200).json({msg: 'Accounts fetched successfully', accounts});
    }catch(error){
        console.error('Error fetching oauth accounts:', error);
        return res.status(500).json({msg: 'Failed to fetch oauth accounts'});
    }
})

oauthRouter.delete("/accounts/:id",requireLogin, async(req,res)=>{
    const userId = req.session.userId;
    if(!userId){
        return res.status(401).json({msg: 'Unauthorized'});
    }
    if(!req.params.id){
        return res.status(400).json({msg: 'Account id is required'});
    }

    const accountId = parseInt(req.params.id);
    if(isNaN(accountId)){
        return res.status(400).json({msg: 'Account id is required'});
    }
    
    try{
        const account = await prisma.oAuthAccount.findFirst({
            where: {
                id: accountId,
                userId,
            },
        })
        if(!account){
            return res.status(404).json({msg: 'Account not found'});
        }

        await prisma.oAuthAccount.delete({
            where: { id: accountId },
        });
        return res.status(200).json({msg: 'Account deleted successfully'});
    }catch(error){
        console.error('Error deleting oauth account:', error);
        return res.status(500).json({msg: 'Failed to delete oauth account'});
    }
    
})

oauthRouter.post("/google/refresh",requireLogin, async(req,res)=>{
    const userId = req.session.userId;
    if(!userId){
        return res.status(401).json({msg: 'Unauthorized'});
    }

    try{
        const account = await prisma.oAuthAccount.findUnique({
            where: {
                userId_provider: {
                    userId,
                    provider: 'google',
                },
            },
        })
        if(!account || !account.refreshToken){
            return res.status(404).json({msg: "No google account found or refresh token is missing"});
        }

        const {accessToken, expiresAt} = await refreshGoogleTokens(account.refreshToken);
        if(!accessToken){
            return res.status(500).json({msg: "Failed to refresh access token"});
        }

        await prisma.oAuthAccount.update({
            where: { id: account.id },
            data: { accessToken, 
                tokenExpiresAt: expiresAt,
                updatedAt: new Date(),
            },
        });

        return res.status(200).json({msg: "Access token refreshed successfully"});
    }catch(error){
        console.error('Error refreshing google access token:', error);
        return res.status(500).json({msg: "Failed to refresh access token"});
    }
})


export default oauthRouter;