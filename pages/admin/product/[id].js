import axios from "axios";
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
    default:
      return state;
  }
}

export default function AdminProductEditScreen() {
  const { query, push } = useRouter();
  const productId = query.id;
  //New status to save the complete product
  const [product, setProduct] = useState(null);
  const [{ loading, error, loadingUpdate }, dispatch] = useReducer(reducer, {
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
    if (!productId) return;
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/admin/products/${productId}`);
        dispatch({ type: "FETCH_SUCCESS" });
        // We store all the product
        setProduct(data);
        // We only load the 'information' field
        setValue("information", data.information || "");
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    fetchData();
  }, [productId, setValue]);

  const submitHandler = async ({ information }) => {
    try {
      dispatch({ type: "UPDATE_REQUEST" });
      await axios.put(`/api/admin/products/${productId}`, { information });
      dispatch({ type: "UPDATE_SUCCESS" });
      toast.success("Product information updated successfully");
      push("/admin/products");
    } catch (err) {
      dispatch({ type: "UPDATE_FAIL", payload: getError(err) });
      toast.error(getError(err));
    }
  };

  return (
    <Layout title={product ? `Edit ${product.name}` : `Edit Product`}>
      <div className='grid md:grid-cols-4 md:gap-5'>
        <main className='md:col-span-3'>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className='alert-error'>{error}</div>
          ) : (
            <form
              className='mx-auto max-w-screen-md'
              onSubmit={handleSubmit(submitHandler)}
            >
              <h1 className='mb-4 text-xl'>
                {product
                  ? `Edit ${product.name} - ${product.manufacturer}`
                  : `Edit Product`}
              </h1>

              <input type='hidden' {...register("id")} value={productId} />

              <div className='mb-4'>
                <label htmlFor='information' className='font-semibold'>
                  Information
                </label>
                <textarea
                  id='information'
                  rows={4}
                  className='w-full px-3 py-2 border rounded'
                  {...register("information", {
                    required: "Please enter product information",
                  })}
                />
                {errors.information && (
                  <p className='text-red-500'>{errors.information.message}</p>
                )}
              </div>

              <div className='flex space-x-4 my-5'>
                <button
                  disabled={loadingUpdate}
                  className='primary-button'
                  type='submit'
                >
                  {loadingUpdate ? "Updating…" : "Update Information"}
                </button>
                <button
                  type='button'
                  onClick={() => push("/admin/products")}
                  className='secondary-button'
                >
                  Back
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </Layout>
  );
}

AdminProductEditScreen.auth = { adminOnly: true };
