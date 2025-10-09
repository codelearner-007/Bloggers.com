import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { ImAppleinc } from "react-icons/im";
import { AiOutlineUserDelete } from "react-icons/ai";
import { TbLockPassword, TbPokeball } from "react-icons/tb";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
// import handleloginFunction from "../services/loginService";
import { AuthContext } from "../Context/AuthContextProvider";
import { toast } from "react-toastify";
import apiHandler from "../services/apiHandler";
// import { jwtDecode } from "jwt-decode";

const Login = () => {
  const navigate = useNavigate();
  const { setToken, isLoggedIn } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleToggle = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      let data = await apiHandler({
        url: "/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { email, password },
      });
      console.log(data);

      let token = data.token;
      // console.log(token);

      if (token) {
        setToken(token);

        toast.success(`Welcome ${data.user.username}`, {
          style: {
            backgroundColor: "#006400", // cyan-400
            color: "#fff",
            fontWeight: "600",
          },
          icon: "🚀",
        });
        navigate("/");
      } else {
        toast.error(data.detail || "❌ Invalid credentials", {
          style: {
            backgroundColor: "#8B0000", // dark red
            color: "#fff",
            fontWeight: "600",
          },
          icon: "⚠️",
        });
      }
    } catch (error) {
      toast.error(error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  });

  return (
    <div className="flex flex-col p-[50px] h-screen w-[100%] bg-cyan-950 ">
      {/*-------------------------- Main Content -------------------------------  */}
      <div className="h-[90vh] flex items-center p-[30px]  ">
        {/*{/*------------------ Left Div ------------------ */}
        <div className="flex flex-col justify-center h-[75vh] w-[65%]  gap-8 bg-[rgba(255,255,255,0.25)] p-15 ">
          <h1 className="flex justify-center text-white text font-bold text-5xl">
            Welcome to website
          </h1>
          <p className="text-center text-white text font-normal text-[16px]">
            Log in to access your personalized dashboard, explore new features,
            and manage your account with ease. Stay connected and experience a
            smooth, secure, and fast platform designed just for you. Enter your
            credentials below to continue your journey. If you don’t have an
            account yet, it’s quick and easy to sign up. Your data is protected
            with us — because your privacy matters. Let’s get you started!
          </p>
        </div>
        {/*------------------ Right Div ------------------ */}
        <div className=" flex flex-col gap-10 justify-center items-center h-[75vh] w-[35%] bg-cyan-200 p-10">
          <form
            className="flex flex-col  justify-center items-center w-full gap-20"
            onSubmit={handleLogin}
          >
            <h1 className="text-2xl font-semibold text-white bg-cyan-950 rounded-xl flex justify-center  px-2 py-4 m- w-full">
              User Login
            </h1>
            <div className="flex flex-col gap-5 justify-center items-center w-[85%]">
              <div className="flex items-center gap-3 rounded-3xl px-6 py-2 w-[90%] bg-cyan-100 ">
                <AiOutlineUserDelete />
                <input
                  className="px-[10px] outline-none  "
                  type="text"
                  placeholder="Enter Username "
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-end gap-3 rounded-3xl px-6 py-2 w-[90%] bg-cyan-100">
                <TbLockPassword />

                <input
                  className="px-[10px] outline-none w-[90%]"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {password &&
                  (showPassword ? (
                    <IoMdEye
                      onClick={handleToggle}
                      className="w-6 h-6 text-cyan-900"
                    />
                  ) : (
                    <IoMdEyeOff
                      onClick={handleToggle}
                      className="w-6 h-6 text-cyan-900"
                    />
                  ))}
              </div>
              <div className="flex justify-between items-center w-[80%] px-2 ">
                <div className="flex items-center gap-2  ">
                  <input type="checkbox" />
                  <p>Remember me</p>
                </div>
                <div className="text-cyan-950 font-semibold hover:text-cyan-600 hover:underline ">
                  Forgot Password
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 justify-center items-center w-[90%]">
              <button className="bg-cyan-950 w-[50%] p-2 rounded-4xl text-1xl text-white  hover:text-white hover:bg-cyan-800 transition duration-100">
                LOGIN
              </button>
              <div className="flex items-center gap-1 ">
                Don't have an account?
                <Link to="/signup">
                  {" "}
                  <div className="hover:text-cyan-600 hover:underline text-sm font-bold ">
                    Register
                  </div>
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
      {/*-------------------------- Code Learner -------------------------------  */}
      <div className=" flex gap-2 justify-center items-center text-white">
        Designed by <ImAppleinc /> CodeLeaner
      </div>
    </div>
  );
};

export default Login;
