import Loader from "../Loader";
import { AuthContext } from "../../Context/AuthContextProvider";
import apiHandler from "../../services/apiHandler";
import { useContext, useEffect, useState } from "react";
import Blogcard from "../BlogCard";
import ReactPaginate from "react-paginate";
import MyBlogs from "../../Pages/MyBlogs";

const AllBlogs = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); // current page
  const itemsPerPage = 6; // how many blogs per page

  const fetchBlogs = async () => {
    try {
      let data = await apiHandler({
        url: "/blog",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        logout: logout,
      });
      // console.log(data.blogs);

      if (data.blogs) {
        setBlogs(data.blogs);
        setLoading(false);
        <MyBlogs />;
      } else {
        console.log(data.detail);
      }
    } catch (error) {
      console.error("API Not responded", error);
      // console.log("Plz logout");
    }
  };
  useEffect(() => {
    fetchBlogs();
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

  // calculate blogs to display for current page
  const offset = currentPage * itemsPerPage;
  const currentBlogs = filteredBlogs.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filteredBlogs.length / itemsPerPage);

  return (
    <div className="flex flex-col justify-center items-center  gap-5 w-[100%] m-auto ">
      <h1 className="flex justify-center w-[100%] bg-cyan-950 text-white border-y-1 py-3 text-4xl font-bold ">
        Blogs
      </h1>

      {loading ? (
        <Loader />
      ) : (
        <>
          {!loading && (
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
                    className="absolute inset-y-0 text-3xl font-semibold right-4  flex items-center justify-center
                   text-cyan-950 hover:text-red-500 transition"
                  >
                    x
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="flex justify-center m-auto w-[90%] gap-10 flex-wrap p-10">
            {currentBlogs.length !== 0 ? (
              currentBlogs.map((item, i) => (
                <Blogcard
                  key={i}
                  id={item.blog.id}
                  image={item.blog.url}
                  title={item.blog.title}
                  content={item.blog.content}
                  likes={item.likes} // ✅ pass votes if you want
                  editable={false}
                />
              ))
            ) : (
              <p>No Api Data Founded</p>
            )}
          </div>
          <div className="flex justify-center items-center p-5 mb-5">
            <ReactPaginate
              previousLabel={"← Prev"}
              nextLabel={"Next →"}
              breakLabel={"..."}
              pageCount={pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={3}
              onPageChange={handlePageClick}
              containerClassName={"flex items-center gap-2 "}
              pageClassName={
                "px-4 py-2 border rounded-md cursor-pointer text-white bg-cyan-950 hover:bg-cyan-600 hover:text-white transition"
              }
              pageLinkClassName={"page-link"}
              activeClassName={"bg-cyan -400 text-black font-bold"}
              previousClassName={
                "px-4 py-2 border rounded-md cursor-pointer text-white bg-cyan-950 hover:bg-cyan-600 hover:text-white transition"
              }
              nextClassName={
                "px-4 py-2 border rounded-md cursor-pointer text-white bg-cyan-950 hover:bg-cyan-600 hover:text-white transition"
              }
              breakClassName={
                "px-4 py-2 border rounded-md text-gray-500 text-white bg-cyan-950 cursor-default"
              }
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AllBlogs;
