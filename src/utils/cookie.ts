// src/utils/cookies.ts
import Cookies from "js-cookie";
import { encryptData, decryptData } from "./crypto";

const COOKIE_KEY = "userDetails";

export const setUserCookie = (data: any) => {
  const encrypted = encryptData(data);
  Cookies.set(COOKIE_KEY, encrypted, {
    expires: 7,
    secure: true,
    sameSite: "Strict",
  });
};

export const getUserCookie = () => {
  const encrypted = Cookies.get(COOKIE_KEY);
  if (!encrypted) return null;
  return decryptData(encrypted);
};

export const updateTokens = (newToken: string, newRefreshToken: string) => {
  const userData = getUserCookie();
  if (!userData) return;
  userData.token = newToken;
  userData.refreshToken = newRefreshToken;
  setUserCookie(userData);
};

export const removeUserCookie = () => {
  Cookies.remove(COOKIE_KEY);
};
