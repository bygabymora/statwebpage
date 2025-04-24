import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useReducer } from "react";
import { toast } from "react-toastify";
import Layout from "../../components/main/Layout";
import { getError } from "../../utils/error";
import { BsTrash3 } from "react-icons/bs";
import { BiSolidEdit } from "react-icons/bi";

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        newsEntries: action.payload,
        error: "",
      };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "CREATE_REQUEST":
      return { ...state, loadingCreate: true };
    case "CREATE_SUCCESS":
      return { ...state, loadingCreate: false };
    case "CREATE_FAIL":
      return { ...state, loadingCreate: false };
    case "DELETE_REQUEST":
      return { ...state, loadingDelete: true };
    case "DELETE_SUCCESS":
      return { ...state, loadingDelete: false, successDelete: true };
    case "DELETE_FAIL":
      return { ...state, loadingDelete: false };
    case "DELETE_RESET":
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      return state;
  }
}

export default function AdminNewsScreen() {
  const router = useRouter();

  const [
    {
      loading,
      error,
      newsEntries,
      loadingCreate,
      successDelete,
      loadingDelete,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    newsEntries: [],
    error: "",
  });

  const createHandler = async () => {
    if (!window.confirm("Are you sure?")) {
      return;
    }
    try {
      dispatch({ type: "CREATE_REQUEST" });
      const { data } = await axios.post(`/api/admin/news`);
      dispatch({ type: "CREATE_SUCCESS" });
      toast.success("News created successfully");
      router.push(`/admin/news/${data.news._id}`);
    } catch (err) {
      dispatch({ type: "CREATE_FAIL" });
      toast.error(getError(err));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/admin/news`);
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };

    if (successDelete) {
      dispatch({ type: "DELETE_RESET" });
    } else {
      fetchData();
    }
  }, [successDelete]);

  const deleteHandler = async (newsId) => {
    if (!window.confirm("Are you sure?")) {
      return;
    }
    try {
      dispatch({ type: "DELETE_REQUEST" });
      await axios.delete(`/api/admin/news/${newsId}`);
      dispatch({ type: "DELETE_SUCCESS" });
      toast.success("News deleted successfully");
    } catch (err) {
      dispatch({ type: "DELETE_FAIL" });
      toast.error(getError(err));
    }
  };

  const links = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/news", label: "News", isBold: true },
  ];

  return (
    <Layout title='Admin News'>
      <div className='flex justify-center'>
        <ul className='flex space-x-4 my-3 lg:text-lg w-full'>
          {links.map(({ href, label, isBold }) => (
            <li key={href} className='w-full'>
              <Link
                href={href}
                className={`flex items-center justify-center py-2 bg-white rounded-2xl shadow-md hover:bg-gray-100 transition 
                  ${isBold ? "font-semibold" : ""}`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className='md:col-span-3 p-4'>
        <div className='flex justify-between'>
          <h1 className='text-2xl font-bold mb-4'>News</h1>
          {loadingDelete && <div>Deleting item...</div>}
          <button
            disabled={loadingCreate}
            onClick={createHandler}
            className='primary-button'
          >
            {loadingCreate ? "Loading" : "Create"}
          </button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className='text-red-500'>{error}</div>
        ) : (
          <div className='overflow-x-auto'>
            <br />
            <table className='min-w-full bg-white shadow-md rounded-lg overflow-hidden'>
              <thead className='bg-gray-100 border border-collapse'>
                <tr>
                  <th className='p-2 text-left border-r border-gray-300'>
                    Title
                  </th>
                  {["Category", "Tags", "Author", "Actions"].map((header) => (
                    <th
                      key={header}
                      className='p-4 text-left uppercase border border-collapse'
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {newsEntries.map((news) => (
                  <tr key={news._id} className='border-b hover:bg-gray-100'>
                    <td className='p-2 border-r border-gray-300'>
                      {news.title}
                    </td>
                    <td className='border border-collapse p-2'>
                      {news.category}
                    </td>
                    <td className='border border-collapse p-2'>
                      {news.tags.join(", ")}
                    </td>
                    <td className='border border-collapse p-2'>
                      {news.author}
                    </td>
                    <td className='border border-collapse p-5 text-center flex flex-row'>
                      <Link
                        href={`/admin/news/${news._id}`}
                        className='primary-button font-bold underline'
                      >
                        <BiSolidEdit />
                      </Link>
                      &nbsp;
                      <button
                        onClick={() => deleteHandler(news._id)}
                        className='primary-button font-bold underline'
                        type='button'
                      >
                        <BsTrash3 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

AdminNewsScreen.auth = { adminOnly: true };
