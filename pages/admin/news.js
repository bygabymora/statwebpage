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
      {/* Enhanced Navigation */}
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-2 sm:px-4 lg:px-8'>
          <nav className='flex space-x-1 py-2 overflow-x-auto scrollbar-hide'>
            {links.map(({ href, label, isBold }) => (
              <Link
                key={href}
                href={href}
                className={`flex-shrink-0 px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4 rounded-lg text-xs sm:text-sm lg:text-base font-medium transition-all duration-200 whitespace-nowrap ${
                  isBold
                    ? "bg-gradient-to-r from-[#0e355e] to-[#0e355e] text-white shadow-md"
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
      <div className='max-w-7xl mx-auto px-1 sm:px-2 md:px-4 lg:px-8 py-2 sm:py-4 md:py-6'>
        {/* Header Section */}
        <div className='mb-3 sm:mb-6 md:mb-8'>
          <div className='flex flex-col gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-4 md:mb-6'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
              <div>
                <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-[#0e355e]'>
                  News Management
                </h1>
                <p className='text-sm sm:text-base text-gray-600 mt-1'>
                  Manage news articles and announcements
                </p>
              </div>
              <button
                disabled={loadingCreate}
                onClick={createHandler}
                className='px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r primary-button text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base'
              >
                {loadingCreate ? "Creating..." : "Create News"}
              </button>
            </div>
            <div className='flex flex-wrap gap-2 sm:gap-3'>
              <div className='text-xs sm:text-sm text-gray-500 bg-gray-50 px-2 py-1 sm:px-3 sm:py-2 rounded-lg'>
                Total:{" "}
                <span className='font-semibold text-gray-700'>
                  {newsEntries.length}
                </span>
              </div>
            </div>
          </div>
          {loadingDelete && (
            <div className='flex items-center justify-center py-6 mb-6'>
              <div className='flex items-center px-4 py-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg shadow-sm'>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3'></div>
                Deleting news article...
              </div>
            </div>
          )}
        </div>
        {loading ? (
          <div className='flex items-center justify-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#0e355e]'></div>
            <span className='ml-3 text-gray-600'>Loading news articles...</span>
          </div>
        ) : error ? (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
            <div className='flex items-center'>
              <div className='text-red-600 font-medium'>
                Error loading news:
              </div>
            </div>
            <div className='text-red-500 mt-1'>{error}</div>
          </div>
        ) : newsEntries.length === 0 ? (
          <div className='text-center py-12'>
            <div className='text-gray-500 mb-2'>No news articles found</div>
            <div className='text-sm text-gray-400'>
              Create your first news article to get started
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Card Layout */}
            <div className='grid gap-1 sm:gap-2 md:gap-3 md:hidden'>
              {newsEntries.map((news) => (
                <div
                  key={news._id}
                  className='bg-white shadow-sm sm:shadow-md rounded-md sm:rounded-lg md:rounded-xl p-1.5 sm:p-2 md:p-3 lg:p-5 border border-gray-100 hover:shadow-lg transition-all duration-200'
                >
                  {/* Mobile Card Header */}
                  <div className='flex items-start gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 mb-1.5 sm:mb-2 md:mb-3 lg:mb-4'>
                    <div className='min-w-0 flex-1'>
                      <h3 className='font-bold text-gray-900 text-xs sm:text-sm md:text-lg leading-tight mb-1 line-clamp-2'>
                        {news.title}
                      </h3>
                      <p className='text-gray-600 text-xs sm:text-sm font-medium mb-1 truncate'>
                        By {news.author}
                      </p>
                      <div className='flex flex-wrap items-center gap-1 sm:gap-2'>
                        <span className='inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                          {news.category}
                        </span>
                        <span className='text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded'>
                          #{news._id.slice(-6)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tags Section */}
                  {news.tags && news.tags.length > 0 && (
                    <div className='mb-1.5 sm:mb-2 md:mb-3 lg:mb-4'>
                      <div className='flex flex-wrap gap-1 sm:gap-1.5'>
                        {news.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className='inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700'
                          >
                            {tag}
                          </span>
                        ))}
                        {news.tags.length > 3 && (
                          <span className='text-xs text-gray-500'>
                            +{news.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className='flex space-x-1 sm:space-x-1.5 md:space-x-2'>
                    <Link
                      href={`/admin/news/${news._id}`}
                      className='flex-1 px-1.5 py-1 sm:px-2 sm:py-1.5 md:px-3 md:py-2 lg:px-4 lg:py-3 bg-gradient-to-r from-[#0e355e] to-[#0e355e] text-white font-medium rounded sm:rounded-md md:rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm sm:shadow-md hover:shadow-lg flex items-center justify-center space-x-0.5 sm:space-x-1 md:space-x-2 text-xs sm:text-sm md:text-base'
                    >
                      <BiSolidEdit
                        size={10}
                        className='sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4'
                      />
                      <span className='hidden xs:inline sm:inline'>Edit</span>
                    </Link>
                    <button
                      onClick={() => deleteHandler(news._id)}
                      className='px-1.5 py-1 sm:px-2 sm:py-1.5 md:px-3 md:py-2 lg:px-4 lg:py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded sm:rounded-md md:rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm sm:shadow-md hover:shadow-lg flex items-center justify-center text-xs sm:text-sm md:text-base'
                    >
                      <BsTrash3
                        size={8}
                        className='sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5'
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table Layout */}
            <div className='hidden md:block bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200'>
              <div className='overflow-x-auto overflow-y-auto max-h-[80vh] custom-scrollbar'>
                <table className='min-w-full' style={{ minWidth: "600px" }}>
                  <thead className='bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 sticky top-0 z-10'>
                    <tr>
                      <th className='px-2 py-2 sm:px-3 sm:py-3 lg:px-6 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[200px] sm:min-w-[250px]'>
                        Title
                      </th>
                      <th className='px-1 py-2 sm:px-2 sm:py-3 lg:px-4 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[100px] sm:min-w-[120px]'>
                        Category
                      </th>
                      <th className='px-1 py-2 sm:px-2 sm:py-3 lg:px-4 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[120px] sm:min-w-[150px]'>
                        Tags
                      </th>
                      <th className='px-1 py-2 sm:px-2 sm:py-3 lg:px-4 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[100px] sm:min-w-[120px]'>
                        Author
                      </th>
                      <th className='px-1 py-2 sm:px-2 sm:py-3 lg:px-4 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[90px] sm:min-w-[120px]'>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-200'>
                    {newsEntries.map((news, index) => (
                      <tr
                        key={news._id}
                        className={`hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-25"
                        }`}
                      >
                        <td className='px-2 py-2 sm:px-3 sm:py-3 lg:px-6 lg:py-4'>
                          <div className='flex items-center gap-1 sm:gap-2 lg:gap-4'>
                            <div className='min-w-0 flex-1'>
                              <div className='font-semibold text-gray-900 text-xs sm:text-xs lg:text-sm leading-tight mb-1 line-clamp-2'>
                                {news.title}
                              </div>
                              <div className='text-xs text-gray-400 font-mono mt-1 hidden md:block'>
                                #{news._id.slice(-6)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className='px-1 py-2 sm:px-2 sm:py-3 lg:px-4 lg:py-4'>
                          <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-gray-800'>
                            {news.category}
                          </span>
                        </td>
                        <td className='px-1 py-2 sm:px-2 sm:py-3 lg:px-4 lg:py-4'>
                          <div className='flex flex-wrap gap-1'>
                            {news.tags.slice(0, 2).map((tag, index) => (
                              <span
                                key={index}
                                className='inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700'
                              >
                                {tag}
                              </span>
                            ))}
                            {news.tags.length > 2 && (
                              <span className='text-xs text-gray-500'>
                                +{news.tags.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className='px-1 py-2 sm:px-2 sm:py-3 lg:px-4 lg:py-4'>
                          <div className='text-xs sm:text-xs lg:text-sm text-gray-900 truncate max-w-[80px] sm:max-w-[100px] lg:max-w-none'>
                            {news.author}
                          </div>
                        </td>
                        <td className='px-1 py-2 sm:px-2 sm:py-3 lg:px-4 lg:py-4'>
                          <div className='flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 lg:space-x-2'>
                            <Link
                              href={`/admin/news/${news._id}`}
                              className='px-1.5 py-1 sm:px-2 sm:py-1.5 lg:px-3 lg:py-2 primary-button text-white text-xs lg:text-sm font-medium rounded-lg transition-all duration-200 shadow-md flex items-center justify-center space-x-1'
                              title='Edit News Article'
                            >
                              <BiSolidEdit
                                size={12}
                                className='sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4'
                              />
                              <span className='hidden md:inline text-xs'>
                                Edit
                              </span>
                            </Link>
                            <button
                              onClick={() => deleteHandler(news._id)}
                              className='px-1.5 py-1 sm:px-2 sm:py-1.5 lg:px-3 lg:py-2 bg-gradient-to-r primary-button text-white text-xs lg:text-sm font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center'
                              title='Delete News Article'
                            >
                              <BsTrash3
                                size={10}
                                className='sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5'
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

AdminNewsScreen.auth = { adminOnly: true };
