import { useContext, useEffect, useState } from "react";
import Blogcard from "../Components/BlogCard";
import { AuthContext } from "../Context/AuthContextProvider";
import Loader from "../Components/Loader";
import apiHandler from "../services/apiHandler";
import ReactPaginate from "react-paginate";

const MyBlogs = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { getToken, logout, isLoggedIn } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); // current page
  const itemsPerPage = 6; // how many blogs per page

  // .....................................................................
  // ......................... Fetch Blogs..............................

  const fetchBlogs = async () => {
    const token = getToken();

    try {
      let data = await apiHandler({
        url: "/blog/myblogs",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        logout,
      });
      // console.log(data.blogs);

      if (data.blogs) {
        setBlogs(data.blogs);
        setLoading(false);
      } else {
        // console.log(data.detail);
      }
    } catch (error) {
      console.error("API Not responded", error);
    }
  };
  useEffect(() => {
    if (isLoggedIn) {
      fetchBlogs();
    }
  }, []);

  // handle page change
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  // .....................................................................
  // ......................... Filtered Blogs..............................

  const filteredBlogs = blogs.filter(
    (item) =>
      item.blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.blog.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // .....................................................................
  // ............calculate blogs to display for current page .............

  const offset = currentPage * itemsPerPage;
  const currentBlogs = filteredBlogs.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filteredBlogs.length / itemsPerPage);

  return (
    <div className="flex flex-col justify-center items-center  gap-5 w-[100%] ">
      <h1 className="flex justify-center w-[100%] bg-cyan-950 text-white border-y-1 py-3 text-4xl font-bold ">
        My Blogs
      </h1>
      {!isLoggedIn ? (
        <p className="text-2xl mb-5 py-10">User Not Logged In</p>
      ) : (
        <>
          {loading ? (
            <Loader />
          ) : (
            <>
              {isLoggedIn && !loading && (
                <div className="w-[90%] flex justify-center items-center my-6">
                  <div className="relative w-[70%] max-w-2xl">
                    {/* Search Icon */}
                    <span className="absolute inset-y-0 left-4 flex justify-center items-center text-gray-400">
                      🔍
                    </span>

                    {/* Input */}
                    <input
                      type="text"
                      placeholder="Search blogs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-12 py-3 rounded-2xl 
                 bg-white/70 backdrop-blur-md 
                 border-0 shadow-lg
                 focus:outline-none focus:ring-2 focus:ring-gray-300
                 placeholder-gray-400
                 transition-all duration-300"
                    />

                    {/* Clear Button */}
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute inset-y-0 text-3xl font-semibold right-4 flex items-center justify-center
                   text-cyan-950 hover:text-red-500 transition"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              )}
              <div className="flex justify-center m-auto w-[100%] gap-10 flex-wrap p-10">
                {currentBlogs.length !== 0 ? (
                  currentBlogs.map((item, i) => (
                    <Blogcard
                      key={i}
                      id={item.blog.id}
                      image={item.blog.url}
                      title={item.blog.title}
                      content={item.blog.content}
                      editable={true}
                      likes={item.likes}
                      setBlogs={setBlogs}
                    />
                  ))
                ) : (
                  <p>No Api Data Founded</p>
                )}
              </div>
              <div className="flex pb-5 ">
                <ReactPaginate
                  previousLabel={"← Prev"}
                  nextLabel={"Next →"}
                  breakLabel={"..."}
                  pageCount={pageCount}
                  marginPagesDisplayed={2}
                  pageRangeDisplayed={3}
                  onPageChange={handlePageClick}
                  containerClassName={"flex items-center gap-2 mt-6"}
                  pageClassName={
                    "px-4 py-2 border rounded-md cursor-pointer text-white bg-cyan-950 hover:bg-cyan-600 transition"
                  }
                  pageLinkClassName={"page-link"}
                  activeClassName={"bg-amber-400 text-black font-bold"}
                  previousClassName={
                    "px-4 py-2 border rounded-md cursor-pointer text-white bg-cyan-950 hover:bg-cyan-600 transition"
                  }
                  nextClassName={
                    "px-4 py-2 border rounded-md cursor-pointer text-white bg-cyan-950 hover:bg-cyan-600 transition"
                  }
                  breakClassName={
                    "px-4 py-2 border rounded-md text-gray-500 cursor-default"
                  }
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default MyBlogs;
