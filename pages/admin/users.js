import axios from "axios";
import Link from "next/link";
import React, { useEffect, useReducer, useState } from "react";
import Layout from "../../components/main/Layout";
import { getError } from "../../utils/error";
import { BiSolidEdit } from "react-icons/bi";
import { useRouter } from "next/router";
import { BsTrash3 } from "react-icons/bs";
import { FaSearch } from "react-icons/fa";
import { RiLoopLeftFill } from "react-icons/ri";
import { IoCheckmarkSharp, IoCloseOutline } from "react-icons/io5";

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, users: action.payload, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
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

function AdminUsersScreen() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [{ loading, error, users, successDelete, loadingDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      users: [],
      error: "",
    });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/admin/users?t=${Date.now()}`, {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });
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

  const handleRefresh = async () => {
    try {
      dispatch({ type: "FETCH_REQUEST" });
      const { data } = await axios.get(`/api/admin/users?t=${Date.now()}`, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      dispatch({ type: "FETCH_SUCCESS", payload: data });
    } catch (err) {
      dispatch({ type: "FETCH_FAIL", payload: getError(err) });
    }
  };

  const confirmDelete = (userId) => {
    setSelectedUserId(userId);
    setShowModal(true);
  };

  const deleteUser = async () => {
    try {
      dispatch({ type: "DELETE_REQUEST" });
      await axios.delete(`/api/admin/users/${selectedUserId}`);
      dispatch({ type: "DELETE_SUCCESS" });
    } catch (err) {
      dispatch({ type: "DELETE_FAIL" });
    }
    setShowModal(false);
  };

  const isNewUser = (user) => {
    if (!user.createdAt) return false;
    const userCreatedAt = new Date(user.createdAt);
    const now = new Date();
    const hoursDiff = (now - userCreatedAt) / (1000 * 60 * 60);
    return hoursDiff <= 48;
  };

  const getUserStatusInfo = (user) => {
    if (user.isAdmin) {
      return {
        color: "#07783e",
        label: "Admin",
        badgeClass: "bg-emerald-100 text-emerald-700",
      };
    }
    if (isNewUser(user)) {
      return {
        color: "#0ea5e9",
        label: "New User",
        badgeClass: "bg-sky-100 text-sky-700",
      };
    }
    if (user.restricted) {
      return {
        color: "#d4a300",
        label: "Restricted",
        badgeClass: "bg-amber-100 text-amber-700",
      };
    }
    return {
      color: "transparent",
      label: "",
      badgeClass: "",
    };
  };

  const filteredAndSortedUsers = users
    .filter((user) => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const email = user.email.toLowerCase();
      const company = (user.companyName || "").toLowerCase();

      return (
        fullName.includes(search) ||
        email.includes(search) ||
        company.includes(search)
      );
    })
    .sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });

  const activeUsers = users.filter((user) => user.active).length;
  const adminUsers = users.filter((user) => user.isAdmin).length;
  const restrictedUsers = users.filter((user) => user.restricted).length;

  const links = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/users", label: "Users", isBold: true },
    { href: "/admin/news", label: "News" },
  ];

  return (
    <Layout title='Admin Users'>
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
        <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8 my-6'>
          <section className='mb-6 rounded-2xl border border-[#d7e3f2] bg-white p-5 shadow-sm sm:p-6'>
            <div className='mb-5 flex flex-col gap-4'>
              <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                  <h1 className='text-2xl font-bold tracking-tight text-[#0e355e] sm:text-3xl'>
                    User Management
                  </h1>
                  <p className='mt-1 text-sm text-slate-600 sm:text-base'>
                    Manage account activity, roles, and permissions.
                  </p>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className='inline-flex items-center justify-center gap-2 rounded-lg bg-[#0e355e] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#144e8b] disabled:cursor-not-allowed disabled:bg-slate-400'
                >
                  <RiLoopLeftFill
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                  <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                    Total Users
                  </p>
                  <p className='mt-1 text-2xl font-bold text-[#0e355e]'>
                    {users.length}
                  </p>
                  <p className='text-xs text-slate-500'>All user accounts</p>
                </div>
                <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                  <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                    Active
                  </p>
                  <p className='mt-1 text-2xl font-bold text-[#0e355e]'>
                    {activeUsers}
                  </p>
                  <p className='text-xs text-slate-500'>Users marked active</p>
                </div>
                <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                  <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                    Admins
                  </p>
                  <p className='mt-1 text-2xl font-bold text-[#0e355e]'>
                    {adminUsers}
                  </p>
                  <p className='text-xs text-slate-500'>
                    Administrator accounts
                  </p>
                </div>
                <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                  <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                    Restricted
                  </p>
                  <p className='mt-1 text-2xl font-bold text-[#0e355e]'>
                    {restrictedUsers}
                  </p>
                  <p className='text-xs text-slate-500'>
                    Limited access accounts
                  </p>
                </div>
              </div>

              <div className='flex flex-col gap-3'>
                <div className='relative'>
                  <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm' />
                  <input
                    type='text'
                    placeholder='Search users by name, email, or company...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-4 text-sm transition-colors placeholder:text-slate-400 focus:border-[#144e8b] focus:outline-none focus:ring-2 focus:ring-[#9fc0e5]'
                  />
                </div>
                {searchTerm && (
                  <div className='flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600 sm:text-sm'>
                    <span>
                      Found {filteredAndSortedUsers.length} user
                      {filteredAndSortedUsers.length !== 1 ? "s" : ""}
                    </span>
                    <button
                      onClick={() => setSearchTerm("")}
                      className='text-slate-400 transition-colors hover:text-slate-600'
                      title='Clear search'
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className='mb-6 hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:block'>
            <h3 className='mb-3 text-sm font-semibold text-slate-700'>
              Status Indicators
            </h3>
            <div className='grid grid-cols-1 gap-2 text-xs sm:grid-cols-3 sm:text-sm'>
              <div className='rounded-lg bg-slate-50 px-3 py-2 text-slate-700'>
                <span className='mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500'></span>
                Admin User
              </div>
              <div className='rounded-lg bg-slate-50 px-3 py-2 text-slate-700'>
                <span className='mr-2 inline-block h-2 w-2 rounded-full bg-sky-500'></span>
                New User (48h)
              </div>
              <div className='rounded-lg bg-slate-50 px-3 py-2 text-slate-700'>
                <span className='mr-2 inline-block h-2 w-2 rounded-full bg-amber-500'></span>
                Restricted
              </div>
            </div>
          </section>

          {loadingDelete && (
            <div className='mb-6 flex items-center justify-center'>
              <div className='inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-[#0e355e] shadow-sm'>
                <div className='mr-3 h-4 w-4 animate-spin rounded-full border-b-2 border-[#0e355e]'></div>
                Deleting user...
              </div>
            </div>
          )}

          {loading ?
            <div className='flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-14 shadow-sm'>
              <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-[#0e355e]'></div>
              <span className='ml-3 text-slate-600'>Loading users...</span>
            </div>
          : error ?
            <div className='mb-6 rounded-xl border border-red-200 bg-red-50 p-4'>
              <div className='text-sm font-semibold text-red-700'>
                Error loading users
              </div>
              <div className='mt-1 text-sm text-red-600'>{error}</div>
            </div>
          : filteredAndSortedUsers.length === 0 ?
            <div className='rounded-2xl border border-slate-200 bg-white py-14 text-center shadow-sm'>
              <div className='mb-2 text-base font-semibold text-slate-600'>
                No users found
              </div>
              <div className='text-sm text-slate-500'>
                {searchTerm ?
                  "Try adjusting your search criteria"
                : "No users available"}
              </div>
            </div>
          : <>
              <div className='grid gap-4 md:hidden'>
                {filteredAndSortedUsers.map((user) => {
                  const statusInfo = getUserStatusInfo(user);
                  return (
                    <article
                      key={user._id}
                      className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md'
                    >
                      <div className='h-1 w-full bg-gradient-to-r from-[#0e355e] to-[#2c6aa9]'></div>
                      <div className='p-4'>
                        <div className='mb-4 flex items-start gap-3'>
                          <div className='relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0e355e] to-[#144e8b] text-sm font-bold text-white shadow-sm'>
                            {user.firstName?.[0]?.toUpperCase()}
                            {user.lastName?.[0]?.toUpperCase()}
                            {statusInfo.label && (
                              <span
                                className='absolute -right-1 -top-1 h-3 w-3 rounded-full ring-2 ring-white'
                                style={{ backgroundColor: statusInfo.color }}
                              ></span>
                            )}
                          </div>
                          <div className='min-w-0 flex-1'>
                            <h3 className='text-sm font-bold text-slate-900'>
                              {user.firstName} {user.lastName}
                            </h3>
                            <p className='truncate text-sm text-slate-600'>
                              {user.email}
                            </p>
                            <div className='mt-2 flex flex-wrap gap-2'>
                              <span className='rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700'>
                                #{user._id.slice(-6)}
                              </span>
                              {user.companyName && (
                                <span className='rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700'>
                                  {user.companyName}
                                </span>
                              )}
                              {statusInfo.label && (
                                <span
                                  className={`rounded-full px-2 py-1 text-xs font-semibold ${statusInfo.badgeClass}`}
                                >
                                  {statusInfo.label}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className='mb-4 grid grid-cols-2 gap-2'>
                          <div className='rounded-lg border border-slate-200 bg-slate-50 p-2 text-center'>
                            <p className='mb-1 text-xs font-semibold uppercase text-slate-500'>
                              Active
                            </p>
                            {user.active ?
                              <IoCheckmarkSharp className='mx-auto text-base text-emerald-600' />
                            : <IoCloseOutline className='mx-auto text-base text-red-600' />
                            }
                          </div>
                          <div className='rounded-lg border border-slate-200 bg-slate-50 p-2 text-center'>
                            <p className='mb-1 text-xs font-semibold uppercase text-slate-500'>
                              Approved
                            </p>
                            {user.approved ?
                              <IoCheckmarkSharp className='mx-auto text-base text-emerald-600' />
                            : <IoCloseOutline className='mx-auto text-base text-red-600' />
                            }
                          </div>
                          <div className='rounded-lg border border-slate-200 bg-slate-50 p-2 text-center'>
                            <p className='mb-1 text-xs font-semibold uppercase text-slate-500'>
                              Admin
                            </p>
                            {user.isAdmin ?
                              <IoCheckmarkSharp className='mx-auto text-base text-emerald-600' />
                            : <IoCloseOutline className='mx-auto text-base text-red-600' />
                            }
                          </div>
                          <div className='rounded-lg border border-slate-200 bg-slate-50 p-2 text-center'>
                            <p className='mb-1 text-xs font-semibold uppercase text-slate-500'>
                              Restricted
                            </p>
                            {user.restricted ?
                              <IoCheckmarkSharp className='mx-auto text-base text-amber-600' />
                            : <IoCloseOutline className='mx-auto text-base text-slate-500' />
                            }
                          </div>
                        </div>

                        <div className='flex gap-2'>
                          <button
                            onClick={() =>
                              router.push(`/admin/user/${user._id}`)
                            }
                            className='inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#0e355e] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#144e8b]'
                          >
                            <BiSolidEdit className='h-4 w-4' />
                            Edit User
                          </button>
                          <button
                            onClick={() => confirmDelete(user._id)}
                            className='inline-flex items-center justify-center rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700'
                            title='Delete User'
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
                  <div className='min-w-[1060px]'>
                    <div className='grid grid-cols-12 items-center gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4'>
                      <div className='col-span-3 text-xs font-semibold uppercase tracking-wider text-slate-600'>
                        User Information
                      </div>
                      <div className='col-span-2 text-xs font-semibold uppercase tracking-wider text-slate-600'>
                        Company
                      </div>
                      <div className='col-span-1 text-xs font-semibold uppercase tracking-wider text-slate-600 text-center'>
                        Customer ID
                      </div>
                      <div className='col-span-1 text-xs font-semibold uppercase tracking-wider text-slate-600 text-center'>
                        Active
                      </div>
                      <div className='col-span-1 text-xs font-semibold uppercase tracking-wider text-slate-600 text-center'>
                        Approved
                      </div>
                      <div className='col-span-1 text-xs font-semibold uppercase tracking-wider text-slate-600 text-center'>
                        Admin
                      </div>
                      <div className='col-span-1 text-xs font-semibold uppercase tracking-wider text-slate-600 text-center'>
                        Restricted
                      </div>
                      <div className='col-span-2 text-xs font-semibold uppercase tracking-wider text-slate-600'>
                        Actions
                      </div>
                    </div>

                    <div className='divide-y divide-slate-200'>
                      {filteredAndSortedUsers.map((user, index) => {
                        const statusInfo = getUserStatusInfo(user);
                        return (
                          <div
                            key={user._id}
                            className={`grid grid-cols-12 items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50 ${
                              index % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                            }`}
                          >
                            <div className='col-span-3'>
                              <div className='flex items-center gap-3'>
                                <div className='relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#0e355e] to-[#144e8b] text-sm font-bold text-white'>
                                  {user.firstName?.[0]?.toUpperCase()}
                                  {user.lastName?.[0]?.toUpperCase()}
                                  {statusInfo.label && (
                                    <span
                                      className='absolute -right-1 -top-1 h-3 w-3 rounded-full ring-2 ring-white'
                                      style={{
                                        backgroundColor: statusInfo.color,
                                      }}
                                    ></span>
                                  )}
                                </div>
                                <div className='min-w-0'>
                                  <p className='text-sm font-semibold text-slate-900'>
                                    {user.firstName} {user.lastName}
                                  </p>
                                  <p className='truncate text-sm text-slate-600'>
                                    {user.email}
                                  </p>
                                  <div className='mt-1 flex items-center gap-2'>
                                    <span className='text-xs text-slate-500'>
                                      #{user._id.slice(-6)}
                                    </span>
                                    {statusInfo.label && (
                                      <span
                                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusInfo.badgeClass}`}
                                      >
                                        {statusInfo.label}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className='col-span-2 text-sm text-slate-800 truncate'>
                              {user.companyName || "-"}
                            </div>

                            <div className='col-span-1 flex justify-center'>
                              {user.customerId ?
                                <span className='inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100'>
                                  <IoCheckmarkSharp className='text-emerald-600' />
                                </span>
                              : <span className='inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-100'>
                                  <IoCloseOutline className='text-red-600' />
                                </span>
                              }
                            </div>

                            <div className='col-span-1 flex justify-center'>
                              {user.active ?
                                <span className='inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100'>
                                  <IoCheckmarkSharp className='text-emerald-600' />
                                </span>
                              : <span className='inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-100'>
                                  <IoCloseOutline className='text-red-600' />
                                </span>
                              }
                            </div>

                            <div className='col-span-1 flex justify-center'>
                              {user.approved ?
                                <span className='inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100'>
                                  <IoCheckmarkSharp className='text-emerald-600' />
                                </span>
                              : <span className='inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-100'>
                                  <IoCloseOutline className='text-red-600' />
                                </span>
                              }
                            </div>

                            <div className='col-span-1 flex justify-center'>
                              {user.isAdmin ?
                                <span className='inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100'>
                                  <IoCheckmarkSharp className='text-emerald-600' />
                                </span>
                              : <span className='inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-100'>
                                  <IoCloseOutline className='text-red-600' />
                                </span>
                              }
                            </div>

                            <div className='col-span-1 flex justify-center'>
                              {user.restricted ?
                                <span className='inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-100'>
                                  <IoCheckmarkSharp className='text-amber-600' />
                                </span>
                              : <span className='inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100'>
                                  <IoCloseOutline className='text-slate-500' />
                                </span>
                              }
                            </div>

                            <div className='col-span-2'>
                              <div className='flex gap-2'>
                                <button
                                  onClick={() =>
                                    router.push(`/admin/user/${user._id}`)
                                  }
                                  className='inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-[#0e355e] px-3 py-2 text-xs font-semibold text-[#0e355e] transition-colors hover:bg-[#0e355e] hover:text-white'
                                  title='Edit User'
                                >
                                  <BiSolidEdit className='h-3.5 w-3.5' />
                                  Edit
                                </button>
                                <button
                                  onClick={() => confirmDelete(user._id)}
                                  className='inline-flex items-center justify-center rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700'
                                  title='Delete User'
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

          {showModal && (
            <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm'>
              <div className='mx-4 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-2xl'>
                <div className='mb-4'>
                  <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100'>
                    <BsTrash3 className='text-2xl text-red-600' />
                  </div>
                  <h2 className='mb-2 text-xl font-bold text-slate-900'>
                    Confirm User Deletion
                  </h2>
                  <p className='text-slate-600'>
                    Are you sure you want to delete this user? This action
                    cannot be undone and will permanently remove all user data.
                  </p>
                </div>
                <div className='flex gap-3'>
                  <button
                    className='flex-1 rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition-colors hover:bg-red-700'
                    onClick={deleteUser}
                  >
                    Delete User
                  </button>
                  <button
                    className='flex-1 rounded-lg bg-slate-100 px-6 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-200'
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

AdminUsersScreen.auth = { adminOnly: true };
export default AdminUsersScreen;
