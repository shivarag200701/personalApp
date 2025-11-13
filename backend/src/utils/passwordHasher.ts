import bcrypt from "bcrypt";
const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<{ hashedPassword: string }> {
    try{
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, salt);
        return { hashedPassword};
    }catch(error:any){
        console.error("Error hashing password", error);
        throw new Error("Failed to hash password");
    }
}

export async function verifyPassword(password: string, storedHashedPassword: string): Promise<boolean> {
    try{
        const isMatch = await bcrypt.compare(password, storedHashedPassword);
        return isMatch;

    }catch(error:any){
        console.error("Error verifying password", error);
        throw new Error("Failed to verify password");
    }
}