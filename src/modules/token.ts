import { IncomingHttpHeaders } from "http";
import jwt from "jsonwebtoken";
import jss from "jssign";

const { AUTH_SECRET, ENCODE_SECRET } = process.env;

const versionRegex = /\/[\d.]+/gi;
const separator = ")";

export function sanitizeUserAgent(userAgent: string) {
  const userAgentParts = userAgent.split(separator);
  const lastPart = userAgentParts.pop();
  if (lastPart) userAgentParts.push(lastPart.replace(versionRegex, "").trimEnd());
  return userAgentParts.join(separator);
}

export function generateToken(data: any) {
  const encoded = jss.sign(data, ENCODE_SECRET!);
  return jwt.sign(encoded, AUTH_SECRET!);
}

export function verifyToken(data: IncomingHttpHeaders & { token?: string; dimensions?: number }) {
  const encoded = jwt.verify(data.token!, AUTH_SECRET!);
  const { id, dimensions, origin, userAgent } = jss.verify(encoded as string, ENCODE_SECRET!);
  if (dimensions !== data.dimensions) return;
  if (origin !== data.origin) return;
  if (userAgent !== sanitizeUserAgent(data["user-agent"]!)) return;
  return { id } as { id: string };
}
