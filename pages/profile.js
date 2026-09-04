import React, { useEffect, useState, useCallback } from "react";
import { signIn, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { getError } from "../utils/error";
import axios from "axios";
import Layout from "../components/main/Layout";
import Link from "next/link";
import { RiEye2Line, RiEyeCloseLine } from "react-icons/ri";
import { useModalContext } from "../components/context/ModalContext";
import ExemptionFileUploader from "../components/orders/ExemptionFileUploader";
import states from "../utils/states.json";
import formatPhoneNumber from "../utils/functions/phoneModified";

const ADDRESS_FIELDS = [
  ["address", "Address", "text"],
  ["suiteNumber", "Suite Number", "text"],
  ["city", "City", "text"],
  ["postalCode", "Zip Code", "text"],
];

function AddressSummaryCard({ title, address }) {
  const hasAddress = Boolean(address?.address);
  return (
    <div className='bg-gray-50 rounded-xl p-4 border border-gray-100'>
      <h3 className='font-semibold text-gray-700 mb-2'>{title}</h3>
      {hasAddress ?
        <p className='text-sm text-gray-800 leading-relaxed'>
          {address.address}
          {address.suiteNumber ? `, ${address.suiteNumber}` : ""}
          <br />
          {[address.city, address.state, address.postalCode]
            .filter(Boolean)
            .join(", ")}
        </p>
      : <p className='text-sm text-gray-400 italic'>No address on file</p>}
    </div>
  );
}

function AddressFormCard({ title, type, value, onChange }) {
  return (
    <div className='border border-gray-200 p-4 rounded-xl'>
      <h3 className='font-semibold text-gray-700 mb-3'>{title}</h3>
      <div className='space-y-3'>
        {ADDRESS_FIELDS.map(([field, label, inputType]) => (
          <div key={field}>
            <label className='block mb-1 text-xs font-semibold text-gray-500'>
              {label}
            </label>
            <input
              autoComplete='off'
              type={inputType}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#144e8b]'
              value={value?.[field] || ""}
              onChange={(e) => onChange(type, field, e.target.value)}
            />
          </div>
        ))}
        <div>
          <label className='block mb-1 text-xs font-semibold text-gray-500'>
            State
          </label>
          <select
            autoComplete='off'
            className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#144e8b]'
            value={value?.state || ""}
            onChange={(e) => onChange(type, "state", e.target.value)}
          >
            <option value=''>Select...</option>
            {states.map((state) => (
              <option key={state.key} value={state.key}>
                {state.value}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default function ProfileScreen() {
  const { data: session, status } = useSession();
  const { customer, setCustomer, user: wpUser } = useModalContext();

  // status: 'loading' | 'authenticated' | 'unauthenticated'
  const isLoading = status === "loading";
  const isAuthed = status === "authenticated" && !!session?.user;
  const isActive =
    !!session?.user?.active && !!session?.user?.approved && isAuthed;

  const [editingAddresses, setEditingAddresses] = useState(false);
  const [savingAddresses, setSavingAddresses] = useState(false);
  const [addressForm, setAddressForm] = useState({ location: {}, billAddr: {} });

  const toggleEditAddresses = () => {
    if (!editingAddresses) {
      setAddressForm({
        location: { ...(customer?.location || {}) },
        billAddr: { ...(customer?.billAddr || {}) },
      });
    }
    setEditingAddresses((prev) => !prev);
  };

  const handleAddressChange = (type, field, value) => {
    setAddressForm((prev) => ({
      ...prev,
      [type]: { ...prev[type], [field]: value, country: "USA" },
    }));
  };

  const saveAddresses = async () => {
    if (!customer?._id) return;
    setSavingAddresses(true);
    try {
      const { data } = await axios.put(
        `/api/customer/${customer._id}/updateAddresses`,
        {
          customer: {
            location: addressForm.location,
            billAddr: addressForm.billAddr,
          },
        },
      );
      setCustomer((prev) => ({ ...prev, ...(data?.customer || {}) }));
      setEditingAddresses(false);
      toast.success("Addresses updated successfully");
    } catch (error) {
      toast.error(getError(error));
    } finally {
      setSavingAddresses(false);
    }
  };

  const {
    handleSubmit,
    register,
    getValues,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  // Prefill ONLY when there is session.user
  useEffect(() => {
    if (!session?.user) return;
    setValue("lastName", session.user.lastName || "");
    setValue("firstName", session.user.firstName || "");
    setValue("email", session.user.email || "");
    setValue("companyName", session.user.companyName || "");
    setValue("companyEinCode", session.user.companyEinCode || "");
  }, [session?.user, setValue]);

  const [showModifyForm, setShowModifyForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = useCallback(
    () => setShowPassword((p) => !p),
    [],
  );
  const toggleModifyForm = useCallback(() => setShowModifyForm((p) => !p), []);

  const submitHandler = async ({ firstName, lastName, email, password }) => {
    try {
      await axios.put("/api/auth/update", {
        firstName,
        lastName,
        email,
        password,
      });

      // Reauthenticate to refresh the session
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (!result?.error) {
        toggleModifyForm();
        toast.success("Profile updated successfully");
        reset({ firstName, lastName, email, password: "" });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(
        "We are not able to find your Company's EIN Code, please register again with your Company's complete information",
      );
      toast.error(getError(error));
    }
  };

  // Simple loading render
  if (isLoading) {
    return (
      <Layout title='Profile'>
        <div className='mx-auto max-w-screen-md p-6'>
          <div className='animate-pulse space-y-4'>
            <div className='h-8 w-1/3 bg-gray-200 rounded' />
            <div className='h-24 w-full bg-gray-100 rounded' />
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthed) {
    return (
      <Layout title='Profile'>
        <div className='mx-auto max-w-screen-md p-6 text-center'>
          <p className='mb-4 text-gray-600'>You need to be signed in.</p>
          <Link
            href='/Login'
            className='inline-block rounded-full border border-[#0e355e] px-4 py-2 font-medium text-[#0e355e] hover:bg-[#0e355e] hover:text-white transition'
          >
            Go to Login
          </Link>
        </div>
      </Layout>
    );
  }

  const user = session.user;
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "Your Profile";
  const localeBadge = user?.locale ? user.locale : null;
  const avatar = user?.picture || "/img/default-avatar.png"; // put a placeholder in public/img if you want

  return (
    <Layout title='Profile'>
      {/* Header with Avatar + Name + Email + Location */}
      <section className='max-w-screen-md mx-auto bg-white p-8 rounded-3xl shadow-lg mb-8 transition-all hover:shadow-xl'>
        <div className='flex items-center gap-6'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatar}
            alt={fullName}
            referrerPolicy='no-referrer'
            className='h-20 w-20 rounded-full border-4 border-[#0e355e]/10 object-cover shadow-sm'
          />
          <div className='flex-1'>
            <h1 className='text-2xl font-semibold text-[#0e355e] tracking-tight'>
              {fullName}
            </h1>
            <p className='text-sm text-gray-500'>{user?.email}</p>
            {localeBadge && (
              <span className='mt-2 inline-block bg-[#f4f6f8] border border-gray-200 px-3 py-1 rounded-full text-xs text-gray-600'>
                🌍 Locale: {localeBadge}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Account info */}
      <section className='max-w-screen-md mx-auto bg-white p-8 rounded-3xl shadow-lg'>
        <h2 className='text-2xl font-semibold text-[#0e355e] text-center mb-8'>
          Profile Information
        </h2>

        <div className='grid md:grid-cols-2 gap-8 text-[#414b53]'>
          {[
            ["First Name", user?.firstName],
            ["Last Name", user?.lastName],
            ["Email", user?.email],
            ["Company Name", user?.companyName],
            ["Company EIN", user?.companyEinCode],
            ["Phone Number", user?.phoneNumber],
          ].map(([label, value]) => (
            <div key={label}>
              <p className='text-sm font-medium text-gray-500 mb-1'>{label}</p>
              <p className='text-base font-semibold text-gray-800 bg-gray-50 rounded-xl px-4 py-2 border border-gray-100'>
                {value || "-"}
              </p>
            </div>
          ))}
        </div>

        <div className='mt-8 text-center'>
          {isActive ?
            <Link
              href='/order-history'
              className='inline-block text-[#0e355e] font-medium border border-[#0e355e] px-6 py-2.5 rounded-full hover:bg-[#0e355e] hover:text-white transition-all duration-300'
            >
              View Order History
            </Link>
          : <p className='text-gray-500 text-sm italic'>
              Your account is pending approval or inactive.
            </p>
          }
        </div>
      </section>

      {/* Company & Addresses */}
      <section className='max-w-screen-md mx-auto bg-white p-8 rounded-3xl shadow-lg mt-8'>
        <div className='flex items-center justify-between mb-8'>
          <h2 className='text-2xl font-semibold text-[#0e355e]'>
            Company & Addresses
          </h2>
          {customer?._id && (
            <button
              type='button'
              onClick={toggleEditAddresses}
              className='text-sm font-medium text-[#0e355e] underline underline-offset-2 hover:text-[#144e8b]'
            >
              {editingAddresses ? "Cancel" : "Edit Addresses"}
            </button>
          )}
        </div>

        <div className='grid md:grid-cols-2 gap-8 text-[#414b53] mb-8'>
          {[
            ["Company Name", customer?.companyName],
            ["Company Phone", formatPhoneNumber(customer?.phone)],
            ["Company Email", customer?.email],
            ["Account Terms", customer?.defaultTerm],
          ].map(([label, value]) => (
            <div key={label}>
              <p className='text-sm font-medium text-gray-500 mb-1'>{label}</p>
              <p className='text-base font-semibold text-gray-800 bg-gray-50 rounded-xl px-4 py-2 border border-gray-100'>
                {value || "-"}
              </p>
            </div>
          ))}
        </div>

        {editingAddresses ?
          <div className='space-y-6'>
            <div className='grid md:grid-cols-2 gap-6'>
              <AddressFormCard
                title='Shipping Address'
                type='location'
                value={addressForm.location}
                onChange={handleAddressChange}
              />
              <AddressFormCard
                title='Billing Address'
                type='billAddr'
                value={addressForm.billAddr}
                onChange={handleAddressChange}
              />
            </div>
            <div className='text-center pt-2'>
              <button
                type='button'
                disabled={savingAddresses}
                onClick={saveAddresses}
                className='bg-[#0e355e] text-white px-8 py-2.5 rounded-full hover:bg-[#22517e] transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {savingAddresses ? "Saving..." : "Save Addresses"}
              </button>
            </div>
          </div>
        : <div className='grid md:grid-cols-2 gap-6'>
            <AddressSummaryCard title='Shipping Address' address={customer?.location} />
            <AddressSummaryCard title='Billing Address' address={customer?.billAddr} />
          </div>
        }
      </section>

      {/* Tax Exemption */}
      {customer?._id && (
        <section className='max-w-screen-md mx-auto mt-8'>
          <ExemptionFileUploader
            customer={customer}
            setCustomer={setCustomer}
            user={wpUser}
            allowReupload
          />
        </section>
      )}

      {/* Update Form */}
      {showModifyForm ?
        <div className='mx-auto max-w-screen-md bg-white p-8 rounded-3xl shadow-lg my-10'>
          <form onSubmit={handleSubmit(submitHandler)} className='space-y-6'>
            <h3 className='text-2xl font-semibold text-[#0e355e] text-center mb-8'>
              Update Profile
            </h3>

            {[
              ["firstName", "First Name", "text"],
              ["lastName", "Last Name", "text"],
              ["email", "Email", "email"],
            ].map(([id, label, type]) => (
              <div key={id}>
                <label
                  className='block mb-1 text-sm font-semibold text-gray-600'
                  htmlFor={id}
                >
                  {label} *
                </label>
                <input
                  autoComplete='off'
                  type={type}
                  id={id}
                  className='w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#144e8b] shadow-sm'
                  {...register(id, {
                    required: `Please enter ${label.toLowerCase()}`,
                  })}
                />
                {errors[id] && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors[id].message}
                  </p>
                )}
              </div>
            ))}

            {/* Password fields */}
            {["password", "confirmPassword"].map((id, i) => (
              <div key={id}>
                <label
                  className='block mb-1 text-sm font-semibold text-gray-600'
                  htmlFor={id}
                >
                  {i === 0 ? "New Password *" : "Confirm New Password *"}
                </label>
                <div className='relative'>
                  <input
                    autoComplete='off'
                    id={id}
                    type={showPassword ? "text" : "password"}
                    placeholder={i === 0 ? "Password" : "Confirm Password"}
                    className='w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#144e8b] shadow-sm'
                    {...register(id, {
                      required: `Please enter ${
                        i === 0 ? "a password" : "confirm password"
                      }`,
                      validate: (value) =>
                        i === 0 ?
                          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/.test(
                            value,
                          ) ||
                          "Password must contain uppercase, lowercase, number and symbol."
                        : value === getValues("password") ||
                          "Passwords do not match",
                      minLength: {
                        value: 8,
                        message: "Must be at least 8 characters",
                      },
                    })}
                  />
                  <button
                    type='button'
                    onClick={(e) => {
                      e.preventDefault();
                      togglePasswordVisibility();
                    }}
                    className='absolute inset-y-0 right-3 flex items-center text-gray-500'
                  >
                    {showPassword ?
                      <RiEyeCloseLine />
                    : <RiEye2Line />}
                  </button>
                </div>
                {errors[id] && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors[id].message}
                  </p>
                )}
              </div>
            ))}

            <div className='text-center pt-2'>
              <button
                type='submit'
                className='bg-[#0e355e] text-white px-8 py-2.5 rounded-full hover:bg-[#22517e] transition-all duration-300 shadow-sm hover:shadow-md'
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>
      : <div className='text-center my-10'>
          <button
            onClick={toggleModifyForm}
            className='bg-[#0e355e] text-white px-8 py-2.5 rounded-full hover:bg-[#788b9b] transition-all duration-300 shadow-sm hover:shadow-md'
          >
            Update Profile or Change Password
          </button>
        </div>
      }
    </Layout>
  );
}

ProfileScreen.auth = true;
