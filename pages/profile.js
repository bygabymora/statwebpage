import React, { useEffect, useState, useCallback } from "react";
import { signIn, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { getError } from "../utils/error";
import axios from "axios";
import Layout from "../components/main/Layout";
import Link from "next/link";
import { RiEye2Line, RiEyeCloseLine } from "react-icons/ri";

export default function ProfileScreen() {
  const { data: session, status } = useSession();

  // status: 'loading' | 'authenticated' | 'unauthenticated'
  const isLoading = status === "loading";
  const isAuthed = status === "authenticated" && !!session?.user;
  const isActive =
    !!session?.user?.active && !!session?.user?.approved && isAuthed;

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
    []
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
        "We are not able to find your Company's EIN Code, please register again with your Company's complete information"
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
          {isActive ? (
            <Link
              href='/order-history'
              className='inline-block text-[#0e355e] font-medium border border-[#0e355e] px-6 py-2.5 rounded-full hover:bg-[#0e355e] hover:text-white transition-all duration-300'
            >
              View Order History
            </Link>
          ) : (
            <p className='text-gray-500 text-sm italic'>
              Your account is pending approval or inactive.
            </p>
          )}
        </div>
      </section>

      {/* Update Form */}
      {showModifyForm ? (
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
                        i === 0
                          ? /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/.test(
                              value
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
                    {showPassword ? <RiEyeCloseLine /> : <RiEye2Line />}
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
      ) : (
        <div className='text-center my-10'>
          <button
            onClick={toggleModifyForm}
            className='bg-[#0e355e] text-white px-8 py-2.5 rounded-full hover:bg-[#788b9b] transition-all duration-300 shadow-sm hover:shadow-md'
          >
            Update Profile or Change Password
          </button>
        </div>
      )}
    </Layout>
  );
}

ProfileScreen.auth = true;
