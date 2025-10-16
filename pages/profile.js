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
      <section className='max-w-screen-md mx-auto bg-white p-6 rounded-2xl shadow-md mb-6'>
        <div className='flex items-center gap-4'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatar}
            alt={fullName}
            referrerPolicy='no-referrer'
            className='h-16 w-16 rounded-full border object-cover'
          />
          <div className='flex-1'>
            <h1 className='text-2xl font-bold text-[#0e355e]'>{fullName}</h1>
            <p className='text-sm text-gray-600'>{user?.email}</p>
            {localeBadge && (
              <span className='mt-2 inline-block rounded-full border px-2 py-0.5 text-xs text-gray-600'>
                Locale: {localeBadge}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Account info */}
      <section className='profile-info max-w-screen-md mx-auto bg-white p-6 rounded-2xl shadow-md'>
        <h2 className='text-xl font-semibold text-[#0e355e] text-center mb-6'>
          Profile Information
        </h2>

        <div className='grid md:grid-cols-2 gap-6 text-[#414b53]'>
          <div>
            <p className='text-sm font-semibold text-gray-500'>First Name</p>
            <p className='text-base'>{user?.firstName || "-"}</p>
          </div>
          <div>
            <p className='text-sm font-semibold text-gray-500'>Last Name</p>
            <p className='text-base'>{user?.lastName || "-"}</p>
          </div>
          <div>
            <p className='text-sm font-semibold text-gray-500'>Email</p>
            <p className='text-base break-all'>{user?.email || "-"}</p>
          </div>
          <div>
            <p className='text-sm font-semibold text-gray-500'>Company Name</p>
            <p className='text-base'>{user?.companyName || "-"}</p>
          </div>
          <div>
            <p className='text-sm font-semibold text-gray-500'>Company EIN</p>
            <p className='text-base'>{user?.companyEinCode || "-"}</p>
          </div>
        </div>

        <div className='mt-6 text-center'>
          {isActive ? (
            <Link
              href='/order-history'
              className='inline-block text-[#0e355e] font-medium border border-[#0e355e] px-4 py-2 rounded-full hover:bg-[#0e355e] hover:text-white transition'
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
      {showModifyForm ? (
        <div className='mx-auto max-w-screen-md bg-white p-6 rounded-2xl shadow-md my-9'>
          <form onSubmit={handleSubmit(submitHandler)}>
            <div className='text-2xl font-bold text-[#0e355e] text-center mb-6'>
              Update Profile
            </div>

            <div className='mb-4'>
              <label
                className='block mb-1 text-sm font-semibold text-gray-600'
                htmlFor='firstName'
              >
                First Name *
              </label>
              <input
                autoComplete='off'
                type='text'
                id='firstName'
                className='w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#144e8b]'
                {...register("firstName", {
                  required: "Please enter first Name",
                })}
              />
              {errors.firstName && (
                <p className='text-red-500 text-sm'>
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className='mb-4'>
              <label
                className='block mb-1 text-sm font-semibold text-gray-600'
                htmlFor='lastName'
              >
                Last Name *
              </label>
              <input
                autoComplete='off'
                type='text'
                id='lastName'
                className='w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#144e8b]'
                {...register("lastName", {
                  required: "Please enter lastName",
                })}
              />
              {errors.lastName && (
                <p className='text-red-500 text-sm'>
                  {errors.lastName.message}
                </p>
              )}
            </div>
            <div className='mb-4'>
              <label
                className='block mb-1 text-sm font-semibold text-gray-600'
                htmlFor='email'
              >
                Email *
              </label>
              <input
                autoComplete='off'
                type='email'
                id='email'
                className='w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#144e8b]'
                {...register("email", {
                  required: "Please enter email",
                  pattern: {
                    value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i,
                    message: "Please enter valid email",
                  },
                })}
              />
              {errors.email && (
                <p className='text-red-500 text-sm'>{errors.email.message}</p>
              )}
            </div>
            <div className='mb-4'>
              <label
                className='block mb-1 text-sm font-semibold text-gray-600'
                htmlFor='password'
              >
                New Password *
              </label>
              <div className='relative'>
                <input
                  autoComplete='off'
                  className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
                  id='password'
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Please enter a password",
                    minLength: {
                      value: 8,
                      message: "Password must have at least 8 characters",
                    },
                    validate: (value) =>
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/.test(
                        value
                      ) ||
                      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
                  })}
                  placeholder='Password'
                />
                <button
                  type='button'
                  onClick={(e) => {
                    e.preventDefault();
                    togglePasswordVisibility();
                  }}
                  className='absolute inset-y-0 right-0 px-3 py-2 text-gray-700'
                >
                  {showPassword ? <RiEyeCloseLine /> : <RiEye2Line />}
                </button>
              </div>
              {errors.password && (
                <p className='text-red-500 text-sm'>
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className='mb-6'>
              <label
                className='block mb-1 text-sm font-semibold text-gray-600'
                htmlFor='confirmPassword'
              >
                Confirm New Password *
              </label>
              <div className='relative'>
                <input
                  autoComplete='off'
                  type={showPassword ? "text" : "password"}
                  className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
                  id='confirmPassword'
                  placeholder='Confirm Password'
                  {...register("confirmPassword", {
                    required: "Please enter confirm password",
                    validate: (value) =>
                      value === getValues("password") ||
                      "Passwords do not match",
                    minLength: {
                      value: 8,
                      message: "Confirm password must be at least 8 characters",
                    },
                  })}
                />
                <button
                  type='button'
                  onClick={(e) => {
                    e.preventDefault();
                    togglePasswordVisibility();
                  }}
                  className='absolute inset-y-0 right-0 px-3 py-2 text-gray-700'
                >
                  {showPassword ? <RiEyeCloseLine /> : <RiEye2Line />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className='text-red-500 text-sm'>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className='text-center'>
              <button
                type='submit'
                className='bg-[#0e355e] text-white px-6 py-2 rounded-full hover:bg-[#22517e] transition'
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className='text-center mt-6 my-9'>
          <button
            onClick={toggleModifyForm}
            className='bg-[#0e355e] text-white px-6 py-2 rounded-full hover:bg-[#788b9b] transition'
          >
            Update Profile or Change Password
          </button>
        </div>
      )}
    </Layout>
  );
}

ProfileScreen.auth = true;
