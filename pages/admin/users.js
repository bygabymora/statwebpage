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
        // Add timestamp and cache-busting headers
        const { data } = await axios.get(`/api/admin/users?t=${Date.now()}`, {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });
        console.log(
          `Frontend received ${data.length} users at ${new Date().toISOString()}`,
        );
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

  // Manual refresh function
  const handleRefresh = async () => {
    try {
      dispatch({ type: "FETCH_REQUEST" });
      const { data } = await axios.get(`/api/admin/users?t=${Date.now()}`, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      console.log(
        `Manual refresh: ${data.length} users at ${new Date().toISOString()}`,
      );
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

  // Helper function to check if user is new (within 48 hours)
  const isNewUser = (user) => {
    if (!user.createdAt) return false;
    const userCreatedAt = new Date(user.createdAt);
    const now = new Date();
    const hoursDiff = (now - userCreatedAt) / (1000 * 60 * 60);
    return hoursDiff <= 48;
  };

  // Helper function to get user status colors and info
  const getUserStatusInfo = (user) => {
    if (user.isAdmin) {
      return {
        color: "#07783e",
        label: "Admin",
        bgColor: "bg-green-50",
        headerBgColor: "rgba(7, 120, 62, 0.05)", // Very soft green tint
      };
    }
    if (isNewUser(user)) {
      return {
        color: "#8B5CF6",
        label: "New User",
        bgColor: "bg-purple-50",
        headerBgColor: "rgba(139, 92, 246, 0.05)", // Very soft purple tint
      };
    }
    if (user.restricted) {
      return {
        color: "#ffd700",
        label: "Restricted",
        bgColor: "bg-yellow-50",
        headerBgColor: "rgba(255, 215, 0, 0.08)", // Very soft yellow tint
      };
    }
    return {
      color: "transparent",
      label: "",
      bgColor: "",
      headerBgColor: "transparent",
    };
  };

  // Filter and sort users
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

  const links = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/users", label: "Users", isBold: true },
    { href: "/admin/news", label: "News" },
  ];

  return (
    <Layout title='Admin Users'>
      {/* Enhanced Navigation */}
      <div className='bg-white shadow-sm border-b'>
        <div className='mx-auto px-2 sm:px-4 lg:px-8 xl:px-12'>
          <nav className='flex space-x-1 py-2 overflow-x-auto scrollbar-hide'>
            {links.map(({ href, label, isBold }) => (
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
      <div className='mx-auto px-1 sm:px-2 md:px-4 lg:px-8 xl:px-12 py-2 sm:py-4 md:py-6'>
        {/* Header Section */}
        <div className='mb-3 sm:mb-6 md:mb-8'>
          <div className='flex flex-col gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-4 md:mb-6'>
            <div>
              <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-[#0e355e]'>
                User Management
              </h1>
              <p className='text-sm sm:text-base text-gray-600 mt-1'>
                Manage user accounts and permissions
              </p>
            </div>
            <div className='flex flex-wrap items-center justify-between gap-2 sm:gap-3'>
              <div className='flex flex-wrap gap-2 sm:gap-3'>
                <div className='text-xs sm:text-sm text-gray-500 bg-gray-50 px-2 py-1 sm:px-3 sm:py-2 rounded-lg'>
                  Total:{" "}
                  <span className='font-semibold text-gray-700'>
                    {users.length}
                  </span>
                </div>
                {searchTerm && (
                  <div className='text-xs sm:text-sm text-gray-500 bg-blue-50 px-2 py-1 sm:px-3 sm:py-2 rounded-lg'>
                    Found:{" "}
                    <span className='font-semibold text-blue-700'>
                      {filteredAndSortedUsers.length}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className='flex items-center gap-2 text-xs sm:text-sm bg-[#144e8b] hover:bg-[#0e355e] disabled:bg-gray-400 text-white px-3 py-2 rounded-lg transition-colors font-medium'
              >
                <RiLoopLeftFill
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                ></RiLoopLeftFill>
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className='mb-6 sm:mb-8'>
          <div className='flex flex-col gap-3 sm:gap-4'>
            <div className='relative'>
              <FaSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm' />
              <input
                type='text'
                placeholder='Search users...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
              />
            </div>
            {searchTerm && (
              <div className='flex items-center justify-between text-xs sm:text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg'>
                <span>
                  Found {filteredAndSortedUsers.length} user
                  {filteredAndSortedUsers.length !== 1 ? "s" : ""}
                </span>
                <button
                  onClick={() => setSearchTerm("")}
                  className='text-gray-400 hover:text-gray-600 transition-colors font-bold text-lg'
                  title='Clear search'
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Legend */}
        <div className='hidden sm:block mb-3 sm:mb-6 md:mb-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-5 border border-gray-200'>
          <h3 className='text-xs sm:text-sm font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center gap-2'>
            <div className='w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full'></div>
            Status Indicators
          </h3>
          <div className='grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-4 text-xs sm:text-sm'>
            <div className='flex items-center gap-2 sm:gap-3 bg-white rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 shadow-sm'>
              <div className='w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500 flex-shrink-0'></div>
              <span className='text-gray-700 font-medium'>Admin User</span>
            </div>
            <div className='flex items-center gap-2 sm:gap-3 bg-white rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 shadow-sm'>
              <div className='w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-purple-500 flex-shrink-0'></div>
              <span className='text-gray-700 font-medium'>New User (48h)</span>
            </div>
            <div className='flex items-center gap-2 sm:gap-3 bg-white rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 shadow-sm'>
              <div className='w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-yellow-500 flex-shrink-0'></div>
              <span className='text-gray-700 font-medium'>Restricted</span>
            </div>
          </div>
        </div>

        {loadingDelete && (
          <div className='flex items-center justify-center py-6 mb-6'>
            <div className='flex items-center px-4 py-3 bg-blue-50 border border-blue-200 text-[#0e355e] rounded-lg shadow-sm'>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-[#0e355e] mr-3'></div>
              Deleting user...
            </div>
          </div>
        )}
        {loading ?
          <div className='flex items-center justify-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#0e355e]'></div>
            <span className='ml-3 text-gray-600'>Loading users...</span>
          </div>
        : error ?
          <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
            <div className='flex items-center'>
              <div className='text-red-600 font-medium'>
                Error loading users:
              </div>
            </div>
            <div className='text-red-500 mt-1'>{error}</div>
          </div>
        : filteredAndSortedUsers.length === 0 ?
          <div className='text-center py-12'>
            <div className='text-gray-500 mb-2'>No users found</div>
            <div className='text-sm text-gray-400'>
              {searchTerm ?
                `Try adjusting your search criteria`
              : "No users available"}
            </div>
          </div>
        : <>
            {/* Mobile Card Layout */}
            <div className='grid gap-1 sm:gap-2 md:gap-3 md:hidden'>
              {filteredAndSortedUsers.map((user) => {
                const statusInfo = getUserStatusInfo(user);
                return (
                  <div
                    key={user._id}
                    className='bg-white shadow-sm sm:shadow-md rounded-md sm:rounded-lg md:rounded-xl p-1.5 sm:p-2 md:p-3 lg:p-5 border border-gray-100 hover:shadow-lg transition-all duration-200'
                    style={{
                      backgroundColor: statusInfo.headerBgColor || "white",
                    }}
                  >
                    {/* Mobile Card Header */}
                    <div className='flex items-start gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 mb-1.5 sm:mb-2 md:mb-3 lg:mb-4'>
                      <div className='flex-shrink-0 relative'>
                        <div className='w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-[#0e355e] to-[#144e8b] rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm md:text-lg lg:text-xl shadow-md'>
                          {user.firstName?.[0]?.toUpperCase()}
                          {user.lastName?.[0]?.toUpperCase()}
                        </div>
                        {statusInfo.label && (
                          <div
                            className={`absolute -top-0.5 -right-0.5 lg:-top-1 lg:-right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 rounded-full border-2 border-white`}
                            style={{
                              backgroundColor: statusInfo.color,
                            }}
                          ></div>
                        )}
                      </div>
                      <div className='min-w-0 flex-1'>
                        <h3 className='font-bold text-gray-900 text-xs sm:text-sm md:text-lg leading-tight mb-1'>
                          {user.firstName} {user.lastName}
                        </h3>
                        <p className='text-gray-600 text-xs sm:text-sm font-medium mb-1 truncate'>
                          {user.email}
                        </p>
                        <div className='flex flex-wrap items-center gap-1 sm:gap-2'>
                          <span className='text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded'>
                            #{user._id.slice(-6)}
                          </span>
                          {user.companyName && (
                            <span className='inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 truncate max-w-[120px] sm:max-w-[150px]'>
                              {user.companyName}
                            </span>
                          )}
                          {user.customerId && (
                            <span className='inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                              ID: {user.customerId}
                            </span>
                          )}
                          {statusInfo.label && (
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} border`}
                              style={{
                                color: statusInfo.color,
                                borderColor: statusInfo.color + "40",
                              }}
                            >
                              {statusInfo.label}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Customer ID Display */}
                    {user.customerId && (
                      <div className='bg-blue-50 rounded p-1.5 sm:p-2 md:p-3 mb-1.5 sm:mb-2 md:mb-3 lg:mb-4 border border-blue-200'>
                        <div className='text-xs text-blue-600 uppercase tracking-wide font-semibold mb-0.5 sm:mb-1'>
                          Customer ID
                        </div>
                        <div className='text-sm sm:text-base font-medium text-blue-800'>
                          {user.customerId ?
                            <IoCheckmarkSharp className='text-green-600 text-xs sm:text-sm md:text-lg' />
                          : <IoCloseOutline className='text-red-600 text-xs sm:text-sm md:text-lg' />
                          }
                        </div>
                      </div>
                    )}

                    {/* Status Grid */}
                    <div className='grid grid-cols-2 gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 mb-1.5 sm:mb-2 md:mb-3 lg:mb-4'>
                      <div className='text-center bg-gray-50 rounded p-1 sm:p-1.5 md:p-2 lg:p-3'>
                        <div className='text-xs text-gray-500 uppercase tracking-wide font-semibold mb-0.5 sm:mb-1'>
                          Active
                        </div>
                        <div className='flex justify-center'>
                          {user.active ?
                            <IoCheckmarkSharp className='text-green-600 text-xs sm:text-sm md:text-lg' />
                          : <IoCloseOutline className='text-red-600 text-xs sm:text-sm md:text-lg' />
                          }
                        </div>
                      </div>
                      <div className='text-center bg-gray-50 rounded p-1 sm:p-1.5 md:p-2 lg:p-3'>
                        <div className='text-xs text-gray-500 uppercase tracking-wide font-semibold mb-0.5 sm:mb-1'>
                          Approved
                        </div>
                        <div className='flex justify-center'>
                          {user.approved ?
                            <IoCheckmarkSharp className='text-green-600 text-xs sm:text-sm md:text-lg' />
                          : <IoCloseOutline className='text-red-600 text-xs sm:text-sm md:text-lg' />
                          }
                        </div>
                      </div>
                      <div className='text-center bg-gray-50 rounded p-1 sm:p-1.5 md:p-2 lg:p-3'>
                        <div className='text-xs text-gray-500 uppercase tracking-wide font-semibold mb-0.5 sm:mb-1'>
                          Admin
                        </div>
                        <div className='flex justify-center'>
                          {user.isAdmin ?
                            <IoCheckmarkSharp className='text-green-600 text-xs sm:text-sm md:text-lg' />
                          : <IoCloseOutline className='text-red-600 text-xs sm:text-sm md:text-lg' />
                          }
                        </div>
                      </div>
                      <div className='text-center bg-gray-50 rounded p-1 sm:p-1.5 md:p-2 lg:p-3'>
                        <div className='text-xs text-gray-500 uppercase tracking-wide font-semibold mb-0.5 sm:mb-1'>
                          Restricted
                        </div>
                        <div className='flex justify-center'>
                          {user.restricted ?
                            <IoCheckmarkSharp className='text-yellow-600 text-xs sm:text-sm md:text-lg' />
                          : <IoCloseOutline className='text-gray-600 text-xs sm:text-sm md:text-lg' />
                          }
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex space-x-1 sm:space-x-1.5 md:space-x-2'>
                      <button
                        onClick={() => router.push(`/admin/user/${user._id}`)}
                        className='flex-1 px-1.5 py-1 sm:px-2 sm:py-1.5 md:px-3 md:py-2 lg:px-4 lg:py-3 bg-gradient-to-r primary-button text-white font-medium rounded sm:rounded-md md:rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm sm:shadow-md hover:shadow-lg flex items-center justify-center space-x-0.5 sm:space-x-1 md:space-x-2 text-xs sm:text-sm md:text-base'
                      >
                        <BiSolidEdit
                          size={10}
                          className='sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4'
                        />
                        <span className='hidden xs:inline sm:inline'>
                          Edit User
                        </span>
                      </button>
                      <button
                        onClick={() => confirmDelete(user._id)}
                        className='px-1.5 py-1 sm:px-2 sm:py-1.5 md:px-3 md:py-2 lg:px-4 lg:py-3 bg-gradient-to-r primary-button text-white font-medium rounded sm:rounded-md md:rounded-lg transition-all duration-200 shadow-sm sm:shadow-md hover:shadow-lg flex items-center justify-center text-xs sm:text-sm md:text-base'
                        title='Delete User'
                      >
                        <BsTrash3
                          size={10}
                          className='sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4'
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table Layout */}
            <div className='hidden md:block bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200'>
              <div className='overflow-x-auto overflow-y-auto max-h-[85vh] custom-scrollbar'>
                <table className='w-full' style={{ minWidth: "600px" }}>
                  <thead className='bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 sticky top-0 z-10'>
                    <tr>
                      <th className='px-2 py-2 sm:px-3 sm:py-3 lg:px-6 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[160px] sm:min-w-[200px]'>
                        User Information
                      </th>
                      <th className='px-1 py-2 sm:px-2 sm:py-3 lg:px-4 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[80px] sm:min-w-[120px]'>
                        Company
                      </th>
                      <th className='px-1 py-2 sm:px-2 sm:py-3 lg:px-4 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[80px] sm:min-w-[100px]'>
                        Customer ID
                      </th>
                      <th className='px-1 py-2 sm:px-2 sm:py-3 lg:px-4 lg:py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[60px] sm:min-w-[80px]'>
                        Active
                      </th>
                      <th className='px-1 py-2 sm:px-2 sm:py-3 lg:px-4 lg:py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[70px] sm:min-w-[90px]'>
                        Approved
                      </th>
                      <th className='px-1 py-2 sm:px-2 sm:py-3 lg:px-4 lg:py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[60px] sm:min-w-[80px]'>
                        Admin
                      </th>
                      <th className='px-1 py-2 sm:px-2 sm:py-3 lg:px-4 lg:py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[70px] sm:min-w-[90px]'>
                        Restricted
                      </th>
                      <th className='px-1 py-2 sm:px-2 sm:py-3 lg:px-4 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[90px] sm:min-w-[120px]'>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-200'>
                    {filteredAndSortedUsers.map((user, index) => {
                      const statusInfo = getUserStatusInfo(user);
                      return (
                        <tr
                          key={user._id}
                          className={`hover:bg-gray-50 transition-colors ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-25"
                          }`}
                        >
                          <td className='px-2 py-2 sm:px-3 sm:py-3 lg:px-6 lg:py-4'>
                            <div className='flex items-center gap-1 sm:gap-2 lg:gap-4'>
                              <div className='flex-shrink-0 relative'>
                                <div className='w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-[#0e355e] to-[#144e8b] rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm lg:text-lg shadow-md'>
                                  {user.firstName?.[0]?.toUpperCase()}
                                  {user.lastName?.[0]?.toUpperCase()}
                                </div>
                                {statusInfo.label && (
                                  <div
                                    className={`absolute -top-0.5 -right-0.5 lg:-top-1 lg:-right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 rounded-full border-2 border-white`}
                                    style={{
                                      backgroundColor: statusInfo.color,
                                    }}
                                  ></div>
                                )}
                              </div>
                              <div className='min-w-0 flex-1'>
                                <div className='font-semibold text-gray-900 text-xs sm:text-xs lg:text-sm leading-tight mb-1'>
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className='text-gray-600 text-xs sm:text-xs lg:text-sm truncate'>
                                  {user.email}
                                </div>
                                <div className='text-xs text-gray-400 font-mono mt-1 hidden md:block'>
                                  #{user._id.slice(-6)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className='px-1 py-2 sm:px-2 sm:py-3 lg:px-4 lg:py-4'>
                            <div className='text-xs sm:text-xs lg:text-sm text-gray-900 truncate max-w-[60px] sm:max-w-[100px] lg:max-w-none'>
                              {user.companyName || "—"}
                            </div>
                          </td>
                          <td className='px-1 py-2 sm:px-2 sm:py-3 lg:px-4 lg:py-4'>
                            <div className='text-xs sm:text-xs lg:text-sm text-gray-900 truncate max-w-[60px] sm:max-w-[100px] lg:max-w-none'>
                              {user.customerId ?
                                <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'>
                                  {user.customerId ?
                                    <div className='bg-green-100 p-1 sm:p-1.5 lg:p-2 rounded-full'>
                                      <IoCheckmarkSharp className='text-green-600 text-xs sm:text-sm lg:text-lg' />
                                    </div>
                                  : <div className='bg-red-100 p-1 sm:p-1.5 lg:p-2 rounded-full'>
                                      <IoCloseOutline className='text-red-600 text-xs sm:text-sm lg:text-lg' />
                                    </div>
                                  }
                                </span>
                              : "—"}
                            </div>
                          </td>
                          <td className='px-1 py-2 sm:px-2 sm:py-3 lg:px-4 lg:py-4 text-center'>
                            <div className='flex justify-center'>
                              {user.active ?
                                <div className='bg-green-100 p-1 sm:p-1.5 lg:p-2 rounded-full'>
                                  <IoCheckmarkSharp className='text-green-600 text-xs sm:text-sm lg:text-lg' />
                                </div>
                              : <div className='bg-red-100 p-1 sm:p-1.5 lg:p-2 rounded-full'>
                                  <IoCloseOutline className='text-red-600 text-xs sm:text-sm lg:text-lg' />
                                </div>
                              }
                            </div>
                          </td>
                          <td className='px-1 py-2 sm:px-2 sm:py-3 lg:px-4 lg:py-4 text-center'>
                            <div className='flex justify-center'>
                              {user.approved ?
                                <div className='bg-green-100 p-1 sm:p-1.5 lg:p-2 rounded-full'>
                                  <IoCheckmarkSharp className='text-green-600 text-xs sm:text-sm lg:text-lg' />
                                </div>
                              : <div className='bg-red-100 p-1 sm:p-1.5 lg:p-2 rounded-full'>
                                  <IoCloseOutline className='text-red-600 text-xs sm:text-sm lg:text-lg' />
                                </div>
                              }
                            </div>
                          </td>
                          <td className='px-1 py-2 sm:px-2 sm:py-3 lg:px-4 lg:py-4 text-center'>
                            <div className='flex justify-center'>
                              {user.isAdmin ?
                                <div className='bg-green-100 p-1 sm:p-1.5 lg:p-2 rounded-full'>
                                  <IoCheckmarkSharp className='text-green-600 text-xs sm:text-sm lg:text-lg' />
                                </div>
                              : <div className='bg-red-100 p-1 sm:p-1.5 lg:p-2 rounded-full'>
                                  <IoCloseOutline className='text-red-600 text-xs sm:text-sm lg:text-lg' />
                                </div>
                              }
                            </div>
                          </td>
                          <td className='px-1 py-2 sm:px-2 sm:py-3 lg:px-4 lg:py-4 text-center'>
                            <div className='flex justify-center'>
                              {user.restricted ?
                                <div className='bg-yellow-100 p-1 sm:p-1.5 lg:p-2 rounded-full'>
                                  <IoCheckmarkSharp className='text-yellow-600 text-xs sm:text-sm lg:text-lg' />
                                </div>
                              : <div className='bg-gray-100 p-1 sm:p-1.5 lg:p-2 rounded-full'>
                                  <IoCloseOutline className='text-gray-600 text-xs sm:text-sm lg:text-lg' />
                                </div>
                              }
                            </div>
                          </td>
                          <td className='px-1 py-2 sm:px-2 sm:py-3 lg:px-4 lg:py-4'>
                            <div className='flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 lg:space-x-2'>
                              <button
                                onClick={() =>
                                  router.push(`/admin/user/${user._id}`)
                                }
                                className='px-1.5 py-1 sm:px-2 sm:py-1.5 lg:px-3 lg:py-2 primary-button text-white text-xs lg:text-sm font-medium rounded-lg transition-all duration-200 shadow-md flex items-center justify-center space-x-1'
                                title='Edit User'
                              >
                                <BiSolidEdit
                                  size={12}
                                  className='sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4'
                                />
                                <span className='hidden md:inline text-xs'>
                                  Edit
                                </span>
                              </button>
                              <button
                                onClick={() => confirmDelete(user._id)}
                                className='px-1.5 py-1 sm:px-2 sm:py-1.5 lg:px-3 lg:py-2 bg-gradient-to-r primary-button text-white text-xs lg:text-sm font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center'
                                title='Delete User'
                              >
                                <BsTrash3
                                  size={10}
                                  className='sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5'
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        }
        {showModal && (
          <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-[9999] backdrop-blur-sm'>
            <div className='bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 text-center border border-gray-200'>
              <div className='mb-4'>
                <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <BsTrash3 className='text-red-600 text-2xl' />
                </div>
                <h2 className='text-xl font-bold text-gray-900 mb-2'>
                  Confirm User Deletion
                </h2>
                <p className='text-gray-600'>
                  Are you sure you want to delete this user? This action cannot
                  be undone and will permanently remove all user data.
                </p>
              </div>
              <div className='flex gap-3'>
                <button
                  className='flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                  onClick={deleteUser}
                >
                  Delete User
                </button>
                <button
                  className='flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

AdminUsersScreen.auth = { adminOnly: true };
export default AdminUsersScreen;
