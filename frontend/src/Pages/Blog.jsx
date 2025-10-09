import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import Loader from "../Components/Loader";
import apiHandler from "../services/apiHandler";

import { BiLike } from "react-icons/bi";
import { BiSolidLike } from "react-icons/bi";
import { AuthContext } from "../Context/AuthContextProvider";

const Blog = () => {
  const { getToken, isLoggedIn } = useContext(AuthContext);
  // const { getToken, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [blog, setBlog] = useState(null);
  const { id } = useParams();
  const [liked, setLiked] = useState(false);
  const token = getToken();

  const handleLike = async () => {
    try {
      const data = await apiHandler({
        url: `/vote/${blog.blog.id}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // logout,
      });
      console.log(data);

      setLiked(!liked);
      setBlog((prev) => ({
        ...prev,
        votes: liked ? prev.votes - 1 : prev.votes + 1,
      }));
    } catch (error) {
      console.log(error);
    }
  };

  const fetchBlog = async () => {
    const headers = { "Content-Type": "application/json" };
    if (isLoggedIn) headers.Authorization = `Bearer ${token}`;

    try {
      const data = await apiHandler({
        url: `/blog/${id}`,
        method: "GET",
        headers,
      });
      console.log(data);
      setBlog(data);
      setLoading(false);
      setLiked(data.isLiked);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="flex flex-col items-center w-[80%] m-auto mt-10 bg-white gap-6 p-8 md:p-12  rounded-lg">
      {blog ? (
        <>
          <img
            className="rounded-lg h-auto max-h-[60vh] w-full md:w-[70%] object-cover shadow-md"
            src={blog.blog.url}
            alt={blog.title}
          />

          <div
            className="flex justify-end items-center gap-5 w-[65%]"
            onClick={() => handleLike(blog.blog.id)}
          >
            {isLoggedIn && (liked ? <BiSolidLike /> : <BiLike />)}
            <p className="text-xl font-bold text-gray-800 text-center ">
              {blog.votes} likes
            </p>
          </div>

          <h1 className="text-4xl font-bold text-gray-800 text-center mt-4">
            {blog.blog.title}
          </h1>
          <div
            className="prose prose-lg prose-slate max-w-none text-gray-700
             prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto"
            dangerouslySetInnerHTML={{ __html: blog.blog.content }}
          />
        </>
      ) : (
        <p className="text-center text-red-500 text-xl">No API Data Found</p>
      )}
    </div>
  );
};

export default Blog;
