import { google } from "googleapis";
import {encrypt, decrypt} from "../../utils/encryption.js";

// Validate required environment variables before initializing OAuth2 client
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI?.trim().replace(/^["']|["']$/g, '');

if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.trim() === "") {
    throw new Error("GOOGLE_CLIENT_ID is required but not set in environment variables");
}
if (!GOOGLE_CLIENT_SECRET || GOOGLE_CLIENT_SECRET.trim() === "") {
    throw new Error("GOOGLE_CLIENT_SECRET is required but not set in environment variables");
}
if (!GOOGLE_REDIRECT_URI || GOOGLE_REDIRECT_URI.trim() === "") {
    throw new Error("GOOGLE_REDIRECT_URI is required but not set in environment variables");
}

const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
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
        pictureUrl: string;
    }
}> {
    try {
        const {tokens} = await oauth2Client.getToken(code);

        if (!tokens.access_token) {
            throw new Error("Failed to get access token from Google OAuth response");
        }

        oauth2Client.setCredentials(tokens);

        const oauth2 = google.oauth2({version: "v2", auth: oauth2Client});
        const {data: userInfo} = await oauth2.userinfo.get();

        // Validate required userInfo fields
        if (!userInfo.id || userInfo.id.trim() === "") {
            throw new Error("Google userinfo API did not return a valid user ID");
        }
        if (!userInfo.email || userInfo.email.trim() === "") {
            throw new Error("Google userinfo API did not return a valid email address");
        }

        const expiresAt = tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600000); // 1 hour from now
        return {
            accessToken: encrypt(tokens.access_token),
            refreshToken: tokens.refresh_token ? encrypt(tokens.refresh_token) : null,
            expiresAt: expiresAt,
            userInfo: {
                id: userInfo.id,
                email: userInfo.email,
                name: userInfo.name || "",
                pictureUrl: userInfo.picture || "",
            },
        };
    } catch (error) {
        // Log the underlying error for debugging
        console.error("Error in getGoogleTokens:", error);
        
        // Re-throw with descriptive message if it's not already an Error
        if (error instanceof Error) {
            throw error;
        }
        throw new Error(`Failed to exchange Google OAuth code for tokens: ${String(error)}`);
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