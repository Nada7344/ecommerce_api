import nodemailer from "nodemailer";
import {
    EMAIL,
    EMAIL_APP_PASSWORD,
    APPLICATION_NAME,
} from "../../../../config/config.service.js";


export const sendEmail = async ({
    to,
    cc,
    bcc,
    subject,
    html,
    attachments = [],
} = {}) => {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: EMAIL,
            pass: EMAIL_APP_PASSWORD,
        },
        family: 4,
    });

    try {

        const info = await transporter.sendMail({
            from: `${APPLICATION_NAME} <${EMAIL}>`,
            to,
            cc,
            bcc,
            html,
            subject,
            attachments,
        });

        console.log("Email sent: %s", info.messageId);

    } catch (error) {

        console.error("Failed to send email:", error.message);
    }
};