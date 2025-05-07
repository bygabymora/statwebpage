import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useReducer, useState } from "react";
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
export default function AdminProductEditScreen() {
  const [sentOverNight, setSentOverNight] = useState(false);
  const [isInClearance, setisInClearance] = useState(false);
  const { query } = useRouter();
  const productId = query.pId;
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/admin/products/${productId}`);
        dispatch({ type: "FETCH_SUCCESS" });
        setValue("name", data.name);
        setValue("manufacturer", data.manufacturer);
        setValue("slug", data.slug);
        setValue("lot", data.lot);
        setValue("expiration", data.expiration);
        setValue("image", data.image);
        setValue("reference", data.reference);
        setValue("description", data.description);
        setValue("descriptionBox", data.descriptionBox);
        setValue("price", data.price);
        setValue("priceBox", data.priceBox);
        setValue("each", data.each);
        setValue("countInStock", data.countInStock);
        setValue("countInStockBox", data.countInStockBox);
        setValue("sentOverNight", data.sentOverNight);
        setValue("notes", data.notes);
        setValue("includes", data.includes);
        setSentOverNight(data.sentOverNight);
        setisInClearance(data.isInClearance);
        setValue("isInClearance", data.isInClearance);
        setValue("countInStockClearance", data.countInStockClearance);
        setValue("priceClearance", data.priceClearance);
        setValue("descriptionClearance", data.descriptionClearance);
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };

    fetchData();
  }, [productId, setValue]);

  const router = useRouter();

  const uploadHandler = async (e, imageField = "image") => {
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
    } catch (error) {
      dispatch({ type: "UPLOAD_FAIL", payload: getError(error) });
      toast.error(getError(error));
    }
  };

  const submitHandler = async ({
    name,
    manufacturer,
    slug,
    lot,
    expiration,
    image,
    reference,
    description,
    descriptionBox,
    price,
    priceBox,
    each,
    box,
    countInStock,
    countInStockBox,
    sentOverNight,
    isInClearance,
    countInStockClearance,
    priceClearance,
    descriptionClearance,
    notes,
    includes,
  }) => {
    try {
      manufacturer = manufacturer.toUpperCase();
      dispatch({ type: "UPDATE_REQUEST" });
      await axios.put(`/api/admin/products/${productId}`, {
        name,
        manufacturer,
        slug,
        lot,
        expiration,
        image,
        reference,
        description,
        descriptionBox,
        price,
        priceBox,
        each,
        box,
        countInStock,
        countInStockBox,
        sentOverNight,
        isInClearance,
        countInStockClearance,
        priceClearance,
        descriptionClearance,
        notes,
        includes,
      });
      dispatch({ type: "UPDATE_SUCCESS" });
      toast.success("Product updated successfully");
      router.push("/admin/products");
    } catch (err) {
      dispatch({ type: "UPDATE_FAIL", payload: getError(err) });
      toast.error(getError(err));
    }
  };

  return (
    <Layout title={`Edit Product ${productId}`}>
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
              <Link href='/admin/products' className='font-bold'>
                Products
              </Link>
            </li>
            <li>
              <Link href='/admin/users'>Users</Link>
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
              <h1 className='mb-4 text-xl'>{`Edit Product ${productId}`}</h1>
              <div className='mb-4'>
                <label htmlFor='name'>Name</label>
                <input
                  type='text'
                  className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
                  id='name'
                  autoFocus
                  {...register("name", {})}
                />
                {errors.name && (
                  <div className='text-red-500'>{errors.name.message}</div>
                )}
              </div>
              <div className='mb-4'>
                <label htmlFor='manufacturer'>Manufacturer</label>
                <input
                  type='text'
                  className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline uppercase'
                  id='slug'
                  {...register("manufacturer", {})}
                />
                {errors.manufacturer && (
                  <div className='text-red-500'>
                    {errors.manufaturer.message}
                  </div>
                )}
              </div>
              <div className='mb-4'>
                <label htmlFor='slug'>Reference</label>
                <input
                  type='text'
                  className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
                  id='slug'
                  {...register("slug", {
                    required: "Please enter slug",
                  })}
                />
                {errors.slug && (
                  <div className='text-red-500'>{errors.slug.message}</div>
                )}
              </div>
              <div className='mb-4'>
                <label htmlFor='image'>Image</label>
                <input
                  type='text'
                  className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
                  id='image'
                  {...register("image", {
                    required: "Please enter image",
                  })}
                />
                {errors.image && (
                  <div className='text-red-500'>{errors.image.message}</div>
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
                <label hidden htmlFor='reference'>
                  Reference
                </label>
                <input
                  hidden
                  value={productId}
                  type='text'
                  className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
                  id='reference'
                  {...register("reference", {})}
                />
                {errors.reference && (
                  <div className='text-red-500'>{errors.reference.message}</div>
                )}
              </div>
              <div>
                <h2>Each</h2>
                <div className='mb-4'>
                  <label htmlFor='description'>Description Each</label>
                  <input
                    type='text'
                    className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
                    id='description'
                    {...register("description", {})}
                  />
                  {errors.description && (
                    <div className='text-red-500'>
                      {errors.description.message}
                    </div>
                  )}
                </div>
                <div className='mb-4'>
                  <label htmlFor='price'>Price Each</label>
                  <input
                    type='text'
                    className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
                    id='price'
                    {...register("price", {})}
                  />
                  {errors.price && (
                    <div className='text-red-500'>{errors.price.message}</div>
                  )}
                </div>
                <div className='mb-4'>
                  <label htmlFor='countInStock'>Count In Stock Each</label>
                  <input
                    type='text'
                    className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
                    id='countInStock'
                    {...register("countInStock", {})}
                  />
                  {errors.countInStock && (
                    <div className='text-red-500'>
                      {errors.countInStock.message}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h2>Box</h2>
                <div className='mb-4'>
                  <label htmlFor='descriptionBox'>Description Box</label>
                  <input
                    type='text'
                    className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
                    id='descriptionBox'
                    {...register("descriptionBox", {})}
                  />
                  {errors.description && (
                    <div className='text-red-500'>
                      {errors.description.message}
                    </div>
                  )}
                </div>
                <div className='mb-4'>
                  <label htmlFor='priceBox'>Price Box</label>
                  <input
                    type='text'
                    className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
                    id='priceBox'
                    {...register("priceBox", {})}
                  />
                  {errors.price && (
                    <div className='text-red-500'>{errors.price.message}</div>
                  )}
                </div>
                <div className='mb-4'>
                  <label htmlFor='countInStockBox'>Count In Stock Box</label>
                  <input
                    type='text'
                    className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
                    id='countInStockBox'
                    {...register("countInStockBox", {})}
                  />
                  {errors.countInStock && (
                    <div className='text-red-500'>
                      {errors.countInStock.message}
                    </div>
                  )}
                </div>
              </div>

              <h2>Clearance</h2>
              <div className='mb-4'>
                <label htmlFor='isInClearance'>Is in Clearance</label>
                &nbsp;
                <input
                  type='checkbox'
                  id='isInClearance'
                  {...register("isInClearance")}
                  checked={isInClearance}
                  onChange={(e) => {
                    setValue("isInClearance", e.target.checked);
                    setisInClearance(e.target.checked);
                  }}
                />
              </div>
              <div className='mb-4'>
                <label htmlFor='descriptionBox'>Description Clearance</label>
                <input
                  type='text'
                  className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
                  id='descriptionClearance'
                  {...register("descriptionClearance", {})}
                />
                {errors.description && (
                  <div className='text-red-500'>
                    {errors.description.message}
                  </div>
                )}
              </div>

              <div className='mb-4'>
                <label htmlFor='priceClearance'>Price Clearance</label>
                <input
                  type='text'
                  className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
                  id='priceClearance'
                  {...register("priceClearance", {})}
                />
                {errors.priceClearance && (
                  <div className='text-red-500'>
                    {errors.priceClearance.message}
                  </div>
                )}
              </div>
              <div className='mb-4'>
                <label htmlFor='countInStockClearance'>
                  Count In Stock Clearance
                </label>
                <input
                  type='text'
                  className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
                  id='countInStockClearance'
                  {...register("countInStockClearance", {})}
                />
                {errors.countInStockClearance && (
                  <div className='text-red-500'>
                    {errors.countInStockClearance.message}
                  </div>
                )}
              </div>
              <div className='mb-4'>
                <label htmlFor='category'>Notes</label>
                <input
                  type='text'
                  className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
                  id='notes'
                  {...register("notes", {})}
                />
                {errors.notes && (
                  <div className='text-red-500'>{errors.notes.message}</div>
                )}
              </div>
              <div className='mb-4'>
                <label htmlFor='sentOverNight'>Sent Overnight</label>
                &nbsp;
                <input
                  type='checkbox'
                  id='sentOverNight'
                  {...register("sentOverNight")}
                  checked={sentOverNight}
                  onChange={(e) => {
                    setValue("sentOverNight", e.target.checked);
                    setSentOverNight(e.target.checked);
                  }}
                />
              </div>
              <div className='flex flex-row'>
                <div className='mb-4'>
                  <button
                    disabled={loadingUpdate}
                    className='primary-button mr-2'
                    type='submit'
                  >
                    {loadingUpdate ? "Loading" : "Update"}
                  </button>
                </div>
                <div className='mb-4'>
                  <button
                    type='button'
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

AdminProductEditScreen.auth = { adminOnly: true };
