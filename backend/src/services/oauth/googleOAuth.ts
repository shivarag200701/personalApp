import { google } from "googleapis";
import {encrypt, decrypt} from "../../utils/encryption.ts";
import dotenv from "dotenv";
dotenv.config();

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID || "",
    process.env.GOOGLE_CLIENT_SECRET || "",
    process.env.GOOGLE_REDIRECT_URI || "",
)

// generate url for google oauth
export function generateGoogleOAuthUrl(state?: string): string {
    const scopes = [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
    ];
    return oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: scopes,
        prompt: "consent",
        state: state || "",
    });
}

// exchange code for tokens
export async function getGoogleTokens(code: string): Promise<{
    accessToken: string;
    refreshToken: string | null;
    expiresAt: Date | null;
    userInfo: {
        id: string;
        email: string;
        name: string;
    }
}> {
    const {tokens}  = await oauth2Client.getToken(code);

    if(!tokens.access_token){
        throw new Error("failed to get access token");
    }

    oauth2Client.setCredentials(tokens)

    const oauth2 = google.oauth2({version: "v2", auth: oauth2Client});
    const {data: userInfo} = await oauth2.userinfo.get();

    const expiresAt = tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600000); // 1 hour from now

    return {
        accessToken: encrypt(tokens.access_token),
        refreshToken: tokens.refresh_token ? encrypt(tokens.refresh_token) : null,
        expiresAt: expiresAt,
        userInfo: {
            id: userInfo.id || "",
            email: userInfo.email || "",
            name: userInfo.name || "",
        },
    }
}

export async function refreshGoogleTokens(refreshToken: string): Promise<{
    accessToken: string;
    expiresAt: Date;
}> {
    const decryptedRefreshToken = decrypt(refreshToken);
    if(!decryptedRefreshToken){
        throw new Error("invalid refresh token");
    }
    oauth2Client.setCredentials({refresh_token: decryptedRefreshToken});

    const {credentials} = await oauth2Client.refreshAccessToken();
    if(!credentials.access_token){
        throw new Error("failed to refresh access token");
    }

    const expiresAt = credentials.expiry_date ? new Date(credentials.expiry_date) : new Date(Date.now() + 3600000); // 1 hour from now

    return {
        accessToken: encrypt(credentials.access_token),
        expiresAt: expiresAt,
    }
}

export function getDecryptedAccessToken(encryptedAccessToken: string): string {
    return decrypt(encryptedAccessToken);
}