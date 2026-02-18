import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useReducer, useState } from "react";
import Layout from "../../../components/main/Layout";
import { getError } from "../../../utils/error";
import CustomerLinking from "../../../components/users/CustomerLinking";
import { useModalContext } from "../../../components/context/ModalContext";
import { messageManagement } from "../../../utils/alertSystem/customers/messageManagement";
import handleSendEmails from "../../../utils/alertSystem/documentRelatedEmail";
import { RiLoopLeftFill } from "react-icons/ri";

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
  const { showStatusMessage } = useModalContext();
  const { query } = useRouter();
  const [wpUser, setWpUser] = useState();
  const [wpCustomer, setWpCustomer] = useState();
  const [wpAccountOwner, setWpAccountOwner] = useState();
  const userId = query.id;
  const [{ loading, loadingUpdate }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
  });

  const fetchData = async () => {
    try {
      dispatch({ type: "FETCH_REQUEST" });
      const response = await axios.get(`/api/admin/users/${userId}`);
      const userInDB = response.data.wpUser;
      const customerInDB = response.data.customer;
      const accountOwnerInDB = response.data.accountOwner;

      // Add console logging to debug state synchronization issues
      console.log("Fetched user data:", {
        approved: userInDB?.approved,
        active: userInDB?.active,
        userId: userInDB?._id,
      });

      dispatch({ type: "FETCH_SUCCESS" });
      setWpUser(userInDB);
      setWpCustomer(customerInDB);
      setWpAccountOwner(accountOwnerInDB);
    } catch (error) {
      console.error("Fetch data error:", error);
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

      const response = await axios.put(`/api/admin/users/${userId}`, {
        user: wpUser,
        customer: wpCustomer,
      });

      // Ensure we wait for the database transaction to complete
      if (response.data.type === "success") {
        // Refresh data from the server to ensure frontend-database consistency
        await fetchData();
        showStatusMessage("success", "User updated successfully");
      } else {
        throw new Error(response.data.message || "Update failed");
      }

      dispatch({ type: "UPDATE_SUCCESS" });
    } catch (error) {
      console.error("Submit error:", error);
      dispatch({ type: "UPDATE_FAIL", payload: getError(error) });
      showStatusMessage("error", getError(error) || "Error updating user");
    }
  };

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

  const links = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/news", label: "News" },
  ];

  const handleInputChange = (field, value) => {
    console.log("Input change:", { field, value, currentUser: wpUser?._id });
    setWpUser({ ...wpUser, [field]: value });
  };

  // Add effect to monitor state inconsistencies
  useEffect(() => {
    if (wpUser) {
      console.log("Current wpUser state:", {
        _id: wpUser._id,
        approved: wpUser.approved,
        active: wpUser.active,
        firstName: wpUser.firstName,
        lastName: wpUser.lastName,
      });
    }
  }, [wpUser]);

  const sendApprovalEmail = async () => {
    try {
      if (!wpUser?.email) {
        showStatusMessage("error", "User email is missing.");
        return;
      }

      const contactToEmail = {
        name: wpUser.firstName || "Customer",
        email: wpUser.email,
      };
      const emailmessage = messageManagement(
        contactToEmail,
        "Registration approved",
        null,
        null,
        null,
        wpAccountOwner,
      );

      const emailResponse = await handleSendEmails(
        emailmessage,
        contactToEmail,
        wpAccountOwner,
      );

      if (!emailResponse?.ok) {
        const errorPayload = await emailResponse?.json?.();
        throw new Error(
          errorPayload?.error || errorPayload?.message || "Email send failed",
        );
      }

      // Update user with approval email sent flag AND ensure approval status
      const updatedWpUser = {
        ...wpUser,
        approvalEmailSent: true,
        approved: true, // Ensure user is also marked as approved
      };

      const response = await axios.put(`/api/admin/users/${userId}`, {
        user: updatedWpUser,
        customer: wpCustomer,
      });

      if (response.data.type === "success") {
        // Refresh data from server to ensure UI consistency
        await fetchData();
        showStatusMessage("success", "Approval email sent and user approved.");
      } else {
        throw new Error(response.data.message || "Update failed");
      }
    } catch (error) {
      console.error("Error sending approval email:", error);
      showStatusMessage(
        "error",
        error?.message || "Error sending approval email. Please try again.",
      );
    }
  };

  return (
    <Layout title={`Edit User${userId}`}>
      <div className='grid grid-cols-1 md:grid-cols-4 md:gap-5'>
        <div className='md:flex md:justify-center px-4 md:px-0'>
          <ul className='flex md:flex-col overflow-x-auto md:overflow-x-visible space-x-2 md:space-x-0 md:space-y-4 my-3 text-sm md:text-base lg:text-lg w-full md:w-auto pb-2 md:pb-0'>
            {links.map(({ href, label, isBold }) => (
              <li key={href} className='flex-shrink-0 md:w-full'>
                <Link
                  href={href}
                  className={`flex items-center justify-center py-2 px-3 md:px-2 bg-white rounded-2xl shadow-md hover:bg-gray-100 transition whitespace-nowrap ${
                    isBold ? "font-semibold" : ""
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className='md:col-span-3 p-4 md:p-6'>
          <div className='mb-4 sticky top-[8rem] bg-white z-10 pb-4'>
            <h1 className='text-lg md:text-xl mb-3 md:mb-0 truncate'>
              {`Edit User ${wpUser?.firstName} ${wpUser?.lastName}`}
            </h1>
            {/* Mobile layout - stacked buttons */}
            <div className='block md:hidden space-y-3'>
              <div className='flex flex-wrap gap-2'>
                <button
                  disabled={loadingUpdate}
                  className='primary-button flex-1 min-w-[80px] text-sm'
                  onClick={submitHandler}
                >
                  {loadingUpdate ? "Loading" : "Update"}
                </button>
                <button
                  onClick={() => router.push(`/admin/users`)}
                  className='primary-button flex-1 min-w-[80px] text-sm'
                >
                  Back
                </button>
              </div>
              <div className='flex flex-wrap gap-2'>
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className='flex items-center justify-center gap-2 text-sm bg-[#0e355e] hover:bg-[#144e8b] disabled:bg-gray-400 text-white px-3 py-2 rounded transition-colors font-medium flex-1 min-w-[100px]'
                >
                  <RiLoopLeftFill
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  ></RiLoopLeftFill>
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
                <button
                  type='button'
                  onClick={(e) => {
                    e.preventDefault();
                    sendApprovalEmail();
                  }}
                  className='primary-button flex-1 min-w-[120px] text-sm'
                >
                  Send Approval
                </button>
              </div>
            </div>
            {/* Desktop layout - horizontal buttons */}
            <div className='hidden md:flex md:justify-between md:items-center'>
              <div className='flex flex-row'>
                <button
                  disabled={loadingUpdate}
                  className='primary-button mr-2'
                  onClick={submitHandler}
                >
                  {loadingUpdate ? "Loading" : "Update"}
                </button>
                <button
                  onClick={() => router.push(`/admin/users`)}
                  className='primary-button mr-2'
                >
                  Back
                </button>
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className='flex items-center gap-2 text-xs sm:text-sm bg-[#0e355e] hover:bg-[#144e8b] disabled:bg-gray-400 text-white px-3 py-2 primary-button transition-colors font-medium'
                >
                  <RiLoopLeftFill
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  ></RiLoopLeftFill>
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
              <div className='flex flex-row'>
                <button
                  type='button'
                  onClick={(e) => {
                    e.preventDefault();
                    sendApprovalEmail();
                  }}
                  className='primary-button mr-2'
                >
                  Send Approval Email
                </button>
              </div>
            </div>
          </div>
          <div className=''>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:flex lg:gap-4 gap-3 my-4'>
              <label className='flex items-center cursor-pointer touch-manipulation'>
                <input
                  autoComplete='off'
                  checked={wpUser?.active || false}
                  type='checkbox'
                  onChange={(e) =>
                    handleInputChange("active", e.target.checked)
                  }
                  className='mr-2 w-4 h-4 md:w-auto md:h-auto'
                />
                <span className='text-sm md:text-base'>Is Active?</span>
              </label>
              <label className='flex items-center cursor-pointer touch-manipulation'>
                <input
                  autoComplete='off'
                  checked={wpUser?.approved || false}
                  type='checkbox'
                  onChange={(e) =>
                    handleInputChange("approved", e.target.checked)
                  }
                  className='mr-2 w-4 h-4 md:w-auto md:h-auto'
                />
                <span className='text-sm md:text-base'>Is Approved?</span>
              </label>
              <label className='flex items-center cursor-pointer touch-manipulation'>
                <input
                  autoComplete='off'
                  type='checkbox'
                  checked={wpUser?.isAdmin || false}
                  onChange={(e) =>
                    handleInputChange("isAdmin", e.target.checked)
                  }
                  className='mr-2 w-4 h-4 md:w-auto md:h-auto'
                />
                <span className='text-sm md:text-base'>Is Admin?</span>
              </label>
              <label className='flex items-center cursor-pointer touch-manipulation'>
                <input
                  autoComplete='off'
                  type='checkbox'
                  checked={wpUser?.restricted || false}
                  onChange={(e) =>
                    handleInputChange("restricted", e.target.checked)
                  }
                  className='mr-2 w-4 h-4 md:w-auto md:h-auto'
                />
                <span className='text-sm md:text-base'>Restricted?</span>
              </label>
            </div>
            <div className='mb-4 grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='mb-2'>
                <label className='block text-sm md:text-base font-medium mb-1'>
                  Name
                </label>
                <input
                  autoComplete='off'
                  type='text'
                  value={wpUser?.firstName || ""}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  className='w-full px-3 py-3 md:py-2 border rounded text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation'
                />
              </div>
              <div className='mb-2'>
                <label className='block text-sm md:text-base font-medium mb-1'>
                  Last Name
                </label>
                <input
                  autoComplete='off'
                  type='text'
                  value={wpUser?.lastName || ""}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  className='w-full px-3 py-3 md:py-2 border rounded text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation'
                />
              </div>
              <div className='mb-2 md:col-span-2'>
                <label className='block text-sm md:text-base font-medium mb-1'>
                  Email
                </label>
                <input
                  autoComplete='off'
                  type='email'
                  value={wpUser?.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className='w-full px-3 py-3 md:py-2 border rounded text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation'
                />
              </div>
            </div>
          </div>
          <CustomerLinking
            wpUser={wpUser}
            setWpUser={setWpUser}
            wpCustomer={wpCustomer}
            setWpCustomer={setWpCustomer}
            fetchData={fetchData}
          />
        </div>
      </div>
      <div className='fixed z-[9999] bg-gray bg-opacity-50'></div>
    </Layout>
  );
}

AdminUserEditScreen.auth = { adminOnly: true };
