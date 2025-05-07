import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useReducer } from "react";
import { useForm } from "react-hook-form";
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
      return {
        ...state,
        loadingUpload: false,
        errorUpload: "",
      };
    case "UPLOAD_FAIL":
      return { ...state, loadingUpload: false, errorUpload: action.payload };

    default:
      return state;
  }
}

export default function AdminNewsEditScreen() {
  const { query } = useRouter();
  const newsId = query.id;
  const [{ loading, error, loadingUpdate, loadingUpload }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: "",
    });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const [links, setLinks] = React.useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/admin/news/${newsId}`);
        dispatch({ type: "FETCH_SUCCESS" });
        setValue("title", data.title);
        setValue("slug", data.slug);
        setValue("content", data.content);
        setValue("category", data.category);
        setValue("tags", data.tags);
        setValue("imageUrl", data.imageUrl);
        setValue("author", data.author);
        setLinks(data.sources || []);
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };

    fetchData();
  }, [newsId, setValue]);

  const router = useRouter();

  const uploadHandler = async (e, imageField = "imageUrl") => {
    const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;
    try {
      dispatch({ type: "UPLOAD_REQUEST" });
      const {
        data: { signature, timestamp },
      } = await axios("/api/admin/cloudinary-sign");

      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp);
      formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
      const { data } = await axios.post(url, formData);
      dispatch({ type: "UPLOAD_SUCCESS" });
      setValue(imageField, data.secure_url);
      toast.success("File uploaded successfully");
    } catch (err) {
      dispatch({ type: "UPLOAD_FAIL", payload: getError(err) });
      toast.error(getError(err));
    }
  };

  const embeddedUploadHandler = async (
    e,
    embeddedImageFile = "embeddedImageUrl"
  ) => {
    const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;
    try {
      dispatch({ type: "UPLOAD_REQUEST" });
      const {
        data: { signature, timestamp },
      } = await axios("/api/admin/cloudinary-sign");

      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp);
      formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
      const { data } = await axios.post(url, formData);
      dispatch({ type: "UPLOAD_SUCCESS" });
      setValue(embeddedImageFile, data.secure_url);
      toast.success("File uploaded successfully");
    } catch (err) {
      dispatch({ type: "UPLOAD_FAIL", payload: getError(err) });
      toast.error(getError(err));
    }
  };
  const submitHandler = async ({
    title,
    slug,
    content,
    category,
    tags,
    imageUrl,
    author,
  }) => {
    // Extract the links from the 'links' state
    const sources = links.map((link) => ({
      title: link.title,
      url: link.url,
    }));

    try {
      dispatch({ type: "UPDATE_REQUEST" });

      const response = await axios.put(`/api/admin/news/${newsId}`, {
        title,
        slug,
        content,
        category,
        tags,
        imageUrl,
        author,
        sources, // Include the 'sources' field in the request body
      });

      dispatch({ type: "UPDATE_SUCCESS" });
      toast.success("News updated successfully");
      router.push("/admin/news");
    } catch (err) {
      dispatch({ type: "UPDATE_FAIL", payload: getError(err) });
      toast.error(getError(err));
    }
  };

  const addLink = () => {
    setLinks([...links, { title: "", url: "" }]);
  };
  const updateLink = (index, field, value) => {
    const newLinks = [...links];
    newLinks[index] = {
      ...newLinks[index],
      [field]: value,
    };
    setLinks(newLinks);
  };

  return (
    <Layout
      title={`Edit Entry ${newsId.substring(newsId.length - 8).toUpperCase()}`}
    >
      <div className='grid md:grid-cols-4 md:gap-5'>
        <div>
          <ul>
            <li>
              <Link href='/admin/dashboard'>Dashboard</Link>
            </li>
            <li>
              <Link href='/admin/orders'>Orders</Link>
            </li>
            <li>
              <Link href='/admin/products'>Products</Link>
            </li>
            <li>
              <Link href='/admin/users'>Users</Link>
            </li>
            <li>
              <Link href='/admin/news' className='font-bold'>
                News
              </Link>
            </li>
          </ul>
        </div>
        <div className='md:col-span-3'>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className='alert-error'>{error}</div>
          ) : (
            <form
              className='mx-auto max-w-screen-md'
              onSubmit={handleSubmit(submitHandler)}
            >
              <h1 className='mb-4 text-xl'>{`Edit Entry ${newsId
                .substring(newsId.length - 8)
                .toUpperCase()}`}</h1>
              <div className='mb-4'>
                <label htmlFor='title'>Title</label>
                <input
                  type='text'
                  className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
                  id='name'
                  autoFocus
                  {...register("title", {
                    required: "Please enter Title",
                  })}
                />
                {errors.title && (
                  <div className='text-red-500'>{errors.title.message}</div>
                )}
              </div>
              <div className='mb-4'>
                <label htmlFor='slug'>Reference</label>
                <input
                  type='text'
                  className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
                  id='slug'
                  {...register("slug", {
                    required: "Please enter reference",
                  })}
                />
                {errors.slug && (
                  <div className='text-red-500'>{errors.slug.message}</div>
                )}
              </div>
              <div className='mb-4'>
                <label htmlFor='content'>Content</label>
                <textarea
                  type='text'
                  className='w-full contact__form-input contact__message'
                  id='content'
                  {...register("content", {
                    required: "Please enter content",
                  })}
                />
                {errors.content && (
                  <div className='text-red-500'>{errors.content.message}</div>
                )}
              </div>
              <div className='mb-4'>
                <label htmlFor='imageUrl'>Image</label>
                <input
                  type='text'
                  className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
                  id='imageUrl'
                  {...register("imageUrl", {
                    required: "Please enter image",
                  })}
                />
                {errors.imageUrl && (
                  <div className='text-red-500'>{errors.imageUrl.message}</div>
                )}
              </div>

              <div className='mb-4'>
                <label htmlFor='imageFile'>Upload image</label>
                <input
                  type='file'
                  className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
                  id='imageFile'
                  onChange={uploadHandler}
                />

                {loadingUpload && <div>Uploading....</div>}
              </div>
              <div className='mb-4'>
                <label
                  htmlFor='embeddedImageUrl'
                  className=' font-bold text-red-500'
                >
                  Embedded Image
                </label>
                <input
                  type='text'
                  className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
                  id='embeddedImageUrl'
                  {...register("embeddedImageUrl")}
                />
                {errors.embeddedImageUrl && (
                  <div className='text-red-500'>
                    {errors.embeddedImageUrl.message}
                  </div>
                )}
              </div>
              <div className='mb-4'>
                <label htmlFor='embeddedImageFile' className='text-red-300'>
                  <div className='font-bold text-red-400'>
                    Upload Embeded Image:
                  </div>{" "}
                  (please copy the link above and add it to the
                  <span className='font-bold text-red-400'>
                    &quot;Content&quot;
                  </span>{" "}
                  field inside <br />{" "}
                  <span className='font-bold text-red-400'>
                    Squared brackets [ ]{" "}
                  </span>
                  , after you update the article the URL will be lost in this
                  field){" "}
                </label>
                <input
                  type='file'
                  className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
                  id='embeddedImageFile'
                  onChange={embeddedUploadHandler}
                />

                {loadingUpload && <div>Uploading....</div>}
              </div>

              <div className='mb-4'>
                <label htmlFor='category'>Category</label>
                <input
                  type='text'
                  className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
                  id='category'
                  {...register("category", {
                    required: "Please enter Category",
                  })}
                />
                {errors.category && (
                  <div className='text-red-500'>{errors.category.message}</div>
                )}
              </div>
              <div className='mb-4'>
                <label htmlFor='tags'>Tags (separated by commas) </label>
                <input
                  type='text'
                  className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
                  id='tags'
                  {...register("tags", {
                    required: "Please enter tags separated by commas",
                  })}
                />
                {errors.tags && (
                  <div className='text-red-500'>{errors.tags.message}</div>
                )}
              </div>
              <div className='mb-4'>
                <label htmlFor='author'>Author</label>
                <input
                  type='text'
                  className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
                  id='author'
                  {...register("author", {
                    required: "Please enter author",
                  })}
                />
                {errors.author && (
                  <div className='text-red-500'>{errors.author.message}</div>
                )}
              </div>
              <div className='mb-4'>
                <label>Sources</label>
                {links.map((link, index) => (
                  <div key={index} className='flex flex-row space-x-4'>
                    <input
                      type='text'
                      placeholder='Title'
                      value={link.title}
                      onChange={(e) =>
                        updateLink(index, "title", e.target.value)
                      }
                    />
                    <input
                      type='text'
                      placeholder='URL'
                      value={link.url}
                      onChange={(e) => updateLink(index, "url", e.target.value)}
                      // Use 'url' as the field name
                    />
                  </div>
                ))}
                <button type='button' onClick={addLink}>
                  Add another link
                </button>
              </div>

              <div className='flex flex-row'>
                <div className='mb-4'>
                  <button
                    disabled={loadingUpdate}
                    className='primary-button mr-2'
                  >
                    {loadingUpdate ? "Loading" : "Update"}
                  </button>
                </div>
                <div className='mb-4'>
                  <button
                    onClick={() => router.push(`/`)}
                    className='primary-button'
                  >
                    Back
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}

AdminNewsEditScreen.auth = { adminOnly: true };
