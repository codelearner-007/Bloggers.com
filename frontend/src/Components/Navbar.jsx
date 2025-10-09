import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../Context/AuthContextProvider";
import { toast } from "react-toastify";

const Navbar = () => {
  const { isLoggedIn, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    toast.success("Bye Bye 👋", {
      style: {
        backgroundColor: "#006400", // cyan-400
        color: "#fff",
        fontWeight: "600",
      },
    });
  };

  return (
    <div className="flex justify-between items-center px-5 py-2 w-full h-auto bg-white shadow-md z-50 ">
      <div>
        <h1 className="font-bold text-2xl">BLOGGER</h1>
      </div>
      <div className="flex justify-center items-center gap-10">
        <div className="flex justify-between items-center gap-5 list-none">
          {isLoggedIn ? (
            <>
              <Link to="/">
                <li className="">Home</li>
              </Link>
              <Link to="/myblogs">
                <li className="">My Blogs</li>
              </Link>
              <Link to="/contact">
                <li className="">Contact</li>
              </Link>
              <Link onClick={handleLogout}>
                <li className="">LogOut</li>
              </Link>
              <Link to="/blogeditor">
                <li
                  className="flex justify-center items-center px-5 py-2 rounded-3xl 
                bg-cyan-950 text-white cursor-pointer
                transition-all duration-300 ease-in-out
                hover:scale-105 hover:bg-cyan-700 hover:shadow-lg list-none "
                >
                  Create Blog
                </li>
              </Link>
            </>
          ) : (
            <>
              <Link to="/">
                <li className="">Home</li>
              </Link>
              <Link to="/contact">
                <li className="">Contact</li>
              </Link>
              <Link to="/login">
                <li className="">Login</li>
              </Link>
              <Link to="/signup">
                <li
                  className="flex justify-center items-center px-5 py-2 rounded-3xl 
             bg-cyan-950 text-white cursor-pointer
             transition-all duration-300 ease-in-out
             hover:scale-105 hover:bg-cyan-700 hover:shadow-lg list-none "
                >
                  Register Here
                </li>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
