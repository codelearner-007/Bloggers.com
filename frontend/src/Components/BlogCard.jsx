import React, { useContext } from "react";

import { MdEdit } from "react-icons/md";
import { RiDeleteBinFill } from "react-icons/ri";

import { Link } from "react-router-dom";
import { AuthContext } from "../Context/AuthContextProvider";
import apiHandler from "../services/apiHandler";
import { toast } from "react-toastify";

const Blogcard = (props) => {
  const { getToken } = useContext(AuthContext);

  // Delete The Blog
  const handleDelete = async (e, id) => {
    e.preventDefault();
    const token = getToken();

    try {
      let data = await apiHandler({
        url: `/blog/delete/${id}`,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log("deleted");
      // console.log(data);
      toast.success("Blog Deleted Successfully 🚀", {
        style: {
          backgroundColor: "#006400", // cyan-400
          color: "#fff",
          fontWeight: "600",
        },
        icon: "🚀",
      });

      if (data) {
        props.setBlogs((prevBlogs) =>
          prevBlogs.filter((b) => b.blog.id !== id)
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col justify-evenly gap-6 p-1  w-[300px]  ">
      <Link to={`/blog/${props.id}`}>
        <div className="relative group w-[300px] h-[230px] border-1 border-gray-300 rounded-2xl shadow-xl">
          <img
            className="w-full h-full object-cover rounded-2xl"
            src={props.image}
            alt="Main Image"
          />

          {props.editable && (
            <div className="absolute inset-0 bg-[rgba(0,0,0,0.5)] flex justify-between w-[100%] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300  items-end  p-2">
              <Link
                to={`/update/${props.id}/blogeditor`}
                state={{
                  blog: {
                    id: props.id,
                    title: props.title,
                    url: props.image,
                    content: props.content,
                  },
                }}
              >
                <button className=" gap-5 text-white text-xl bg-cyan-600 p-2 rounded-full hover:bg-cyan-700">
                  <MdEdit />
                </button>
              </Link>
              <button
                onClick={(e) => handleDelete(e, props.id)}
                className="flex gap-5 text-white text-xl bg-cyan-600 p-2 rounded-full hover:bg-cyan-700"
              >
                <RiDeleteBinFill />
              </button>
            </div>
          )}
        </div>
      </Link>
      <div className="flex flex-col gap-2 ml-2">
        <p className="text-lg font-bold w-100%">
          {props.title ? props.title.slice(0, 25) : "Untitled"} ...
        </p>
        <div
          className="text-base mb-2"
          dangerouslySetInnerHTML={{
            __html: props.content
              ? props.content.slice(0, 36) + "..."
              : "No content",
          }}
        ></div>
        <div className="flex items-center gap-2 ">
          <p className="text-large text-gray-600 font-bold">{props.likes}</p>
          <div>Likes</div>
        </div>
      </div>
    </div>
  );
};

export default Blogcard;
