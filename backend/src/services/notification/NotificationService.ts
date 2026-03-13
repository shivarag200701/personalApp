import { queueService } from "../../index.js";
import prisma from "../../db/index.js";
import { number } from "zod";


interface NotificationPayload{
    userId: number;
    type: string;
    title: string,
    message: string;
    todoId: number;
    scheduledFor?: string
}

class NotificationService {
    async createNotification(payload:NotificationPayload){

    const {userId,type,title,message,todoId,scheduledFor} = payload
    let delayMs:number;
    if(scheduledFor){
        const targetDate = new Date(scheduledFor)
        if (isNaN(targetDate.getTime())) {
            throw new Error('Invalid scheduledFor date format')
        }
        const currentTime = Date.now()
        delayMs = Math.max(0, targetDate.getTime() - currentTime)
    }
    


    try{
        //get user perferences
        const preferences = await prisma.userPrefrence.findUnique({
            where: {
                userId
            }
        })

        
        //get email id
        const user = await prisma.user.findUnique({
            where: {
                id:userId
            },
            select: {
                email: true
            }
        })

        if(!user || !user.email){
            throw new Error("user not found or email is not present")
        }

        if(!preferences){
            console.log(`No preferences found for user ${payload.userId}`);
            return
        }
        const getChannels = () => {
            let channels = []

            if(preferences?.emailEnabled) channels.push('email')
            if(preferences?.smsEnabled) channels.push('sms')
            if(preferences?.pushEnabled) channels.push('push')
            if(preferences?.inAppEnabled) channels.push('inApp')

            return channels
        }

        //get channels from user preference
        const channels = getChannels()

        //store in database for redundancy
        const notification = await prisma.notifications.create({
            data: {
                userId,
                type,
                title,
                message,
                todoId,
                channels,
                status:"SCHEDULED",
                schedulesFor:scheduledFor ?? null
            }
        })

        if(!notification){
            throw new Error("failed to create a notification record")
        }

        await Promise.all(channels.map((channel) => 
            queueService.addToQueue(channel,{
                notificationId:notification?.id,
                userId: userId,
                type:type,
                message:message,
                todoId:todoId,
                title:title,
                scheduledFor: scheduledFor,
                email: user?.email,
            },delayMs)
        ))


        }
        catch(error){
            console.error("failed to create notification",error);
            throw new Error('failed to create notification')
            
        }
    }
    
}

export default NotificationService