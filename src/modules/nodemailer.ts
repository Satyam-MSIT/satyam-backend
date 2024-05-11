import { createTransport } from "nodemailer";
import { sign } from "jsonwebtoken";
import { retryAsync } from "utility-kit";
import { expiresIn } from "../constants";

const types = ["default", "confirm", "login", "otp", "call"] as const;

type MessageType = (typeof types)[number];

type GenerateMessageOptions = {
  id?: string;
  name?: string;
  email: string | string[];
} & MessageExtension;

type GenerateMessageProps = { otp?: string };

type BaseMessage = {
  from: string;
  to: string | string[];
};

type MessageExtension = {
  subject?: string;
  html?: string;
};

type Message = BaseMessage & MessageExtension;

const { CORS, EMAIL_SECRET, GMAIL_USER, GMAIL_PASS } = process.env;

const transporter = createTransport({
  service: "Gmail",
  auth: { user: GMAIL_USER, pass: GMAIL_PASS },
  tls: { requestCert: true, rejectUnauthorized: true },
});

export function generateMessage({ id, name, email, subject, html }: GenerateMessageOptions, type: MessageType = "default", { otp }: GenerateMessageProps = {}): Message {
  const baseMessage: BaseMessage = { from: "Satyamwebsite@gmail.com", to: email };
  const messageExtensions: { [key in MessageType]: MessageExtension } = {
    default: {
      subject: subject!,
      html: `<div>
      <h4>Hi, ${name}</h4>
      ${html}
    </div>`,
    },
    confirm: {
      subject: "Confirm Your Satyam Account",
      html: `<div>
        <p>Hello <input disabled style="margin:0;padding:0;color:black;background-color:transparent;border:none;min-width: 20rem;cursor:text" value='${name}!'>
        <br>
        Thanks for choosing Satyam - The cloud file sharing website! Click below to confirm your Satyam account (Valid only for next ${expiresIn}):</p>
        <a href=${CORS}/auth/verify?token=${sign({ id }, EMAIL_SECRET, { expiresIn })}>Confirm Account</a>
        <br>
        <p>Not You? No worries, just ignore this mail!</p>
        <br>
        <p>E-mail sent to you by <a href=${CORS}>Satyam</a></p>
      <div>`,
    },
    login: {
      subject: "Login Successful",
      html: `<div>
        <p>Login Successful</p>
      <div>`,
    },
    otp: {
      subject: "OTP for your Satyam account",
      html: `<div>
        <p>Below is the OTP for your Satyam account associated with the email id ${email} (Valid only for next 5 minutes):</p>
        <h3>${otp}</h3>
        <br>
        <p><strong>WARNING:</strong> Don't share the OTP with anyone to maintain your account security.</p>
      <div>`,
    },
    call: {
      subject: "Call for Papers",
      html: `<div>
        <p>This is a call for paper</p>
      <div>`,
    },
  };
  return { ...baseMessage, ...messageExtensions[type] };
}

export async function sendMail(message: Message, onSuccess = () => {}) {
  await retryAsync(async () => await new Promise((resolve, reject) => transporter.sendMail(message, (error) => (error ? reject() : resolve(void 0)))), { onSuccess });
}
