import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useReducer, useState } from "react";
import { toast } from "react-toastify";
import Layout from "../../../components/main/Layout";
import { getError } from "../../../utils/error";
import CustomerLinking from "../../../components/users/CustomerLinking";
import { useModalContext } from "../../../components/context/ModalContext";

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

export default function AdminUserEditScreen() {
  const [customer, setCustomer] = useState({});
  const [user, setUser] = useState(null);
  const { showStatusMessage } = useModalContext();
  const { query } = useRouter();
  const userId = query.id;
  const [{ loadingUpdate }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
  });

  const fetchData = async () => {
    try {
      dispatch({ type: "FETCH_REQUEST" });
      const response = await axios.get(`/api/admin/users/${userId}`);
      const userInDB = response.data.user;
      const customerInDB = response.data.customer;
      dispatch({ type: "FETCH_SUCCESS" });
      console.log("userInDB", userInDB);
      console.log("customerInDB", customerInDB);
      setUser(userInDB);
      setCustomer(customerInDB);
    } catch (error) {
      dispatch({ type: "FETCH_FAIL", payload: getError(error) });
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const router = useRouter();

  const submitHandler = async () => {
    try {
      dispatch({ type: "UPDATE_REQUEST" });

      await axios.put(`/api/admin/users/${userId}`, { user, customer });

      dispatch({ type: "UPDATE_SUCCESS" });
      showStatusMessage("success", "User updated successfully");
    } catch (error) {
      dispatch({ type: "UPDATE_FAIL", payload: getError(error) });
      toast.error(getError(error));
    }
  };

  const links = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/news", label: "News" },
  ];

  const handleInputChange = (field, value) => {
    setUser({ ...user, [field]: value });
  };

  return (
    <Layout title={`Edit User${userId}`}>
      <div className='grid md:grid-cols-4 md:gap-5'>
        <div className='flex justify-center'>
          <ul className='flex flex-col space-y-4 my-3 lg:text-lg w-full'>
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
        {console.log("user", user)}
        {console.log("customer", customer)}
        <div className='md:col-span-3 p-6'>
          <div className='flex justify-between items-center mb-4 sticky top-[8rem] bg-white z-10'>
            <h1 className='text-xl'>{`Edit User ${user?.firstName} ${user?.lastName}`}</h1>
            <div className='flex flex-row my-5'>
              <button
                disabled={loadingUpdate}
                className='primary-button mr-2'
                onClick={submitHandler}
              >
                {loadingUpdate ? "Loading" : "Update"}
              </button>
              <button
                onClick={() => router.push(`/`)}
                className='primary-button'
              >
                Back
              </button>
            </div>
          </div>
          <div className=''>
            <div className='flex gap-4 my-4'>
              <label>
                <input
                  autoComplete='off'
                  checked={user?.active || false}
                  type='checkbox'
                  onChange={(e) =>
                    handleInputChange("active", e.target.checked)
                  }
                />
                &nbsp; Is Active?
              </label>
              <label>
                <input
                  autoComplete='off'
                  checked={user?.approved || false}
                  type='checkbox'
                  onChange={(e) =>
                    handleInputChange("approved", e.target.checked)
                  }
                />
                &nbsp; Is Approved?
              </label>
              <label>
                <input
                  autoComplete='off'
                  type='checkbox'
                  checked={user?.isAdmin || false}
                  onChange={(e) =>
                    handleInputChange("isAdmin", e.target.checked)
                  }
                />
                &nbsp; Is Admin?
              </label>
              <label>
                <input
                  autoComplete='off'
                  type='checkbox'
                  checked={user?.restricted || false}
                  onChange={(e) =>
                    handleInputChange("restricted", e.target.checked)
                  }
                />
                &nbsp; Restricted?
              </label>
            </div>
            <div className='mb-4 grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='mb-2'>
                <label>Name</label>
                <input
                  autoComplete='off'
                  type='text'
                  value={user?.firstName || ""}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  className='w-full px-3 py-2 border rounded'
                />
              </div>
              <div className='mb-2'>
                <label>Last Name</label>
                <input
                  autoComplete='off'
                  type='text'
                  value={user?.lastName || ""}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  className='w-full px-3 py-2 border rounded'
                />
              </div>
              <div className='mb-2 md:col-span-2'>
                <label>Email</label>
                <input
                  autoComplete='off'
                  type='email'
                  value={user?.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className='w-full px-3 py-2 border rounded'
                />
              </div>
            </div>
          </div>
          <CustomerLinking
            user={user}
            setUser={setUser}
            customer={customer}
            setCustomer={setCustomer}
          />
        </div>
      </div>
      <div className='fixed z-[9999] bg-gray bg-opacity-50'></div>
    </Layout>
  );
}

AdminUserEditScreen.auth = { adminOnly: true };
