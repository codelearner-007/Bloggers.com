import React, { useContext } from "react";
import { AuthContext } from "../Context/AuthContextProvider";
import { Outlet, Navigate } from "react-router-dom";

const ProtectedRoute = () => {
  const { isLoggedIn } = useContext(AuthContext);
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
