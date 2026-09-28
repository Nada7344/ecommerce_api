import {
    EMAIL,
    APPLICATION_NAME,
    BREVO_API_KEY,
} from "../../../../config/config.service.js";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

const toRecipientArray = (value) => {
    if (!value) return undefined;
    const list = Array.isArray(value) ? value : String(value).split(",");
    return list.map((email) => ({ email: email.trim() }));
};

export const sendEmail = async ({
    to,
    cc,
    bcc,
    subject,
    html,
    attachments = [],
} = {}) => {

    try {

        const body = {
            sender: { name: APPLICATION_NAME, email: EMAIL },
            to: toRecipientArray(to),
            cc: toRecipientArray(cc),
            bcc: toRecipientArray(bcc),
            subject,
            htmlContent: html,
        };

        if (attachments.length) {
            body.attachment = attachments.map((a) => ({
                name: a.filename,
                content: Buffer.isBuffer(a.content)
                    ? a.content.toString("base64")
                    : a.content,
            }));
        }

        const response = await fetch(BREVO_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "api-key": BREVO_API_KEY,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Brevo API error (${response.status}): ${errorBody}`);
        }

        const data = await response.json();
        console.log("Email sent: %s", data.messageId);

    } catch (error) {

        console.error("Failed to send email:", error.message);
    }
};