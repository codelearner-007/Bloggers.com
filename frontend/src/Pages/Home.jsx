import React from "react";
import Main from "../Components/Home/Main";
import UploadBlog from "../Components/Home/UploadBlod";
import AllBlogs from "../Components/Home/AllBlogs";

const Home = () => {
  return (
    <div className="flex flex-col gap-15">
      <Main />
      <UploadBlog />
      <AllBlogs />
    </div>
  );
};

export default Home;
