import axios from "axios";
import Link from "next/link";
import React, { useEffect, useReducer, useState } from "react";
import { toast } from "react-toastify";
import Layout from "../../components/main/Layout";
import { getError } from "../../utils/error";
import { BiSolidEdit } from "react-icons/bi";
import { useRouter } from "next/router";
import { BsTrash3 } from "react-icons/bs";

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
      <div className='md:col-span-3 p-4'>
        <h1 className='text-2xl font-bold mb-4'>Users</h1>
        {loadingDelete && <div>Deleting...</div>}
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className='text-red-500'>{error}</div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full bg-white shadow-md rounded-xl overflow-hidden text-sm'>
              <thead className='bg-gray-200 text-gray-700'>
                <tr>
                  {[
                    "ID",
                    "Name",
                    "Email",
                    "Company",
                    "EIN",
                    "Active",
                    "Approved",
                    "Admin",
                    "Protected Inventory",
                    "Actions",
                  ].map((header) => (
                    <th key={header} className='p-4 text-left'>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr
                    key={user._id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className='p-4 font-mono'>{user._id.slice(-6)}</td>
                    <td className='p-4'>
                      {user.firstName} {user.lastName}
                    </td>
                    <td className='p-4'>{user.email}</td>
                    <td className='p-4'>{user.companyName || "—"}</td>
                    <td className='p-4'>{user.companyEinCode || "—"}</td>
                    <td className='p-4'>{user.active ? "✅" : "❌"}</td>
                    <td className='p-4'>{user.approved ? "✅" : "❌"}</td>
                    <td className='p-4'>{user.isAdmin ? "✅" : "❌"}</td>
                    <td className='p-4'>{user.restricted ? "✅" : "❌"}</td>
                    <td className='p-4 flex gap-2 justify-center'>
                      <button
                        onClick={() => router.push(`/admin/user/${user._id}`)}
                        className='p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md w-9 h-9 flex items-center justify-center'
                        title='Edit User'
                      >
                        <BiSolidEdit size={18} />
                      </button>
                      <button
                        onClick={() => confirmDelete(user._id)}
                        className='p-2 bg-red-600 hover:bg-red-700 text-white rounded-md w-9 h-9 flex items-center justify-center'
                        title='Delete User'
                      >
                        <BsTrash3 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {showModal && (
              <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]'>
                <div className='bg-white p-6 rounded-lg shadow-lg max-w-sm text-center'>
                  <h2 className='font-bold text-lg'>⚠️ Confirm Deletion ⚠️</h2>
                  <p className='text-[#788b9b]'>
                    Are you sure you want to delete this user?
                  </p>
                  <div className='flex justify-center gap-4 mt-4'>
                    <button
                      className='px-4 py-2 bg-[#144e8b] text-white rounded-lg hover:bg-[#788b9b] transition'
                      onClick={deleteUser}
                    >
                      Delete
                    </button>
                    <button
                      className='px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition'
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

AdminUsersScreen.auth = { adminOnly: true };
export default AdminUsersScreen;
