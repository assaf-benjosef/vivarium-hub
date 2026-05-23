import { SignJWT, jwtVerify } from "jose";
import { createHash } from "node:crypto";

const ALG = "HS256";
const EXPIRY = "30d";

function secretToKey(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

export async function createSetupToken(
  userId: number,
  jwtSecret: string
): Promise<string> {
  return new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(secretToKey(jwtSecret));
}

export async function validateSetupToken(
  token: string,
  jwtSecret: string
): Promise<{ userId: number }> {
  const { payload } = await jwtVerify(token, secretToKey(jwtSecret));

  if (!payload.sub) {
    throw new Error("Token missing subject");
  }

  return { userId: Number(payload.sub) };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
