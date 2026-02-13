import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useReducer, useState, useCallback } from "react";
import { toast } from "react-toastify";
import Layout from "../../../components/main/Layout";
import { getError } from "../../../utils/error";

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
      toast.success("File uploaded successfully");
    } catch (err) {
      dispatch({ type: "UPLOAD_FAIL", payload: getError(err) });
      toast.error(getError(err));
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
      toast.success("News updated successfully");
      router.push("/admin/news");
    } catch (err) {
      dispatch({ type: "UPDATE_FAIL", payload: getError(err) });
      toast.error(getError(err));
    }
  };

  const addLink = () => setLinks((prev) => [...prev, { title: "", url: "" }]);
  const updateLink = (i, field, value) =>
    setLinks((prev) =>
      prev.map((ln, idx) => (idx === i ? { ...ln, [field]: value } : ln)),
    );

  return (
    <Layout title={`Edit Entry ${newsId?.slice(-8).toUpperCase()}`}>
      <div className='grid md:grid-cols-3 md:gap-5'>
        <div className='md:col-span-3'>
          {loading ?
            <div>Loading...</div>
          : error ?
            <div className='alert-error'>{error}</div>
          : <form className='mx-auto max-w-screen-md' onSubmit={handleSubmit}>
              <h1 className='mb-4 text-xl'>Edit Entry - {newsData.title}</h1>

              {/* Title */}
              <div className='mb-4'>
                <label htmlFor='title'>Title</label>
                <input
                  id='title'
                  value={newsData.title}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border rounded'
                />
                {fieldErrors.title && (
                  <p className='text-red-500'>{fieldErrors.title}</p>
                )}
              </div>

              {/* Reference */}
              <div className='mb-4'>
                <label htmlFor='slug'>Reference</label>
                <input
                  id='slug'
                  value={newsData.slug}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border rounded'
                />
                {fieldErrors.slug && (
                  <p className='text-red-500'>{fieldErrors.slug}</p>
                )}
              </div>

              {/* Content */}
              <div className='mb-4'>
                <label htmlFor='content'>Content</label>
                <textarea
                  id='content'
                  value={newsData.content}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border rounded h-40'
                />
                {fieldErrors.content && (
                  <p className='text-red-500'>{fieldErrors.content}</p>
                )}
              </div>

              {/* Main Image URL */}
              <div className='mb-4'>
                <label htmlFor='imageUrl'>Image URL</label>
                <input
                  id='imageUrl'
                  value={newsData.imageUrl}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border rounded'
                />
                {fieldErrors.imageUrl && (
                  <p className='text-red-500'>{fieldErrors.imageUrl}</p>
                )}
              </div>

              {/* Upload Main Image */}
              <div className='mb-4'>
                <label htmlFor='imageFile'>Upload Image</label>
                <input
                  id='imageFile'
                  type='file'
                  onChange={(e) => uploadHandler(e, "imageUrl")}
                  className='w-full'
                />
                {loadingUpload && <p>Uploading…</p>}
              </div>

              {/* Embedded Image URL */}
              <div className='mb-4'>
                <label htmlFor='embeddedImageUrl'>Embedded Image URL</label>
                <input
                  id='embeddedImageUrl'
                  value={newsData.embeddedImageUrl}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border rounded'
                />
              </div>

              {/* Upload Embedded Image */}
              <div className='mb-4'>
                <label htmlFor='embeddedImageFile'>Upload Embedded Image</label>
                <input
                  id='embeddedImageFile'
                  type='file'
                  onChange={(e) => uploadHandler(e, "embeddedImageUrl")}
                  className='w-full'
                />
                {loadingUpload && <p>Uploading…</p>}
              </div>

              {/* Video Section */}
              <div className='mb-6 border-t pt-4'>
                <h3 className='text-lg font-semibold mb-4'>Video Settings</h3>

                {/* Has Video Toggle */}
                <div className='mb-4'>
                  <label className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={newsData.hasVideo}
                      onChange={(e) =>
                        setNewsData((prev) => ({
                          ...prev,
                          hasVideo: e.target.checked,
                        }))
                      }
                      className='mr-2'
                    />
                    This news item has a video
                  </label>
                </div>

                {newsData.hasVideo && (
                  <>
                    {/* Video URL */}
                    <div className='mb-4'>
                      <label htmlFor='videoUrl'>Video URL</label>
                      <input
                        id='videoUrl'
                        value={newsData.videoUrl}
                        onChange={handleChange}
                        placeholder='https://example.com/video.mp4'
                        className='w-full px-3 py-2 border rounded'
                      />
                      {fieldErrors.videoUrl && (
                        <p className='text-red-500'>{fieldErrors.videoUrl}</p>
                      )}
                    </div>

                    {/* Upload Video */}
                    <div className='mb-4'>
                      <label htmlFor='videoFile'>Upload Video</label>
                      <input
                        id='videoFile'
                        type='file'
                        accept='video/*'
                        onChange={(e) => uploadHandler(e, "videoUrl")}
                        className='w-full'
                      />
                      {loadingUpload && <p>Uploading…</p>}
                    </div>

                    {/* Video Type */}
                    <div className='mb-4'>
                      <label htmlFor='videoType'>Video Type</label>
                      <select
                        id='videoType'
                        value={newsData.videoType}
                        onChange={handleChange}
                        className='w-full px-3 py-2 border rounded'
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

              {/* Category */}
              <div className='mb-4'>
                <label htmlFor='category'>Category</label>
                <input
                  id='category'
                  value={newsData.category}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border rounded'
                />
                {fieldErrors.category && (
                  <p className='text-red-500'>{fieldErrors.category}</p>
                )}
              </div>

              {/* Tags */}
              <div className='mb-4'>
                <label htmlFor='tags'>Tags (comma-separated)</label>
                <input
                  id='tags'
                  value={newsData.tags}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border rounded'
                />
                {fieldErrors.tags && (
                  <p className='text-red-500'>{fieldErrors.tags}</p>
                )}
              </div>

              {/* Author */}
              <div className='mb-4'>
                <label htmlFor='author'>Author</label>
                <input
                  id='author'
                  value={newsData.author}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border rounded'
                />
                {fieldErrors.author && (
                  <p className='text-red-500'>{fieldErrors.author}</p>
                )}
              </div>

              {/* Sources */}
              <div className='mb-4'>
                <label>Sources</label>
                {links.map((link, idx) => (
                  <div key={idx} className='flex space-x-2 mb-2'>
                    <input
                      placeholder='Title'
                      value={link.title}
                      onChange={(e) => updateLink(idx, "title", e.target.value)}
                      className='flex-1 px-2 py-1 border rounded'
                    />
                    <input
                      placeholder='URL'
                      value={link.url}
                      onChange={(e) => updateLink(idx, "url", e.target.value)}
                      className='flex-1 px-2 py-1 border rounded'
                    />
                  </div>
                ))}
                <button
                  type='button'
                  onClick={addLink}
                  className='text-[#144e8b]'
                >
                  + Add source
                </button>
              </div>

              {/* Actions */}
              <div className='flex space-x-2 my-5'>
                <button
                  type='submit'
                  disabled={loadingUpdate}
                  className='px-4 py-2 bg-[#0e355e] text-white rounded'
                >
                  {loadingUpdate ? "Saving…" : "Update"}
                </button>
                <button
                  type='button'
                  onClick={() => router.push("/admin/news")}
                  className='px-4 py-2 bg-gray-300 rounded'
                >
                  Back
                </button>
              </div>
            </form>
          }
        </div>
      </div>
    </Layout>
  );
}

AdminNewsEditScreen.auth = { adminOnly: true };
