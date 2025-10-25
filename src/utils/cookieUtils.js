import Cookies from "js-cookie";

export const setAuthCookies = (data) => {
  Cookies.set("accessToken", data.accessToken, { expires: 1 }); // 1 day
  Cookies.set("refreshToken", data.refreshToken, { expires: 7 });
  Cookies.set("userDetails", JSON.stringify(data.userDetails), { expires: 7 });
};

export const getAccessToken = () => Cookies.get("accessToken");
export const getRefreshToken = () => Cookies.get("refreshToken");
export const getUserDetails = () => {
  const user = Cookies.get("userDetails");
  return user ? JSON.parse(user) : null;
};

export const clearAuthCookies = () => {
  Cookies.remove("accessToken");
  Cookies.remove("refreshToken");
  Cookies.remove("userDetails");
};
