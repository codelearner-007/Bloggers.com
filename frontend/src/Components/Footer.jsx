import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-5 m-auto bg-cyan-950 border-t-2 text-white p-5">
      <div className="flex gap-10 font-semibold ">
        <Link to="/">
          <p className="hover:bg-amber-50 hover:text-cyan-950 px-2 py-1 rounded-full">
            Home
          </p>
        </Link>
        <Link to="/myblogs">
          <p className="hover:bg-amber-50 hover:text-cyan-950 px-2 py-1 rounded-full">
            My Blogs
          </p>
        </Link>
        <Link to="/contact">
          <p className="hover:bg-amber-50 hover:text-cyan-950 px-2 py-1 rounded-full">
            Contact
          </p>
        </Link>
        <Link to="/login">
          <p className="hover:bg-amber-50 hover:text-cyan-950 px-2 py-1 rounded-full">
            Login
          </p>
        </Link>
      </div>
      <div className="flex justify-center items-center text-center w-[80%]">
        <p>
          At BLOGGER, your privacy is as important as your morning coffee ☕. We
          never share your personal details with anyone — no shady third parties
          here! 🎭 We only use cookies 🍪 to make your reading experience
          smoother, like remembering your favorite pages. If cookies aren’t your
          thing, you can always turn them off in your browser settings anytime.
        </p>
      </div>
      <div>
        <p>Copyright © 2025. The BLOGGER. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Footer;
