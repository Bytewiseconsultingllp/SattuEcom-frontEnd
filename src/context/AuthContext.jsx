import { createContext, useState, useEffect } from "react";
import { setAuthCookies, clearAuthCookies, getUserDetails } from "../utils/cookieUtils";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getUserDetails());

  const loginUser = (data) => {
    setAuthCookies(data);
    setUser(data.userDetails);
  };

  const logoutUser = () => {
    clearAuthCookies();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
