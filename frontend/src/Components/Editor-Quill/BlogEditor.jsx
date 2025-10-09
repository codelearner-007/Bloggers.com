import { useLocation, useNavigate, useParams } from "react-router-dom";
//
import React, { useContext, useRef, useState, useMemo } from "react";
import "react-quill/dist/quill.snow.css";
import upload from "../../assets/upload.png";
import apiHandler from "../../services/apiHandler";
import { AuthContext } from "../../Context/AuthContextProvider";
import { toast } from "react-toastify";
import ReactQuill, { Quill } from "react-quill";

const Editor = () => {
  const quillref = useRef(null);

  const { getToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const { id } = useParams();
  const location = useLocation();
  const blog = location.state?.blog;

  // Blog States
  const [title, setTitle] = useState(blog?.title || "");
  const [mainContent, setMainContent] = useState(blog?.content || "");
  const [uploadingImageURL, setUploadingImageURL] = useState(blog?.url || ""); // Uploading the image on Cloudinary

  // loading for image
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState(""); // ✅ store selected file name

  // ---------------- IMAGE HANDLER FOR QUILL ----------------
  const imageHandler = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "Blogger.com"); // your Cloudinary preset
        formData.append("cloud_name", "dzkr6toyc");

        try {
          const res = await fetch(
            "https://api.cloudinary.com/v1_1/dzkr6toyc/image/upload",
            {
              method: "POST",
              body: formData,
            }
          );
          const data = await res.json();

          const editor = quillref.current.getEditor();
          const range = editor.getSelection();
          editor.insertEmbed(range.index, "image", data.secure_url);
        } catch (err) {
          console.error("Image upload failed", err);
          toast.error("Image upload failed");
        }
      }
    };
  };

  // ----------------------- Modues -----------------------
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ color: [] }, { background: [] }],
          [{ script: "sub" }, { script: "super" }],
          [{ indent: "-1" }, { indent: "+1" }],
          ["link"],
          [{ align: [] }],
          ["image"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    []
  );

  // ----------------------- Quill Formats -----------------------
  const quillFormats = useMemo(
    () => [
      "header",
      "bold",
      "italic",
      "underline",
      "strike",
      "list",
      "bullet",
      "color",
      "background",
      "link",
      "script",
      "align",
      "image",
    ],
    []
  );

  // ----------------------- File Uploading to Cloudinary -----------------------
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setLoading(true);

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "Blogger.com");
    data.append("cloud_name", "dzkr6toyc");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dzkr6toyc/image/upload",
      {
        method: "POST",
        body: data,
      }
    );
    console.log(res);

    const uploadImageURL = await res.json();
    if (uploadImageURL.secure_url) {
      setUploadingImageURL(uploadImageURL.secure_url);
    } else {
      console.error("Cloudinary did not return secure_url", uploadImageURL);
      toast.error("Image upload failed");
    }

    setLoading(false);
  };

  // ---------------------------------------------------------------------------------
  // ------------------------------ Updating the Blog  -------------------------------

  const handleUpdate = async () => {
    const token = getToken();
    try {
      const data = await apiHandler({
        url: `/blog/update/${id}`,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: { title: title, url: uploadingImageURL, content: mainContent },
      });

      toast.success(data.detail, {
        style: {
          backgroundColor: "#006400", // cyan-400
          color: "#fff",
          fontWeight: "600",
        },
        icon: "🚀",
      });
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  // -------------------------------------------------------------
  // ----------------------- Creating Blog -----------------------
  const handleSubmit = async () => {
    const token = getToken();
    try {
      let data = await apiHandler({
        url: "/blog",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: { title: title, url: uploadingImageURL, content: mainContent },
      });
      toast.success(data.detail, {
        style: {
          backgroundColor: "#006400", // cyan-400
          color: "#fff",
          fontWeight: "600",
        },
        icon: "🚀",
      });
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <center>
      <div style={{ width: "60%", marginTop: "20px", marginBottom: "60px" }}>
        {/* Title Input */}
        <input
          className="w-full p-2 border-2 mb-4 rounded  "
          type="text"
          placeholder="Enter Blog Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {/* Main Image Input */}
        <div className="w-full mb-4">
          {loading ? (
            <p className="text-blue-500 font-semibold">Uploading...</p>
          ) : (
            <label className="flex items-center gap-2 cursor-pointer border-2 p-2 rounded">
              <img src={upload} alt="upload" className="w-6 h-6" />
              <span>
                {fileName ? fileName : "Upload Blog Image"}
                {/* ✅ show file name */}
              </span>
              <input
                type="file"
                accept="image/*"
                // value={uploadingImageURL}
                onChange={handleFileUpload}
                className="hidden"
                required
              />
            </label>
          )}
        </div>

        {/* Quill Editor */}
        <ReactQuill
          ref={quillref}
          value={mainContent}
          onChange={setMainContent}
          modules={modules}
          formats={quillFormats}
          theme="snow"
          style={{ height: "400px" }}
        />

        {/* SubmitButton */}
      </div>
      {id ? (
        <button
          onClick={handleUpdate}
          disabled={!title.trim() || !mainContent.trim()}
          className=" px-4 py-2 rounded mb-5 text-white bg-cyan-950 hover:bg-cyan-600 "
        >
          Save The Blog
        </button>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={!title.trim() || !uploadingImageURL || !mainContent.trim()}
          // disabled={!title.trim() || !uploadingImageURL || !mainContent.trim()}
          className=" px-4 py-2 rounded mb-5 text-white bg-cyan-950 hover:bg-cyan-600 "
        >
          Create Blog
        </button>
      )}
    </center>
  );
};

export default Editor;
