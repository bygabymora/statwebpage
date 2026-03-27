import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useReducer, useState, useCallback } from "react";
import Layout from "../../../components/main/Layout";
import { getError } from "../../../utils/error";
import { useModalContext } from "../../../components/context/ModalContext";
import { BsTrash3 } from "react-icons/bs";

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "UPDATE_REQUEST":
      return { ...state, loadingUpdate: true, errorUpdate: "" };
    case "UPDATE_SUCCESS":
      return { ...state, loadingUpdate: false, errorUpdate: "" };
    case "UPDATE_FAIL":
      return { ...state, loadingUpdate: false, errorUpdate: action.payload };
    case "UPLOAD_REQUEST":
      return { ...state, loadingUpload: true, errorUpload: "" };
    case "UPLOAD_SUCCESS":
      return { ...state, loadingUpload: false, errorUpload: "" };
    case "UPLOAD_FAIL":
      return { ...state, loadingUpload: false, errorUpload: action.payload };
    default:
      return state;
  }
}

export default function AdminNewsEditScreen() {
  const { query } = useRouter();
  const newsId = query.id;
  const router = useRouter();
  const { showStatusMessage } = useModalContext();

  const [{ loading, error, loadingUpdate, loadingUpload }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: "",
      loadingUpdate: false,
      errorUpdate: "",
      loadingUpload: false,
      errorUpload: "",
    });

  const [newsData, setNewsData] = useState({
    title: "",
    slug: "",
    content: "",
    category: "",
    tags: "",
    imageUrl: "",
    embeddedImageUrl: "",
    videoUrl: "",
    hasVideo: false,
    videoType: "mp4",
    author: "",
  });
  const [links, setLinks] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});

  const fetchData = useCallback(async () => {
    if (!newsId) return;
    dispatch({ type: "FETCH_REQUEST" });
    try {
      const { data } = await axios.get(`/api/admin/news/${newsId}`);
      dispatch({ type: "FETCH_SUCCESS" });
      setNewsData({
        title: data.title || "",
        slug: data.slug || "",
        content: data.content || "",
        category: data.category || "",
        tags: (data.tags || []).join(", "),
        imageUrl: data.imageUrl || "",
        embeddedImageUrl: data.embeddedImageUrl || "",
        videoUrl: data.videoUrl || "",
        hasVideo: data.hasVideo || false,
        videoType: data.videoType || "mp4",
        author: data.author || "",
      });
      setLinks(data.sources || []);
    } catch (err) {
      dispatch({ type: "FETCH_FAIL", payload: getError(err) });
    }
  }, [newsId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function validate(fields) {
    const errs = {};
    if (!fields.title.trim()) errs.title = "Title is required";
    if (!fields.slug.trim()) errs.slug = "Reference is required";
    if (!fields.content.trim()) errs.content = "Content is required";
    if (!fields.category.trim()) errs.category = "Category is required";
    if (!fields.tags.trim()) errs.tags = "Tags are required";
    if (!fields.imageUrl.trim()) errs.imageUrl = "Image URL is required";
    if (!fields.author.trim()) errs.author = "Author is required";
    if (fields.hasVideo && !fields.videoUrl.trim()) {
      errs.videoUrl = "Video URL is required when video is enabled";
    }
    return errs;
  }

  const handleChange = (e) => {
    const { id, value } = e.target;
    setNewsData((prev) => ({ ...prev, [id]: value }));
  };

  const uploadHandler = async (e, field = "imageUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;
    dispatch({ type: "UPLOAD_REQUEST" });
    try {
      const {
        data: { signature, timestamp },
      } = await axios("/api/admin/cloudinary-sign");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp);
      formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
      const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;
      const { data } = await axios.post(uploadUrl, formData);
      dispatch({ type: "UPLOAD_SUCCESS" });
      setNewsData((prev) => ({ ...prev, [field]: data.secure_url }));
      showStatusMessage("success", "File uploaded successfully");
    } catch (err) {
      dispatch({ type: "UPLOAD_FAIL", payload: getError(err) });
      showStatusMessage("error", getError(err));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(newsData);
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;

    const sources = links.map((link) => ({
      title: link.title,
      url: link.url,
    }));

    dispatch({ type: "UPDATE_REQUEST" });
    try {
      await axios.put(`/api/admin/news/${newsId}`, {
        ...newsData,
        tags: newsData.tags.split(",").map((t) => t.trim()),
        sources,
        videoUrl: newsData.hasVideo ? newsData.videoUrl : null,
        hasVideo: newsData.hasVideo,
        videoType: newsData.hasVideo ? newsData.videoType : null,
      });
      dispatch({ type: "UPDATE_SUCCESS" });
      showStatusMessage("success", "News updated successfully");
      router.push("/admin/news");
    } catch (err) {
      dispatch({ type: "UPDATE_FAIL", payload: getError(err) });
      showStatusMessage("error", getError(err));
    }
  };

  const addLink = () => setLinks((prev) => [...prev, { title: "", url: "" }]);
  const removeLink = (i) =>
    setLinks((prev) => prev.filter((_, idx) => idx !== i));
  const updateLink = (i, field, value) =>
    setLinks((prev) =>
      prev.map((ln, idx) => (idx === i ? { ...ln, [field]: value } : ln)),
    );

  const navLinks = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/news", label: "News", isBold: true },
  ];

  return (
    <Layout title={`Edit Entry ${newsId?.slice(-8).toUpperCase()}`}>
      {/* Navigation */}
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-2 sm:px-4 lg:px-8'>
          <nav className='flex space-x-1 py-2 overflow-x-auto scrollbar-hide'>
            {navLinks.map(({ href, label, isBold }) => (
              <Link
                key={href}
                href={href}
                className={`flex-shrink-0 px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4 rounded-lg text-xs sm:text-sm lg:text-base font-medium transition-all duration-200 whitespace-nowrap ${
                  isBold ?
                    "bg-gradient-to-r from-[#0e355e] to-[#0e355e] text-white shadow-md"
                  : "text-gray-600 hover:text-[#0e355e] hover:bg-blue-50"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-3xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6'>
        {loading ?
          <div className='flex items-center justify-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#0e355e]'></div>
            <span className='ml-3 text-gray-600'>Loading news entry...</span>
          </div>
        : error ?
          <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
            <div className='text-red-600 font-medium'>
              Error loading news entry:
            </div>
            <div className='text-red-500 mt-1'>{error}</div>
          </div>
        : <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className='mb-6'>
              <h1 className='text-xl sm:text-2xl font-bold text-[#0e355e]'>
                Edit Entry
              </h1>
              <p className='text-sm text-gray-500 mt-1'>
                {newsData.title || "Untitled"} &middot; #{newsId?.slice(-6)}
              </p>
            </div>

            {/* Basic Info Section */}
            <div className='bg-white shadow-md rounded-xl border border-gray-200 p-4 sm:p-6 mb-6'>
              <h2 className='text-lg font-semibold text-[#0e355e] mb-4'>
                Basic Information
              </h2>

              {/* Title */}
              <div className='mb-4'>
                <label
                  htmlFor='title'
                  className='block text-sm font-semibold text-gray-700 mb-1'
                >
                  Title
                </label>
                <input
                  id='title'
                  value={newsData.title}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e355e]/30 focus:border-[#0e355e] outline-none transition-all'
                />
                {fieldErrors.title && (
                  <p className='text-red-500 text-sm mt-1'>
                    {fieldErrors.title}
                  </p>
                )}
              </div>

              {/* Reference */}
              <div className='mb-4'>
                <label
                  htmlFor='slug'
                  className='block text-sm font-semibold text-gray-700 mb-1'
                >
                  Reference
                </label>
                <input
                  id='slug'
                  value={newsData.slug}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e355e]/30 focus:border-[#0e355e] outline-none transition-all'
                />
                {fieldErrors.slug && (
                  <p className='text-red-500 text-sm mt-1'>
                    {fieldErrors.slug}
                  </p>
                )}
              </div>

              {/* Content */}
              <div className='mb-4'>
                <label
                  htmlFor='content'
                  className='block text-sm font-semibold text-gray-700 mb-1'
                >
                  Content
                </label>
                <textarea
                  id='content'
                  value={newsData.content}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e355e]/30 focus:border-[#0e355e] outline-none transition-all h-40 customer-scrollbar'
                />
                {fieldErrors.content && (
                  <p className='text-red-500 text-sm mt-1'>
                    {fieldErrors.content}
                  </p>
                )}
              </div>

              {/* Category & Author */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4'>
                <div>
                  <label
                    htmlFor='category'
                    className='block text-sm font-semibold text-gray-700 mb-1'
                  >
                    Category
                  </label>
                  <input
                    id='category'
                    value={newsData.category}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e355e]/30 focus:border-[#0e355e] outline-none transition-all'
                  />
                  {fieldErrors.category && (
                    <p className='text-red-500 text-sm mt-1'>
                      {fieldErrors.category}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor='author'
                    className='block text-sm font-semibold text-gray-700 mb-1'
                  >
                    Author
                  </label>
                  <input
                    id='author'
                    value={newsData.author}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e355e]/30 focus:border-[#0e355e] outline-none transition-all'
                  />
                  {fieldErrors.author && (
                    <p className='text-red-500 text-sm mt-1'>
                      {fieldErrors.author}
                    </p>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label
                  htmlFor='tags'
                  className='block text-sm font-semibold text-gray-700 mb-1'
                >
                  Tags (comma-separated)
                </label>
                <input
                  id='tags'
                  value={newsData.tags}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e355e]/30 focus:border-[#0e355e] outline-none transition-all'
                />
                {fieldErrors.tags && (
                  <p className='text-red-500 text-sm mt-1'>
                    {fieldErrors.tags}
                  </p>
                )}
              </div>
            </div>

            {/* Media Section */}
            <div className='bg-white shadow-md rounded-xl border border-gray-200 p-4 sm:p-6 mb-6'>
              <h2 className='text-lg font-semibold text-[#0e355e] mb-4'>
                Media
              </h2>

              {/* Main Image URL */}
              <div className='mb-4'>
                <label
                  htmlFor='imageUrl'
                  className='block text-sm font-semibold text-gray-700 mb-1'
                >
                  Image URL
                </label>
                <input
                  id='imageUrl'
                  value={newsData.imageUrl}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e355e]/30 focus:border-[#0e355e] outline-none transition-all'
                />
                {fieldErrors.imageUrl && (
                  <p className='text-red-500 text-sm mt-1'>
                    {fieldErrors.imageUrl}
                  </p>
                )}
              </div>

              {/* Upload Main Image */}
              <div className='mb-4'>
                <label
                  htmlFor='imageFile'
                  className='block text-sm font-semibold text-gray-700 mb-1'
                >
                  Upload Image
                </label>
                <input
                  id='imageFile'
                  type='file'
                  onChange={(e) => uploadHandler(e, "imageUrl")}
                  className='w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#0e355e] hover:file:bg-blue-100 transition-all'
                />
                {loadingUpload && (
                  <div className='flex items-center mt-2 text-sm text-gray-500'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-[#0e355e] mr-2'></div>
                    Uploading...
                  </div>
                )}
              </div>
            </div>

            {/* Video Section */}
            <div className='bg-white shadow-md rounded-xl border border-gray-200 p-4 sm:p-6 mb-6'>
              <h2 className='text-lg font-semibold text-[#0e355e] mb-4'>
                Video Settings
              </h2>

              {/* Has Video Toggle */}
              <div className='mb-4'>
                <label className='flex items-center cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={newsData.hasVideo}
                    onChange={(e) =>
                      setNewsData((prev) => ({
                        ...prev,
                        hasVideo: e.target.checked,
                      }))
                    }
                    className='w-4 h-4 text-[#0e355e] border-gray-300 rounded focus:ring-[#0e355e] mr-2'
                  />
                  <span className='text-sm font-medium text-gray-700'>
                    This news item has a video
                  </span>
                </label>
              </div>

              {newsData.hasVideo && (
                <>
                  {/* Video URL */}
                  <div className='mb-4'>
                    <label
                      htmlFor='videoUrl'
                      className='block text-sm font-semibold text-gray-700 mb-1'
                    >
                      Video URL
                    </label>
                    <input
                      id='videoUrl'
                      value={newsData.videoUrl}
                      onChange={handleChange}
                      placeholder='https://example.com/video.mp4'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e355e]/30 focus:border-[#0e355e] outline-none transition-all'
                    />
                    {fieldErrors.videoUrl && (
                      <p className='text-red-500 text-sm mt-1'>
                        {fieldErrors.videoUrl}
                      </p>
                    )}
                  </div>

                  {/* Upload Video */}
                  <div className='mb-4'>
                    <label
                      htmlFor='videoFile'
                      className='block text-sm font-semibold text-gray-700 mb-1'
                    >
                      Upload Video
                    </label>
                    <input
                      id='videoFile'
                      type='file'
                      accept='video/*'
                      onChange={(e) => uploadHandler(e, "videoUrl")}
                      className='w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#0e355e] hover:file:bg-blue-100 transition-all'
                    />
                    {loadingUpload && (
                      <div className='flex items-center mt-2 text-sm text-gray-500'>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-[#0e355e] mr-2'></div>
                        Uploading...
                      </div>
                    )}
                  </div>

                  {/* Video Type */}
                  <div>
                    <label
                      htmlFor='videoType'
                      className='block text-sm font-semibold text-gray-700 mb-1'
                    >
                      Video Type
                    </label>
                    <select
                      id='videoType'
                      value={newsData.videoType}
                      onChange={handleChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e355e]/30 focus:border-[#0e355e] outline-none transition-all'
                    >
                      <option value='mp4'>MP4</option>
                      <option value='webm'>WebM</option>
                      <option value='youtube'>YouTube</option>
                      <option value='vimeo'>Vimeo</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Sources Section */}
            <div className='bg-white shadow-md rounded-xl border border-gray-200 p-4 sm:p-6 mb-6'>
              <h2 className='text-lg font-semibold text-[#0e355e] mb-4'>
                Sources
              </h2>
              {links.map((link, idx) => (
                <div key={idx} className='flex items-center gap-2 mb-3'>
                  <input
                    placeholder='Title'
                    value={link.title}
                    onChange={(e) => updateLink(idx, "title", e.target.value)}
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e355e]/30 focus:border-[#0e355e] outline-none transition-all text-sm'
                  />
                  <input
                    placeholder='URL'
                    value={link.url}
                    onChange={(e) => updateLink(idx, "url", e.target.value)}
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e355e]/30 focus:border-[#0e355e] outline-none transition-all text-sm'
                  />
                  <button
                    type='button'
                    onClick={() => removeLink(idx)}
                    className='p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all'
                  >
                    <BsTrash3 size={14} />
                  </button>
                </div>
              ))}
              <button
                type='button'
                onClick={addLink}
                className='text-sm font-medium text-[#0e355e] hover:text-[#144e8b] hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all'
              >
                + Add source
              </button>
            </div>

            {/* Actions */}
            <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8'>
              <button
                type='submit'
                disabled={loadingUpdate}
                className='primary-button flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loadingUpdate ? "Saving..." : "Update"}
              </button>
              <button
                type='button'
                onClick={() => router.push("/admin/news")}
                className='secondary-button flex-1 sm:flex-none'
              >
                Back
              </button>
            </div>
          </form>
        }
      </div>
    </Layout>
  );
}

AdminNewsEditScreen.auth = { adminOnly: true };
