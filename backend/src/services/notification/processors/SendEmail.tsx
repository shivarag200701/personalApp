import { Resend } from "resend";
import dotenv from "dotenv";
import { render, pretty } from "@react-email/render";
import NotificationEmail from "../email-templates/NotificationEmail.js";


dotenv.config()

//instantitate the resend
const resend = new Resend(process.env.RESEND_API_KEY)


export async function sendEmail(){

    try{
        const html = await pretty(await render(<NotificationEmail />))
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