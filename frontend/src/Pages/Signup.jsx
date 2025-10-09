import { ImAppleinc } from "react-icons/im";
import { MdOutlineMailOutline } from "react-icons/md";

import { AiOutlineUserDelete } from "react-icons/ai";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { TbLockPassword } from "react-icons/tb";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
// import handleSignupFunction from "../services/signUpService";
import { toast } from "react-toastify";
import apiHandler from "../services/apiHandler";

const Signup = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const rules = [
    {
      validater: /[a-z]/.test(password),
      statement: "At latest one lowercase latter",
    },
    {
      validater: /[A-Z]/.test(password),
      statement: "At latest one uppercase latter",
    },
    {
      validater: /[0-9]/.test(password),
      statement: "At latest one number",
    },
    {
      validater: /[\W]/.test(password),
      statement: "At latest one symbol",
    },
    {
      validater: password.length >= 8,
      statement: "Minimum 8 characters",
    },
  ];

  const handleToggle = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent page reload
    try {
      let data = await apiHandler({
        url: "/users/signup",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { username, email, password },
      });
      console.log(data);
      if (data.detail == "User Created Successfully") {
        toast.success("🎉 Signup Successful!", {
          style: {
            backgroundColor: "#006400", // cyan-400
            color: "#fff",
            fontWeight: "600",
          },
          icon: "🚀",
        });
        setUsername("");
        setEmail("");
        setPassword("");
        navigate("/login");
      } else if (data.status_code == 409) {
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

  return (
    <div className="flex flex-col p-[50px] h-screen w-[100%] bg-cyan-950 ">
      <div className="h-[90vh] flex items-center p-[30px]  ">
        {/*------------------ Right Div ------------------ */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-15 p-10 justify-center items-center h-[75vh] w-[35%] bg-cyan-200"
        >
          <h1 className="text-2xl font-semibold text-white bg-cyan-950 rounded-xl flex justify-center  px-2 py-4 m- w-full">
            SignUp Here
          </h1>
          <div className="flex flex-col justify-center items-center gap-3 w-[85%]">
            <div className="flex items-center gap-3 rounded-3xl px-6 py-2 w-[90%] bg-cyan-100 ">
              <AiOutlineUserDelete />
              <input
                className="px-[10px] outline-none w-full"
                type="text"
                placeholder="Enter Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center gap-3 rounded-3xl px-6 py-2 w-[90%] bg-cyan-100 ">
              <MdOutlineMailOutline />
              <input
                className="px-[10px] outline-none w-full"
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center gap-3 rounded-3xl px-6 py-2 w-[90%] bg-cyan-100">
              <TbLockPassword />
              <input
                className="px-[10px] outline-none w-full"
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
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
            <div className="flex flex-col  rounded-3xl px-6 py-2 w-[90%]  text-[13px]">
              {rules.map((rule) => (
                <li
                  className={`${
                    rule.validater ? "text-green-500" : "text-cyan-600 "
                  }`}
                >
                  {rule.statement}
                </li>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 justify-center items-center w-[90%]">
            <button
              type="submit"
              className="bg-cyan-950 w-[50%] p-2 rounded-4xl text-1xl text-white  hover:text-white hover:bg-cyan-800 transition duration-100"
            >
              SignUp
            </button>
            <div className="flex items-center gap-1 ">
              If You have already account?
              <Link to="/login">
                <div className="text-cyan-950 hover:text-cyan-600 hover:underline text-sm font-bold ">
                  Login
                </div>
              </Link>
            </div>
          </div>
        </form>

        {/*------------------ Left Div ------------------ */}
        <div className="flex flex-col justify-center h-[75vh] w-[65%] gap-8 bg-[rgba(255,255,255,0.25)] p-15 ">
          <h1 className="flex justify-center text-white font-bold text-5xl">
            Welcome to website
          </h1>
          <p className="text-white font-normal text-[16px]">
            Create an account to unlock a world of features and enjoy a
            personalized experience. Signing up is quick and easy — just fill in
            your details below to get started. Stay connected with the latest
            updates, manage your preferences, and access exclusive content. Your
            information is safe with us, and we ensure a smooth and secure
            registration process. Ready to be part of our community? Let’s begin
            your journey today!
          </p>
        </div>
      </div>

      {/*-------------------------- Code Learner -------------------------------  */}
      <div className="flex gap-2 justify-center items-center text-white">
        Designed by <ImAppleinc /> CodeLeaner
      </div>
    </div>
  );
};

export default Signup;
