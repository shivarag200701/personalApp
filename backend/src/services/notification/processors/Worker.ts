import { Worker, Job } from "bullmq";
import { sendEmail } from "./SendEmail.js";
import dotenv from "dotenv";

dotenv.config()

const connectionOptions = {
    url: process.env.REDIS_URL || "redis://localhost:6379",
    maxRetriesPerRequest: null,
  };
  



const emailWorker = new Worker('notification-email', async (job:Job)=>{
    await sendEmail(job.data)
},{connection: connectionOptions})

const smsWorker = new Worker('notification-sms', async (job:Job)=>{
    console.log(job);    
},{connection: connectionOptions})

const pushWorker = new Worker('notification-push', async (job:Job)=>{
    console.log(job);    
},{connection: connectionOptions})

const inAppWorker = new Worker('notification-inApp', async (job:Job)=>{
    console.log(job);    
},{connection: connectionOptions})

emailWorker.on('error', (err) => {
    console.log('Error in email worker',err);
    
})

smsWorker.on('error', (err) => {
    console.log('Error in sms worker',err);
    
})

pushWorker.on('error', (err) => {
    console.log('Error in push worker',err);
    
})

inAppWorker.on('error', (err) => {
    console.log('Error in inApp worker',err);
    
})
console.log("Email worker has started");
console.log("sms worker has started");
console.log("push worker has started");
console.log("inApp worker has started");



process.on("SIGTERM", async () => {
    await emailWorker.close()
    await smsWorker.close()
    await pushWorker.close()
    await inAppWorker.close()
    process.exit(0)
})