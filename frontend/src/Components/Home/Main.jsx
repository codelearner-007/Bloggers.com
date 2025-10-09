import React from "react";
import blogs_main from "../../assets/Main.jpg";

const Main = () => {
  return (
    <div className="relative  w-full h-[85vh]">
      {/* Background Image */}
      <img
        src={blogs_main}
        alt="Blogs Main"
        className="w-full h-full object-cover"
      />

      {/* Overlay Text Box */}
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                      bg-white/20 backdrop-blur-md shadow-xl rounded-3xl w-[90%] sm:w-[80%] md:w-[65%] lg:w-[80%] 
                      text-center p-8 flex flex-col justify-center items-center gap-6"
      >
        <h1 className="text-white text-4xl md:text-6xl font-bold drop-shadow-lg">
          Welcome to the BLOGGER website
        </h1>
        <p className="text-white text-lg md:text-xl max-w-2xl drop-shadow-md">
          Welcome to our blogging platform where you can share your stories,
          ideas, and experiences by easily adding your own blog posts.
        </p>
      </div>
    </div>
  );
};

export default Main;
