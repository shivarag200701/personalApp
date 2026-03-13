import prisma from "../src/db/index.js";
import dotenv from "dotenv";

dotenv.config()

async function createDefaultPerfernces(){
try{
    const users = await prisma.user.findMany({
        where:{
        preference:null
        },
        select: {
            id: true,
            username: true
        }
    })

    for(const user of users){
        const prefernces = await prisma.userPrefrence.create({
            data:{
                userId:user.id,
                emailEnabled: true,
                smsEnabled: false,
                pushEnabled: false,
                inAppEnabled: false,
                taskRemainders: true,
                reminderBefore: 30,
                dailyDigest: false,
                digestTime: null,
                phoneNumber: null,
                pushToken: null,
            }
        })
        }
    }
    catch(error){
        console.error("error updating prefences for user",error);
        process.exit(1)
        
    }

    console.log("migration complete");
    await prisma.$disconnect()
    
}

createDefaultPerfernces()