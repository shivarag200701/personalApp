import { Resend } from "resend";
import dotenv from "dotenv";
import { render, pretty } from "@react-email/render";
import NotificationEmail from "../email-templates/NotificationEmail.js";


dotenv.config()

//instantitate the resend
const resend = new Resend(process.env.RESEND_API_KEY)

 export interface sendEmailProps {
    notificationId: string
    userId: string
    type: string
    message: string
    todoId: string
    title:string
    scheduledFor: string
    email:string
 }


export async function sendEmail({notificationId,userId,type,message,todoId,title,scheduledFor,email}:sendEmailProps){

  if(!process.env.EMAIL){
    throw new Error('Missing required environment variable: EMAIL')
  }
  const from = process.env.NODE_ENV === "development" ? "Acme <onboarding@resend.dev>" : process.env.EMAIL
    try{
        const html = await pretty(
          await render(
            <NotificationEmail
              title={title}
              todoId={String(todoId)}
            />
          )
        );
        const {data} = await resend.emails.send({
            from:from,
            to: email,
            subject: "Reminder from FlowTask about Task",
            html: html,
        })
        
        return data

    }
    catch(error){
        console.error("Failed to send email",error)
    }

    
}