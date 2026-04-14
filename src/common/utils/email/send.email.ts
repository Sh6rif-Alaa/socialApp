import nodemailer from "nodemailer";
import env from "../../../config/config.service";

export const sendEmail = async (mailOptions: nodemailer.SendMailOptions) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: env.EMAIL,
            pass: env.PASSWORD,
        },
    });

    const info = await transporter.sendMail({
        from: `"SarahaApp" ${env.EMAIL}`,
        ...mailOptions
    });

    console.log("Message sent:", info?.messageId);

    return info.accepted.length ? true : false
}

export const generateOTP = async (): Promise<string> => {
    return Math.floor(Math.random() * 900000 + 100000).toString()
}