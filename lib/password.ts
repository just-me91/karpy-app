import crypto from "crypto";

const SCRYPT_KEYLEN = 64;

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");

  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, SCRYPT_KEYLEN, (err, key) => {
      if (err) reject(err);
      else resolve(key as Buffer);
    });
  });

  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [salt, originalKey] = storedHash.split(":");

  if (!salt || !originalKey) return false;

  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, SCRYPT_KEYLEN, (err, key) => {
      if (err) reject(err);
      else resolve(key as Buffer);
    });
  });

  return crypto.timingSafeEqual(
    Buffer.from(originalKey, "hex"),
    derivedKey
  );
}