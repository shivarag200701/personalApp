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
 }


export async function sendEmail({notificationId,userId,type,message,todoId,title,scheduledFor}:sendEmailProps){
    console.log("title is",title);
    console.log("message is",message);

    
    try{
        const html = await pretty(
          await render(
            <NotificationEmail
              message={message}
              title={title}
              badgeLabel="REMINDER"
              dueLabel="Due now"
              appBaseUrl={process.env.FRONTEND_URL ?? "#"}
              todoId={String(todoId)}
              scheduledFor={scheduledFor}
            />
          )
        );
        const {data} = await resend.emails.send({
            from: "Acme <onboarding@resend.dev>",
            to: "shivaraghav200701@gmail.com",
            subject: "hello world",
            html: html,
        })
        
        return data

    }
    catch(error){
        console.error("Failed to send email",error)
    }

    
}