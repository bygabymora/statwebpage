import axios from "axios";
import Link from "next/link";
import React, { useEffect, useReducer, useState } from "react";
import { toast } from "react-toastify";
import Layout from "../../components/main/Layout";
import { getError } from "../../utils/error";
import { BiSolidEdit } from "react-icons/bi";
import { useRouter } from "next/router";
import { BsTrash3 } from "react-icons/bs";
import { FaUser, FaSearch } from "react-icons/fa";
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
        const { data } = await axios.get(`/api/admin/users`);
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

  const confirmDelete = (userId) => {
    setSelectedUserId(userId);
    setShowModal(true);
  };

  const deleteUser = async () => {
    try {
      dispatch({ type: "DELETE_REQUEST" });
      await axios.delete(`/api/admin/users/${selectedUserId}`);
      dispatch({ type: "DELETE_SUCCESS" });
      toast.success("User deleted successfully");
    } catch (err) {
      dispatch({ type: "DELETE_FAIL" });
      toast.error(getError(err));
    }
    setShowModal(false);
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
    <Layout title='Users'>
      <div className='flex justify-center'>
        <ul className='flex space-x-4 my-3 lg:text-lg w-full'>
          {links.map(({ href, label, isBold }) => (
            <li key={href} className='w-full'>
              <Link
                href={href}
                className={`flex items-center justify-center py-2 bg-white rounded-2xl shadow-md hover:bg-gray-100 transition ${
                  isBold ? "font-semibold" : ""
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className='max-w-7xl mx-auto p-6'>
        <div className='max-w-7xl mx-auto p-6'>
          <h1 className='text-3xl font-bold text-[#0e355e] mb-2'>Users</h1>
          <div className='flex items-center gap-4 text-lg'>
            <p className='text-gray-600'>
              Total Users:{" "}
              <span className='font-semibold text-[#0e355e]'>
                {users.length}
              </span>
            </p>
            {searchTerm && (
              <p className='text-gray-600'>
                • Showing:{" "}
                <span className='font-semibold text-[#0e355e]'>
                  {filteredAndSortedUsers.length}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className='mb-6'>
          <div className='relative max-w-md'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <FaSearch className='h-4 w-4 text-gray-400' />
            </div>
            <input
              type='text'
              placeholder='Search by name, email, or company...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-500'
            />
          </div>
          {searchTerm && (
            <p className='mt-2 text-sm text-gray-600'>
              Found {filteredAndSortedUsers.length} user
              {filteredAndSortedUsers.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {loadingDelete && (
          <div className='text-center py-4'>
            <div className='inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg'>
              Deleting user...
            </div>
          </div>
        )}
        {loading ? (
          <div className='text-center py-12'>
            <div className='inline-flex items-center px-6 py-3 bg-gray-50 text-gray-600 rounded-lg text-lg'>
              Loading users...
            </div>
          </div>
        ) : error ? (
          <div className='text-center py-12'>
            <div className='inline-flex items-center px-6 py-3 bg-red-50 text-red-600 rounded-lg text-lg'>
              {error}
            </div>
          </div>
        ) : filteredAndSortedUsers.length === 0 ? (
          <div className='text-center py-12'>
            <div className='inline-flex items-center px-6 py-3 bg-gray-50 text-gray-600 rounded-lg text-lg'>
              {searchTerm
                ? `No users found matching "${searchTerm}"`
                : "No users available"}
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredAndSortedUsers.map((user) => (
              <div
                key={user._id}
                className='bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100'
              >
                {/* Card Header */}
                <div className='p-6 pb-4'>
                  <div className='flex items-start space-x-4'>
                    {/* Avatar */}
                    <div className='flex-shrink-0'>
                      <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center'>
                        <FaUser className='w-6 h-6 text-gray-400' />
                      </div>
                    </div>
                    {/* User Info */}
                    <div className='flex-1 min-w-0'>
                      <h3 className='text-lg font-semibold text-gray-900 truncate'>
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className='text-sm text-gray-600 truncate'>
                        {user.email}
                      </p>
                      {user.companyName && (
                        <p className='text-sm text-gray-500 truncate mt-1'>
                          {user.companyName}
                        </p>
                      )}
                      <p className='text-xs text-gray-400 mt-1 font-mono'>
                        ID: {user._id.slice(-6)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Grid */}
                <div className='bg-gray-50 px-6 py-4'>
                  <div className='grid grid-cols-3 gap-4'>
                    <div className='text-center'>
                      <div className='text-xs font-medium text-gray-600 mb-1'>
                        Active
                      </div>
                      <div className='text-lg flex justify-center'>
                        {user.active ? (
                          <IoCheckmarkSharp className='text-green-600' />
                        ) : (
                          <IoCloseOutline className='text-red-600' />
                        )}
                      </div>
                    </div>
                    <div className='text-center border-l border-r border-gray-200'>
                      <div className='text-xs font-medium text-gray-600 mb-1'>
                        Approved
                      </div>
                      <div className='text-lg flex justify-center'>
                        {user.approved ? (
                          <IoCheckmarkSharp className='text-green-600' />
                        ) : (
                          <IoCloseOutline className='text-red-600' />
                        )}
                      </div>
                    </div>
                    <div className='text-center'>
                      <div className='text-xs font-medium text-gray-600 mb-1'>
                        Admin
                      </div>
                      <div className='text-lg flex justify-center'>
                        {user.isAdmin ? (
                          <IoCheckmarkSharp className='text-green-600' />
                        ) : (
                          <IoCloseOutline className='text-red-600' />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className='px-6 py-4 flex items-center justify-between bg-white border-t border-gray-50'>
                  <div className='flex items-center space-x-2'>
                    <span className='text-sm font-medium text-gray-600'>
                      Restricted:
                    </span>
                    <span className='text-sm flex items-center'>
                      {user.restricted ? (
                        <IoCheckmarkSharp className='text-green-600' />
                      ) : (
                        <IoCloseOutline className='text-red-600' />
                      )}
                    </span>
                  </div>
                  <div className='flex space-x-2'>
                    <button
                      onClick={() => router.push(`/admin/user/${user._id}`)}
                      className='px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1'
                      title='Edit User'
                    >
                      <BiSolidEdit size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => confirmDelete(user._id)}
                      className='px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1'
                      title='Delete User'
                    >
                      <BsTrash3 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {showModal && (
          <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]'>
            <div className='bg-white p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 text-center'>
              <h2 className='text-xl font-bold text-gray-900 mb-2'>
                ⚠️ Confirm Deletion
              </h2>
              <p className='text-gray-600 mb-6'>
                Are you sure you want to delete this user? This action cannot be
                undone.
              </p>
              <div className='flex justify-center gap-3'>
                <button
                  className='px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200'
                  onClick={deleteUser}
                >
                  Delete User
                </button>
                <button
                  className='px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200'
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
