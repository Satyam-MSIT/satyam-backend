import { createTransport } from "nodemailer";
import { sign } from "jsonwebtoken";
import { retryAsync } from "utility-kit";
import { expiresIn } from "../constants";
import { UserType } from "../models/User";

type MessageType = "confirm" | "login" | "otp";

type Message = {
  from: string;
  to: string;
  subject?: string;
  html?: string;
};

const { CORS, EMAIL_SECRET, GMAIL_USER, GMAIL_PASS } = process.env;

const transporter = createTransport({
  service: "Gmail",
  auth: { user: GMAIL_USER, pass: GMAIL_PASS },
  tls: { requestCert: true, rejectUnauthorized: true },
});

export function generateMessage({ _id, name, email }: Partial<UserType>, type: MessageType = "confirm", otp?: string) {
  const message: Message = { from: "Satyamwebsite@gmail.com", to: email! };
  if (type === "confirm") {
    message.subject = "Confirm Your Satyam Account";
    message.html = `<div>
      <p>Hello <input disabled style="margin:0;padding:0;color:black;background-color:transparent;border:none;min-width: 20rem;cursor:text" value='${name}!'>
      <br>
      Thanks for choosing Satyam - The cloud file sharing website! Click below to confirm your Satyam account (Valid only for next ${expiresIn}):</p>
      <a href=${CORS}/auth/verify?token=${sign({ id: _id }, EMAIL_SECRET, { expiresIn })}>Confirm Account</a>
      <br>
      <p>Not You? No worries, just ignore this mail!</p>
      <br>
      <p>E-mail sent to you by <a href=${CORS}>Satyam</a></p>
    <div>`;
  } else if (type === "login") {
    message.subject = "Login Successful";
    message.html = `<div>
      <p>Login Successful</p>
    <div>`;
  } else if (type === "otp") {
    message.subject = "OTP for your Satyam account";
    message.html = `<div>
      <p>Below is the OTP for your Satyam account associated with the email id ${email} (Valid only for next 5 minutes):</p>
      <h3>${otp}</h3>
      <br>
      <p><strong>WARNING:</strong> Don't share the OTP with anyone to maintain your account security.</p>
    <div>`;
  }
  return message;
}

export async function sendMail(message: Message, onSuccess = () => {}) {
  await retryAsync(async () => await new Promise((resolve, reject) => transporter.sendMail(message, (error) => (error ? reject() : resolve(void 0)))), { onSuccess });
}
