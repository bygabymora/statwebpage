// pages/Login.js
import React, { useEffect, useState } from "react";
import Layout from "../components/main/Layout";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { toast } from "react-toastify";
import { getError } from "../utils/error";
import { useSession } from "next-auth/react";
import { RiEye2Line, RiEyeCloseLine } from "react-icons/ri";
import { useRouter } from "next/router";
import CustomAlertModal from "../components/main/CustomAlertModal";
import GoogleLoginButton from "../components/auth/GoogleLoginButton";
import { BsChevronRight } from "react-icons/bs";

export default function Login() {
  const { data: session } = useSession();
  const router = useRouter();
  const { redirect } = router.query;

  const [showPassword, setShowPassword] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState({
    title: "",
    body: "",
    warning: "",
  });

  // react-hook-form setup
  const {
    handleSubmit,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const emailValue = watch("email", ""); // always kept lowercased via setValueAs

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  useEffect(() => {
    if (session?.user) {
      router.push(redirect || "/");
    }
  }, [session, redirect, router]);

  const submitHandler = async ({ email, password }) => {
    // Double-safety: normalize before sending
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: normalizedEmail,
        password,
      });
      if (result.error) {
        if (
          result.error === "Your account is inactive. Please contact support."
        ) {
          setAlertMessage({
            title: "Account Inactive",
            body: "Your account is currently inactive.",
            warning: "Please contact support to reactivate your account.",
          });
          setIsAlertOpen(true);
        } else {
          toast.error(result.error);
        }
      }
    } catch (error) {
      toast.error(getError(error));
    }
  };

  const breadcrumbs = [{ href: "/", name: "Home" }, { name: "Login" }];

  return (
    <Layout title='Login'>
      <nav className='text-sm text-gray-700'>
        <ul className='flex ml-0 lg:ml-20 items-center space-x-2'>
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={index} className='flex items-center'>
              {breadcrumb.href ? (
                <Link
                  href={breadcrumb.href}
                  className='hover:underline text-[#0e355e]'
                >
                  {breadcrumb.name}
                </Link>
              ) : (
                <span>{breadcrumb.name}</span>
              )}
              {index < breadcrumbs.length - 1 && (
                <BsChevronRight className='mx-2 text-gray-500' />
              )}
            </li>
          ))}
        </ul>
      </nav>
      <form
        onSubmit={handleSubmit(submitHandler)}
        className='max-w-md mx-auto -mt-3 bg-white shadow-lg rounded-2xl p-8 border border-gray-100 my-5'
      >
        <h1 className='text-2xl font-bold text-[#0e355e] mb-6 text-center'>
          Welcome Back
        </h1>
        <p className='text-gray-500 text-center mb-8 text-sm'>
          Sign in to continue to your account
        </p>

        {/* Email */}
        <div className='mb-6'>
          <label
            htmlFor='email'
            className='block mb-2 text-sm font-semibold text-gray-700'
          >
            Email Address
          </label>
          <input
            id='email'
            type='email'
            autoComplete='off'
            placeholder='your@email.com'
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03793d]/40 focus:border-[#03793d] outline-none transition-all'
            {...register("email", {
              required: "Please enter email",
              pattern: {
                value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i,
                message: "Invalid email",
              },
              setValueAs: (v) =>
                typeof v === "string" ? v.trim().toLowerCase() : v,
            })}
            onBlur={(e) => {
              const next = (e.target.value || "").trim().toLowerCase();
              setValue("email", next, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
          />
          {errors.email && (
            <p className='text-red-500 text-xs mt-1'>{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className='mb-6'>
          <label
            htmlFor='password'
            className='block mb-2 text-sm font-semibold text-gray-700'
          >
            Password
          </label>
          <div className='relative'>
            <input
              id='password'
              type={showPassword ? "text" : "password"}
              placeholder='••••••••'
              autoComplete='off'
              {...register("password", {
                required: "Please enter a password",
                minLength: {
                  value: 8,
                  message: "Password must have at least 8 characters",
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
                  message:
                    "Must include uppercase, lowercase, number & special char",
                },
              })}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03793d]/40 focus:border-[#03793d] outline-none transition-all'
            />
            <button
              type='button'
              onClick={(e) => {
                e.preventDefault();
                togglePasswordVisibility();
              }}
              className='absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-[#03793d]'
            >
              {showPassword ? <RiEyeCloseLine /> : <RiEye2Line />}
            </button>
          </div>
          {errors.password && (
            <p className='text-red-500 text-xs mt-1'>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <div className='mb-6'>
          <button
            className='w-full py-2 bg-[#03793d] text-white font-semibold rounded-lg shadow hover:bg-[#026a35] transition-colors'
            type='submit'
          >
            Log In
          </button>
        </div>

        {/* Google Login */}
        <div className='mb-6'>
          <GoogleLoginButton callbackUrl='/' />
        </div>

        {/* Register & Forgot */}
        <div className='flex flex-col sm:flex-row justify-between text-sm text-gray-600 gap-2'>
          <div>
            Don’t have an account?{" "}
            <Link
              href='/Register'
              className='font-semibold text-[#03793d] hover:underline'
            >
              Register
            </Link>
          </div>
          <Link
            href={`/recoverAccess?email=${encodeURIComponent(emailValue)}`}
            className='font-semibold text-[#03793d] hover:underline'
          >
            Forgot Password?
          </Link>
        </div>
      </form>

      <CustomAlertModal
        isOpen={isAlertOpen}
        message={alertMessage}
        onConfirm={() => setIsAlertOpen(false)}
      />
    </Layout>
  );
}
