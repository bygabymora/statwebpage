import React, { useEffect, useState } from "react";
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
  const active =
    session?.user?.active &&
    session?.user?.approved &&
    status === "authenticated";
  const {
    handleSubmit,
    register,
    getValues,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    console.log("Session data:", session);
    setValue("lastName", session.user.lastName);
    setValue("firstName", session.user.firstName);
    setValue("email", session.user.email);
    setValue("companyName", session.user.companyName);
    setValue("companyEinCode", session.user.companyEinCode);
  }, [session.user, setValue]);

  const [showModifyForm, setShowModifyForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };
  const toggleModifyForm = () => {
    setShowModifyForm((prevShowModifyForm) => !prevShowModifyForm);
  };

  const submitHandler = async ({ firstName, lastName, email, password }) => {
    try {
      await axios.put("/api/auth/update", {
        firstName,
        lastName,
        email,
        password,
      });
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      if (!result.error) {
        // Toggle the form only if there's no error
        toggleModifyForm();
        toast.success("Profile updated successfully");
        // Optional: Reset the form with new values
        reset({ firstName, lastName, email, password: "" });
      } else {
        toast.error(result.error);
      }
      setShowModifyForm(false);
    } catch (error) {
      toast.error(
        "We are not able to find your Company's EIN Code, please register again with your Company's complete information"
      );
      toast.error(getError(error));
    }
  };

  return (
    <Layout title='Profile'>
      <section className='profile-info mb-10 max-w-screen-md mx-auto bg-white p-6 rounded-2xl shadow-md'>
        <h1 className='text-2xl font-bold text-[#0e355e] text-center mb-6'>
          {session.user.firstName} {session.user.lastName} Profile Information
        </h1>
        <div className='grid md:grid-cols-2 gap-6 text-[#414b53]'>
          <div>
            <p className='text-sm font-semibold text-gray-500'>Last Name</p>
            <p className='text-base'>{session?.user.lastName}</p>
          </div>
          <div>
            <p className='text-sm font-semibold text-gray-500'>First Name</p>
            <p className='text-base'>{session?.user.firstName}</p>
          </div>
          <div>
            <p className='text-sm font-semibold text-gray-500'>Email</p>
            <p className='text-base'>{session.user.email}</p>
          </div>
          <div>
            <p className='text-sm font-semibold text-gray-500'>Company Name</p>
            <p className='text-base'>{session.user.companyName}</p>
          </div>
          <div>
            <p className='text-sm font-semibold text-gray-500'>Company EIN</p>
            <p className='text-base'>{session.user.companyEinCode}</p>
          </div>
        </div>
        <div className='mt-6 text-center'>
          {active === "loading" ? (
            <p className='text-gray-400 italic'>Loading...</p>
          ) : (
            active && (
              <Link
                href='/order-history'
                className='inline-block text-[#0e355e] font-medium border border-[#0e355e] px-4 py-2 rounded-full hover:bg-[#0e355e] hover:text-white transition'
              >
                View Order History
              </Link>
            )
          )}
        </div>
      </section>

      {showModifyForm && (
        <div className='mx-auto max-w-screen-md bg-white p-6 rounded-2xl shadow-md my-9'>
          <form onSubmit={handleSubmit(submitHandler)}>
            <div className='text-2xl font-bold text-[#0e355e] text-center mb-6'>
              Update Profile
            </div>
            <div className='mb-4'>
              <label
                className='block mb-1 text-sm font-semibold text-gray-600'
                htmlFor='name'
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
                htmlFor='name'
              >
                Last Name *
              </label>
              <input
                autoComplete='off'
                type='text'
                id='lastName'
                className='w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#144e8b]'
                {...register("lastName", { required: "Please enter lastName" })}
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
                  autoFocus
                  id='password'
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Please enter a password",
                    minLength: {
                      value: 8,
                      message: "Password must have at least 8 characters",
                    },
                    validate: (value) =>
                      /^(?=.*[a-z])(?=.*[A-Z])[A-Za-z\d@$!%*?&]+$/.test(
                        value
                      ) ||
                      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
                  })}
                  placeholder='Password'
                />{" "}
                <button
                  type='button'
                  onClick={(e) => {
                    e.preventDefault(), togglePasswordVisibility();
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

            <div className='mb-4'>
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
                    validate: (value) => value === getValues("password"),
                    minLength: {
                      value: 8,
                      message: "Confirm password must be at least 8 characters",
                    },
                  })}
                />
                <button
                  type='button'
                  onClick={(e) => {
                    e.preventDefault(), togglePasswordVisibility();
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
              {errors.confirmPassword?.type === "validate" && (
                <p className='text-red-500 text-sm'>Passwords do not match</p>
              )}
            </div>

            <div className='text-center'>
              <button
                type='submit'
                className='bg-[#144e8b] text-white px-6 py-2 rounded-full hover:bg-[#0f3e6a] transition'
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {!showModifyForm && (
        <div className='text-center mt-6 my-9'>
          <button
            onClick={toggleModifyForm}
            className='bg-[#144e8b] text-white px-6 py-2 rounded-full hover:bg-[#788b9b] transition'
          >
            Update Profile or Change Password
          </button>
        </div>
      )}
    </Layout>
  );
}

ProfileScreen.auth = true;
