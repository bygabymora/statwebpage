import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useReducer, useState, useCallback } from "react";
import Layout from "../../../components/main/Layout";
import { getError } from "../../../utils/error";
import { useModalContext } from "../../../components/context/ModalContext";
import {
  BiText,
  BiLink,
  BiPurchaseTag,
  BiCategoryAlt,
  BiUser,
  BiImage,
  BiVideo,
} from "react-icons/bi";
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

function RequiredMark() {
  return <span className='text-red-500'>*</span>;
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className='mt-1.5 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 text-red-600 text-sm'>
      {message}
    </p>
  );
}

function Card({ icon, title, children }) {
  return (
    <div className='bg-white shadow-md rounded-xl border border-gray-200 p-4 sm:p-6 mb-6'>
      <h2 className='flex items-center gap-2 text-lg sm:text-xl font-bold text-[#0e355e] mb-4'>
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
  const updateLink = (i, field, value) =>
    setLinks((prev) =>
      prev.map((ln, idx) => (idx === i ? { ...ln, [field]: value } : ln)),
    );
  const removeLink = (i) =>
    setLinks((prev) => prev.filter((_, idx) => idx !== i));

  const navLinks = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/news", label: "News", isBold: true },
  ];

  return (
    <Layout title={`Edit Entry ${newsId?.slice(-8).toUpperCase()}`}>
      {/* Nav tabs - matches /admin/news */}
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

      <div className='max-w-7xl mx-auto px-1 sm:px-2 md:px-4 lg:px-8 py-2 sm:py-4 md:py-6'>
        {loading ?
          <div className='flex items-center justify-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#0e355e]'></div>
            <span className='ml-3 text-gray-600'>Loading news article...</span>
          </div>
        : error ?
          <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
            <div className='text-red-600 font-medium'>
              Error loading news article:
            </div>
            <div className='text-red-500 mt-1'>{error}</div>
          </div>
        : <form className='mx-auto max-w-screen-md' onSubmit={handleSubmit}>
            {/* Header */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6'>
              <div>
                <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-[#0e355e]'>
                  Edit News Article
                </h1>
                <p className='text-sm sm:text-base text-gray-600 mt-1 truncate'>
                  Editing: {newsData.title || "Untitled"}
                </p>
              </div>
              <div className='flex gap-2'>
                <button
                  type='submit'
                  disabled={loadingUpdate}
                  className='px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r primary-button text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base'
                >
                  {loadingUpdate ? "Saving…" : "Update"}
                </button>
                <button
                  type='button'
                  onClick={() => router.push("/admin/news")}
                  className='px-4 py-2 sm:px-6 sm:py-3 bg-gray-200 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-300 transition-all duration-200 text-sm sm:text-base'
                >
                  Back
                </button>
              </div>
            </div>

            {/* Article Details */}
            <Card icon={<BiText size={22} />} title='Article Details'>
              <div className='grid sm:grid-cols-2 gap-4'>
                <div className='sm:col-span-2'>
                  <label htmlFor='title' className='block font-medium mb-1'>
                    Title <RequiredMark />
                  </label>
                  <input
                    id='title'
                    value={newsData.title}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <FieldError message={fieldErrors.title} />
                </div>

                <div>
                  <label
                    htmlFor='slug'
                    className='flex items-center gap-1 font-medium mb-1'
                  >
                    <BiLink size={16} /> Reference <RequiredMark />
                  </label>
                  <input
                    id='slug'
                    value={newsData.slug}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <FieldError message={fieldErrors.slug} />
                </div>

                <div>
                  <label
                    htmlFor='category'
                    className='flex items-center gap-1 font-medium mb-1'
                  >
                    <BiCategoryAlt size={16} /> Category <RequiredMark />
                  </label>
                  <input
                    id='category'
                    value={newsData.category}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <FieldError message={fieldErrors.category} />
                </div>

                <div>
                  <label
                    htmlFor='tags'
                    className='flex items-center gap-1 font-medium mb-1'
                  >
                    <BiPurchaseTag size={16} /> Tags (comma-separated){" "}
                    <RequiredMark />
                  </label>
                  <input
                    id='tags'
                    value={newsData.tags}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <FieldError message={fieldErrors.tags} />
                  {newsData.tags.trim() && (
                    <div className='flex flex-wrap gap-1.5 mt-2'>
                      {newsData.tags
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                        .map((tag, idx) => (
                          <span
                            key={idx}
                            className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700'
                          >
                            {tag}
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor='author'
                    className='flex items-center gap-1 font-medium mb-1'
                  >
                    <BiUser size={16} /> Author <RequiredMark />
                  </label>
                  <input
                    id='author'
                    value={newsData.author}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <FieldError message={fieldErrors.author} />
                </div>
              </div>
            </Card>

            {/* Content */}
            <Card icon={<BiText size={22} />} title='Content'>
              <label htmlFor='content' className='block font-medium mb-1'>
                Body <RequiredMark />
              </label>
              <textarea
                id='content'
                value={newsData.content}
                onChange={handleChange}
                className='w-full px-3 py-2 border rounded h-48 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
              <FieldError message={fieldErrors.content} />
            </Card>

            {/* Media */}
            <Card icon={<BiImage size={22} />} title='Media'>
              <div className='grid sm:grid-cols-2 gap-6'>
                <div>
                  <label htmlFor='imageUrl' className='block font-medium mb-1'>
                    Main Image URL <RequiredMark />
                  </label>
                  <input
                    id='imageUrl'
                    value={newsData.imageUrl}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <FieldError message={fieldErrors.imageUrl} />

                  <label
                    htmlFor='imageFile'
                    className='block font-medium mt-3 mb-1'
                  >
                    Upload Image
                  </label>
                  <input
                    id='imageFile'
                    type='file'
                    accept='image/*'
                    onChange={(e) => uploadHandler(e, "imageUrl")}
                    className='w-full text-sm'
                  />
                  {loadingUpload && (
                    <p className='text-sm text-gray-500 mt-1'>Uploading…</p>
                  )}

                  {newsData.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={newsData.imageUrl}
                      alt='Main image preview'
                      className='mt-3 w-full h-40 object-cover rounded-lg border border-gray-200'
                    />
                  )}
                </div>

                <div>
                  <label
                    htmlFor='embeddedImageUrl'
                    className='block font-medium mb-1'
                  >
                    Embedded Image URL
                  </label>
                  <input
                    id='embeddedImageUrl'
                    value={newsData.embeddedImageUrl}
                    onChange={handleChange}
                    className='w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />

                  <label
                    htmlFor='embeddedImageFile'
                    className='block font-medium mt-3 mb-1'
                  >
                    Upload Embedded Image
                  </label>
                  <input
                    id='embeddedImageFile'
                    type='file'
                    accept='image/*'
                    onChange={(e) => uploadHandler(e, "embeddedImageUrl")}
                    className='w-full text-sm'
                  />
                  {loadingUpload && (
                    <p className='text-sm text-gray-500 mt-1'>Uploading…</p>
                  )}

                  {newsData.embeddedImageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={newsData.embeddedImageUrl}
                      alt='Embedded image preview'
                      className='mt-3 w-full h-40 object-cover rounded-lg border border-gray-200'
                    />
                  )}
                </div>
              </div>
            </Card>

            {/* Video */}
            <Card icon={<BiVideo size={22} />} title='Video'>
              <label className='flex items-center gap-3 cursor-pointer w-fit'>
                <span className='relative inline-block w-10 h-6'>
                  <input
                    type='checkbox'
                    checked={newsData.hasVideo}
                    onChange={(e) =>
                      setNewsData((prev) => ({
                        ...prev,
                        hasVideo: e.target.checked,
                      }))
                    }
                    className='peer sr-only'
                  />
                  <span className='absolute inset-0 rounded-full bg-gray-300 peer-checked:bg-[#0e355e] transition-colors duration-200'></span>
                  <span className='absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-4'></span>
                </span>
                <span className='font-medium'>This news item has a video</span>
              </label>

              {newsData.hasVideo && (
                <div className='mt-4 space-y-4'>
                  <div>
                    <label
                      htmlFor='videoUrl'
                      className='block font-medium mb-1'
                    >
                      Video URL <RequiredMark />
                    </label>
                    <input
                      id='videoUrl'
                      value={newsData.videoUrl}
                      onChange={handleChange}
                      placeholder='https://example.com/video.mp4'
                      className='w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                    <FieldError message={fieldErrors.videoUrl} />
                  </div>

                  <div>
                    <label
                      htmlFor='videoFile'
                      className='block font-medium mb-1'
                    >
                      Upload Video
                    </label>
                    <input
                      id='videoFile'
                      type='file'
                      accept='video/*'
                      onChange={(e) => uploadHandler(e, "videoUrl")}
                      className='w-full text-sm'
                    />
                    {loadingUpload && (
                      <p className='text-sm text-gray-500 mt-1'>Uploading…</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor='videoType'
                      className='block font-medium mb-1'
                    >
                      Video Type
                    </label>
                    <select
                      id='videoType'
                      value={newsData.videoType}
                      onChange={handleChange}
                      className='w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    >
                      <option value='mp4'>MP4</option>
                      <option value='webm'>WebM</option>
                      <option value='youtube'>YouTube</option>
                      <option value='vimeo'>Vimeo</option>
                    </select>
                  </div>

                  {newsData.videoUrl &&
                    (newsData.videoType === "mp4" ||
                      newsData.videoType === "webm") && (
                      <video
                        key={newsData.videoUrl}
                        src={newsData.videoUrl}
                        controls
                        className='w-full max-h-64 rounded-lg border border-gray-200 bg-black'
                      />
                    )}
                </div>
              )}
            </Card>

            {/* Sources */}
            <Card icon={<BiLink size={22} />} title='Sources'>
              {links.map((link, idx) => (
                <div key={idx} className='flex gap-2 mb-2'>
                  <input
                    placeholder='Title'
                    value={link.title}
                    onChange={(e) => updateLink(idx, "title", e.target.value)}
                    className='flex-1 px-2 py-1.5 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <input
                    placeholder='URL'
                    value={link.url}
                    onChange={(e) => updateLink(idx, "url", e.target.value)}
                    className='flex-1 px-2 py-1.5 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <button
                    type='button'
                    onClick={() => removeLink(idx)}
                    title='Remove source'
                    className='px-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm flex items-center justify-center'
                  >
                    <BsTrash3 size={14} />
                  </button>
                </div>
              ))}
              <button
                type='button'
                onClick={addLink}
                className='text-[#144e8b] font-medium mt-1'
              >
                + Add source
              </button>
            </Card>

            {/* Actions */}
            <div className='flex gap-2 my-5'>
              <button
                type='submit'
                disabled={loadingUpdate}
                className='px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r primary-button text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base'
              >
                {loadingUpdate ? "Saving…" : "Update"}
              </button>
              <button
                type='button'
                onClick={() => router.push("/admin/news")}
                className='px-4 py-2 sm:px-6 sm:py-3 bg-gray-200 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-300 transition-all duration-200 text-sm sm:text-base'
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
