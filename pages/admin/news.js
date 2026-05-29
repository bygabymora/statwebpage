import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useReducer, useState } from "react";
import { toast } from "react-toastify";
import Layout from "../../components/main/Layout";
import { getError } from "../../utils/error";
import { BsTrash3 } from "react-icons/bs";
import { BiSolidEdit } from "react-icons/bi";
import CustomConfirmModal from "../../components/main/CustomConfirmModal";

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

const getSafeTags = (entry) => (Array.isArray(entry?.tags) ? entry.tags : []);

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

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteNewsId, setDeleteNewsId] = useState(null);

  const createHandler = () => {
    setShowCreateModal(true);
  };

  const confirmCreateHandler = async () => {
    setShowCreateModal(false);
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

  const deleteHandler = (newsId) => {
    setDeleteNewsId(newsId);
    setShowDeleteModal(true);
  };

  const confirmDeleteHandler = async () => {
    setShowDeleteModal(false);
    try {
      dispatch({ type: "DELETE_REQUEST" });
      await axios.delete(`/api/admin/news/${deleteNewsId}`);
      dispatch({ type: "DELETE_SUCCESS" });
      toast.success("News deleted successfully");
    } catch (err) {
      dispatch({ type: "DELETE_FAIL" });
      toast.error(getError(err));
    }
    setDeleteNewsId(null);
  };

  const links = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/news", label: "News", isBold: true },
  ];

  const uniqueCategories = new Set(
    newsEntries.map((entry) => entry?.category).filter(Boolean),
  ).size;
  const totalTags = newsEntries.reduce(
    (acc, entry) => acc + getSafeTags(entry).length,
    0,
  );

  return (
    <Layout title='Admin News'>
      <div className='border-b border-slate-200 bg-white/95 backdrop-blur'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <nav className='flex gap-2 overflow-x-auto py-3'>
            {links.map(({ href, label, isBold }) => (
              <Link
                key={href}
                href={href}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 sm:px-4 sm:py-2 sm:text-sm ${
                  isBold ?
                    "bg-[#0e355e] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-[#0e355e]"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className='bg-gradient-to-b from-slate-50 via-white to-slate-100/70'>
        <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8'>
          <section className='mb-6 rounded-2xl border border-[#d7e3f2] bg-white p-5 shadow-sm sm:p-6'>
            <div className='mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <h1 className='text-2xl font-bold tracking-tight text-[#0e355e] sm:text-3xl'>
                  News Management
                </h1>
                <p className='mt-1 text-sm text-slate-600 sm:text-base'>
                  Create and manage announcements and news articles.
                </p>
              </div>
              <button
                disabled={loadingCreate}
                onClick={createHandler}
                className='inline-flex items-center justify-center rounded-lg bg-[#0e355e] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#144e8b] disabled:cursor-not-allowed disabled:bg-slate-400'
              >
                {loadingCreate ? "Creating..." : "Create News"}
              </button>
            </div>

            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
              <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Total Articles
                </p>
                <p className='mt-1 text-2xl font-bold text-[#0e355e]'>
                  {newsEntries.length}
                </p>
                <p className='text-xs text-slate-500'>
                  Published or draft items
                </p>
              </div>
              <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Categories
                </p>
                <p className='mt-1 text-2xl font-bold text-[#0e355e]'>
                  {uniqueCategories}
                </p>
                <p className='text-xs text-slate-500'>
                  Distinct category count
                </p>
              </div>
              <div className='rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2 lg:col-span-1'>
                <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Tags
                </p>
                <p className='mt-1 text-2xl font-bold text-[#0e355e]'>
                  {totalTags}
                </p>
                <p className='text-xs text-slate-500'>
                  Total tags across entries
                </p>
              </div>
            </div>
          </section>

          {loadingDelete && (
            <div className='mb-6 flex items-center justify-center'>
              <div className='inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-[#0e355e] shadow-sm'>
                <div className='mr-3 h-4 w-4 animate-spin rounded-full border-b-2 border-[#0e355e]'></div>
                Deleting news article...
              </div>
            </div>
          )}

          {loading ?
            <div className='flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-14 shadow-sm'>
              <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-[#0e355e]'></div>
              <span className='ml-3 text-slate-600'>
                Loading news articles...
              </span>
            </div>
          : error ?
            <div className='mb-6 rounded-xl border border-red-200 bg-red-50 p-4'>
              <div className='text-sm font-semibold text-red-700'>
                Error loading news
              </div>
              <div className='mt-1 text-sm text-red-600'>{error}</div>
            </div>
          : newsEntries.length === 0 ?
            <div className='rounded-2xl border border-slate-200 bg-white py-14 text-center shadow-sm'>
              <div className='mb-2 text-base font-semibold text-slate-600'>
                No news articles found
              </div>
              <div className='text-sm text-slate-500'>
                Create your first news article to get started
              </div>
            </div>
          : <>
              <div className='grid gap-4 md:hidden'>
                {newsEntries.map((news) => {
                  const tags = getSafeTags(news);
                  return (
                    <article
                      key={news._id}
                      className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md'
                    >
                      <div className='h-1 w-full bg-gradient-to-r from-[#0e355e] to-[#2c6aa9]'></div>
                      <div className='p-4'>
                        <h3 className='line-clamp-2 text-base font-bold leading-tight text-slate-900'>
                          {news.title}
                        </h3>
                        <p className='mt-1 text-sm font-medium text-slate-600'>
                          By {news.author || "Unknown"}
                        </p>

                        <div className='mt-3 flex flex-wrap items-center gap-2'>
                          <span className='rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700'>
                            {news.category || "Uncategorized"}
                          </span>
                          <span className='rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600'>
                            #{String(news._id).slice(-6)}
                          </span>
                        </div>

                        {tags.length > 0 && (
                          <div className='mt-3 flex flex-wrap gap-1.5'>
                            {tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={`${news._id}-tag-${index}`}
                                className='rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700'
                              >
                                {tag}
                              </span>
                            ))}
                            {tags.length > 3 && (
                              <span className='text-xs text-slate-500'>
                                +{tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        <div className='mt-4 flex gap-2'>
                          <Link
                            href={`/admin/news/${news._id}`}
                            className='inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#0e355e] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#144e8b]'
                          >
                            <BiSolidEdit className='h-4 w-4' />
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteHandler(news._id)}
                            className='inline-flex items-center justify-center rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700'
                          >
                            <BsTrash3 className='h-4 w-4' />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <section className='hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block'>
                <div className='overflow-x-auto'>
                  <div className='min-w-[940px]'>
                    <div className='grid grid-cols-12 items-center gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4'>
                      <div className='col-span-4 text-xs font-semibold uppercase tracking-wider text-slate-600'>
                        Title
                      </div>
                      <div className='col-span-2 text-xs font-semibold uppercase tracking-wider text-slate-600'>
                        Category
                      </div>
                      <div className='col-span-2 text-xs font-semibold uppercase tracking-wider text-slate-600'>
                        Tags
                      </div>
                      <div className='col-span-2 text-xs font-semibold uppercase tracking-wider text-slate-600'>
                        Author
                      </div>
                      <div className='col-span-2 text-xs font-semibold uppercase tracking-wider text-slate-600'>
                        Actions
                      </div>
                    </div>

                    <div className='divide-y divide-slate-200'>
                      {newsEntries.map((news, index) => {
                        const tags = getSafeTags(news);
                        return (
                          <div
                            key={news._id}
                            className={`grid grid-cols-12 items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50 ${
                              index % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                            }`}
                          >
                            <div className='col-span-4'>
                              <p className='line-clamp-2 text-sm font-semibold leading-tight text-slate-900'>
                                {news.title}
                              </p>
                              <p className='mt-1 text-xs text-slate-500'>
                                #{String(news._id).slice(-6)}
                              </p>
                            </div>

                            <div className='col-span-2'>
                              <span className='inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700'>
                                {news.category || "Uncategorized"}
                              </span>
                            </div>

                            <div className='col-span-2'>
                              <div className='flex flex-wrap gap-1'>
                                {tags.slice(0, 2).map((tag, idx) => (
                                  <span
                                    key={`${news._id}-desk-tag-${idx}`}
                                    className='rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700'
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {tags.length > 2 && (
                                  <span className='text-xs text-slate-500'>
                                    +{tags.length - 2}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className='col-span-2 truncate text-sm text-slate-800'>
                              {news.author || "Unknown"}
                            </div>

                            <div className='col-span-2'>
                              <div className='flex gap-2'>
                                <Link
                                  href={`/admin/news/${news._id}`}
                                  className='inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-[#0e355e] px-3 py-2 text-xs font-semibold text-[#0e355e] transition-colors hover:bg-[#0e355e] hover:text-white'
                                  title='Edit News Article'
                                >
                                  <BiSolidEdit className='h-3.5 w-3.5' />
                                  Edit
                                </Link>
                                <button
                                  onClick={() => deleteHandler(news._id)}
                                  className='inline-flex items-center justify-center rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700'
                                  title='Delete News Article'
                                >
                                  <BsTrash3 className='h-3.5 w-3.5' />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            </>
          }
        </div>
      </div>

      <CustomConfirmModal
        isOpen={showCreateModal}
        onConfirm={confirmCreateHandler}
        onCancel={() => setShowCreateModal(false)}
        message={{
          title: "Create New News",
          body: "Are you sure you want to create a new news article?",
        }}
      />

      <CustomConfirmModal
        isOpen={showDeleteModal}
        onConfirm={confirmDeleteHandler}
        onCancel={() => setShowDeleteModal(false)}
        message={{
          title: "Delete News",
          body: "Are you sure you want to delete this news article?",
          warning2: "This action cannot be undone.",
        }}
      />
    </Layout>
  );
}

AdminNewsScreen.auth = { adminOnly: true };
