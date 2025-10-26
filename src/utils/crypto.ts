// src/utils/crypto.ts
import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY || "default_secret_key";

export const encryptData = (data: any): string => {
  const jsonData = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonData, SECRET_KEY).toString();
};

export const decryptData = (encryptedData: string): any => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error("Error decrypting data:", error);
    return null;
  }
};
