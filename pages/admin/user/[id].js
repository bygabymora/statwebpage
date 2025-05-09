import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useReducer, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Layout from "../../../components/main/Layout";
import { getError } from "../../../utils/error";
import CustomAlertModal from "../../../components/main/CustomAlertModal";

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
  const [originalData, setOriginalData] = useState(null); // Status to save the original user data
  const [isAdmin, setEsAdmin] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isProtectedInventory, setIsProtectedInventory] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState({
    title: "",
    body: "",
    warning: "",
  });

  const { query } = useRouter();
  const userId = query.id;
  const [{ loading, error, loadingUpdate }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
  });

  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const response = await axios.get(`/api/admin/users/${userId}`);
        const data = response.data.user;
        dispatch({ type: "FETCH_SUCCESS" });

        // Save original data to compare later
        setOriginalData(data);

        setValue("name", data.name);
        setValue("email", data.email);
        setValue("companyName", data.companyName);
        setValue("companyEinCode", data.companyEinCode);
        setValue("isAdmin", data.isAdmin);
        setValue("active", data.active);
        setValue("approved", data.approved);
        setValue("protectedInventory", data.protectedInventory);

        setEsAdmin(data.isAdmin);
        setIsActive(data.active);
        setIsApproved(data.approved);
        setIsProtectedInventory(data.protectedInventory);
      } catch (error) {
        dispatch({ type: "FETCH_FAIL", payload: getError(error) });
      }
    };

    fetchData();
  }, [userId, setValue]);

  const router = useRouter();

  const submitHandler = async (formData) => {
    try {
      dispatch({ type: "UPDATE_REQUEST" });

      await axios.put(`/api/admin/users/${userId}`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName || "",
        companyEinCode: formData.companyEinCode || "",
        isAdmin,
        active: isActive,
        approved: isApproved,
        protectedInventory: isProtectedInventory,
      });

      dispatch({ type: "UPDATE_SUCCESS" });

      // Generate personalized message according to the changes made
      generateCustomMessage(formData);

      setShowModal(true);
    } catch (error) {
      dispatch({ type: "UPDATE_FAIL", payload: getError(error) });
      toast.error(getError(error));
    }
  };

  const generateCustomMessage = (formData) => {
    let changes = [];

    if (formData.name !== originalData.name) changes.push("Name updated.");
    if (formData.email !== originalData.email) changes.push("Email updated.");
    if (formData.companyName !== originalData.companyName)
      changes.push("Company Name updated.");
    if (formData.companyEinCode !== originalData.companyEinCode)
      changes.push("Company EIN Code updated.");
    if (isAdmin !== originalData.isAdmin) changes.push("Admin status changed.");
    if (isActive !== originalData.active)
      changes.push("Active status changed.");
    if (isProtectedInventory !== originalData.protectedInventory)
      changes.push("Protected Inventory status changed.");
    if (isApproved !== originalData.approved)
      changes.push("Approved status changed.");

    if (changes.length === 0) {
      setModalMessage({
        title: "No Changes Made",
        body: "No changes were detected in the user profile.",
        warning: "You can modify the user data and save again.",
      });
    } else {
      setModalMessage({
        title: "User Updated Successfully",
        body: changes.join(" "),
        warning: "These changes have been saved successfully.",
      });
    }
  };

  const handleAlertConfirm = () => {
    setShowModal(false);
    router.push("/admin/users");
  };

  const links = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/news", label: "News" },
  ];

  return (
    <Layout title={`Editar Usuario ${userId}`}>
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
        <div className='md:col-span-3'>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className='alert-error'>{error}</div>
          ) : (
            <form
              className='mx-auto max-w-screen-md'
              onSubmit={handleSubmit(submitHandler)}
            >
              <h1 className='mb-4 text-xl'>{`Edit User ${userId
                .substring(userId.length - 8)
                .toUpperCase()}`}</h1>

              <div className='flex gap-4 my-4'>
                <label>
                  <input
                    type='checkbox'
                    {...register("active")}
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  &nbsp; Is Active?
                </label>
                <label>
                  <input
                    type='checkbox'
                    {...register("approved")}
                    checked={isApproved}
                    onChange={(e) => setIsApproved(e.target.checked)}
                  />
                  &nbsp; Is Approved?
                </label>
                <label>
                  <input
                    type='checkbox'
                    {...register("isAdmin")}
                    checked={isAdmin}
                    onChange={(e) => setEsAdmin(e.target.checked)}
                  />
                  &nbsp; Is Admin?
                </label>
                <label>
                  <input
                    type='checkbox'
                    {...register("protectedInventory")}
                    checked={isProtectedInventory}
                    onChange={(e) =>
                      setIsProtectedInventory(e.target.checked === true)
                    }
                  />
                  &nbsp; Protected Inventory?
                </label>
              </div>

              <div className='mb-4'>
                <label>Name</label>
                <input
                  {...register("name")}
                  className='w-full px-3 py-2 border rounded'
                />
              </div>
              <div className='mb-4'>
                <label>Email</label>
                <input
                  {...register("email")}
                  className='w-full px-3 py-2 border rounded'
                />
              </div>
              <div className='mb-4'>
                <label>Company Name</label>
                <input
                  {...register("companyName")}
                  className='w-full px-3 py-2 border rounded'
                />
              </div>
              <div className='mb-4'>
                <label>Company EIN Code</label>
                <input
                  {...register("companyEinCode")}
                  className='w-full px-3 py-2 border rounded'
                />
              </div>

              <div className='flex flex-row my-5'>
                <button
                  disabled={loadingUpdate}
                  className='primary-button mr-2'
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
            </form>
          )}
        </div>
      </div>
      <div className='fixed z-[9999] bg-gray bg-opacity-50'>
        <CustomAlertModal
          isOpen={showModal}
          message={modalMessage}
          onConfirm={handleAlertConfirm}
        />
      </div>
    </Layout>
  );
}

AdminUserEditScreen.auth = { adminOnly: true };
