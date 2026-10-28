import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const keyLength = 64;
const cost = 2 ** 17;
const maxmem = 256 * 1024 * 1024;

const dummyHash =
  "scrypt$131072$8NpIin3+mwBwlcuTN38qJA==$N2fG8+xnQb+Kn7AsvsRnHMTZqu1yGmIzic9aL6tupY9X00mIdT9rfaqOASYnZknx4JlRqrHzAl5ibAtxA/U+0g==";

function deriveKey(password: string, salt: Buffer, N: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keyLength, { N, r: 8, p: 1, maxmem }, (error, key) => {
      if (error) {
        reject(error);
      } else {
        resolve(key);
      }
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt, cost);
  return `scrypt$${cost}$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string | null,
): Promise<boolean> {
  const [scheme, costText, saltText, keyText] = (storedHash ?? dummyHash).split("$");
  if (scheme !== "scrypt" || !costText || !saltText || !keyText) {
    return false;
  }
  const expected = Buffer.from(keyText, "base64");
  const actual = await deriveKey(password, Buffer.from(saltText, "base64"), Number(costText));
  return storedHash !== null && actual.length === expected.length && timingSafeEqual(actual, expected);
}
