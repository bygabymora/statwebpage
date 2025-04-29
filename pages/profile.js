import React, { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { getError } from "../utils/error";
import axios from "axios";
import Layout from "../components/main/Layout";
import Link from "next/link";

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
    setValue("name", session.user.name);
    setValue("email", session.user.email);
    setValue("companyName", session.user.companyName);
    setValue("companyEinCode", session.user.companyEinCode);
    console.log("companyEinCode:", session.user.companyEinCode);
    console.log("name:", session.user.name);
  }, [session.user, setValue]);

  const [showModifyForm, setShowModifyForm] = useState(false);

  const toggleModifyForm = () => {
    setShowModifyForm((prevShowModifyForm) => !prevShowModifyForm);
  };

  const submitHandler = async ({ name, email, password }) => {
    try {
      await axios.put("/api/auth/update", {
        name,
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
        reset({ name, email, password: "" });
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error(
        "We are not able to find your Company's EIN Code, please register again with your Company's complete information"
      );
      toast.error(getError(err));
    }
  };

  return (
    <Layout title='Profile'>
      <section className='profile-info mb-10 max-w-screen-md mx-auto bg-white p-6 rounded-2xl shadow-md'>
        <h1 className='text-2xl font-bold text-[#144e8b] text-center mb-6'>
          {session.user.name} Profile Information
        </h1>
        <div className='grid md:grid-cols-2 gap-6 text-[#414b53]'>
          <div>
            <p className='text-sm font-semibold text-gray-500'>Full Name</p>
            <p className='text-base'>{session.user.name}</p>
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
                className='inline-block text-[#144e8b] font-medium border border-[#144e8b] px-4 py-2 rounded-full hover:bg-[#144e8b] hover:text-white transition'
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
            <div className='text-2xl font-bold text-[#144e8b] text-center mb-6'>
              Update Profile
            </div>
            <div className='mb-4'>
              <label
                className='block mb-1 text-sm font-semibold text-gray-600'
                htmlFor='name'
              >
                Full Name *
              </label>
              <input
                type='text'
                id='name'
                className='w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#144e8b]'
                {...register("name", { required: "Please enter name" })}
              />
              {errors.name && (
                <p className='text-red-500 text-sm'>{errors.name.message}</p>
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
              <input
                type='password'
                id='password'
                className='w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#144e8b]'
                {...register("password", {
                  required: "Please enter new password",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
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
              <input
                type='password'
                id='confirmPassword'
                className='w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#144e8b]'
                {...register("confirmPassword", {
                  required: "Please confirm new password",
                  validate: (value) => value === getValues("password"),
                  minLength: {
                    value: 6,
                    message: "Confirm password must be at least 6 characters",
                  },
                })}
              />
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
            Modify Profile
          </button>
        </div>
      )}
    </Layout>
  );
}

ProfileScreen.auth = true;
