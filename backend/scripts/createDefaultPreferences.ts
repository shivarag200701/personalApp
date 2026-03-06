import prisma from "../src/db/index.js";

async function createDefaultPerfernces(){
    const users = await prisma?.user.findMany({
        where:{
        preference:null
        },
        select: {
            id: true,
            username: true
        }
    })

    try{
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
        console.error("error upading prefences for user",error);
        return
        
    }

    console.log("migration complete");
    
}

createDefaultPerfernces()