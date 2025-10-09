import { BrowserRouter, Route, Routes } from "react-router-dom";

import Navbar from "./Components/Navbar";

import Footer from "./Components/Footer";
import Home from "./Pages/Home";
import MyBlogs from "./Pages/MyBlogs";
import Signup from "./Pages/Signup";
import Login from "./Pages/Login";
import Contact from "./Pages/Contact";

import AuthContextProvider from "./Context/AuthContextProvider";
import { ToastContainer } from "react-toastify";
import Editor from "./Components/Editor-Quill/BlogEditor";
import Blog from "./Pages/Blog";
import ProtectedRoute from "./Components/ProtectedRoute";

BrowserRouter;
function App() {
  return (
    <div className="">
      <AuthContextProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/contact" element={<Contact />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/myblogs" element={<MyBlogs />} />
              <Route path="/blogeditor" element={<Editor />} />
            </Route>
            <Route path="/blog/:id" element={<Blog />} />
            <Route path="/update/:id/blogeditor" element={<Editor />} />
          </Routes>
          <Footer />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
            draggable
            theme="colored" // base theme
            toastStyle={{
              backgroundColor: "#0e7490", // cyan-700
              color: "#ffffff",
              borderRadius: "12px",
              fontWeight: "bold",
            }}
          />
        </BrowserRouter>
      </AuthContextProvider>
    </div>
  );
}

export default App;
