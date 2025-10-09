import React, { createContext, useState, useEffect } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

const AuthContextProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const setToken = (token) => {
    localStorage.setItem("token", token);
    setIsLoggedIn(true);
    // }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    // console.log("Logged Out");
  };

  const getToken = () => {
    let token = localStorage.getItem("token");
    return token;
  };

  const contextValue = { isLoggedIn, setToken, logout, getToken };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthContextProvider;
