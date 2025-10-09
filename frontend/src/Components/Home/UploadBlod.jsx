import { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContextProvider";

const UploadBlog = () => {
  const { isLoggedIn, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      // console.log("User not logged in");
      logout();
      navigate("/");
    }
  }, []);
  return (
    <div className="flex flex-col justify-center items-center">
      {isLoggedIn ? (
        <div className="w-[100%]">
          <div className="flex flex-col justify-center items-center w-[80%] m-auto text-center gap-5">
            <h1 className="text-4xl font-bold">
              Publish your passions, your way
            </h1>
            <p className="text-2xl font-sans">
              Create a unique and beautiful blog easily.
            </p>
            <Link to="/blogeditor">
              <button className="flex justify-center items-center  bg-cyan-950 px-10 py-5 rounded-4xl text-white hover:bg-cyan-500 hover:text-black">
                CREATE YOUR BLOG
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col p-10 gap-5 w-[90%] justify-center items-center">
          <div className="flex justify-center  text-4xl font-bold ">
            Enter Your First Blog with Confidence
          </div>
          <p className="text-center">
            Starting your first blog can be both exciting and a bit
            overwhelming. It's your opportunity to share your thoughts,
            experiences, or expertise with the world. Whether you're writing to
            inform, inspire, or simply express yourself, the first step is
            always the most important. Dive in, be authentic, and let your voice
            shine through!
          </p>
          <Link to="/login">
            <button
              className=" font-bold text-2xl  px-15 py-3 rounded-full text-white
       bg-cyan-950 hover:text-black hover:bg-cyan-500 cursor-pointer"
            >
              {" "}
              login{" "}
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default UploadBlog;
