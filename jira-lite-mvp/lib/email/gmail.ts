import nodemailer from "nodemailer";

// Gmail SMTP transporter
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const FROM_EMAIL = process.env.GMAIL_USER || "noreply@jiralite.com";
