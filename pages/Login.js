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
    formState: { errors },
  } = useForm();

  const emailValue = watch("email", ""); // <-- grab email from the form

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  useEffect(() => {
    if (session?.user) {
      router.push(redirect || "/");
    }
  }, [session, redirect, router]);

  const submitHandler = async ({ email, password }) => {
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
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

  return (
    <Layout title='Login'>
      <form className='mx-2 pr-5' onSubmit={handleSubmit(submitHandler)}>
        <h1 className='mb-1 text-xl font-bold'>Login</h1>

        {/* Email */}
        <div className='mb-4'>
          <label
            htmlFor='email'
            className='block mb-2 text-sm font-bold text-gray-700'
          >
            Email
          </label>
          <input
            id='email'
            type='email'
            autoComplete='off'
            placeholder='Email'
            {...register("email", {
              required: "Please enter email",
              pattern: {
                value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i,
                message: "Invalid email",
              },
            })}
            className='w-full px-3 py-2 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
          />
          {errors.email && (
            <p className='text-red-500 text-sm mt-1'>{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className='mb-4'>
          <label
            htmlFor='password'
            className='block mb-2 text-sm font-bold text-gray-700'
          >
            Password
          </label>
          <div className='relative'>
            <input
              id='password'
              type={showPassword ? "text" : "password"}
              placeholder='Password'
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
              className='w-full px-3 py-2 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
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
            <p className='text-red-500 text-sm mt-1'>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <div className='mb-4'>
          <button className='primary-button w-full' type='submit'>
            Login
          </button>
        </div>

        {/* Register Link */}
        <div className='mb-4'>
          Don&apos;t have an account?{" "}
          <Link
            href='/register'
            className='font-bold underline active:text-[#144e8b]'
          >
            Register
          </Link>
        </div>

        {/* Forgot Password Link */}
        <div className='mb-4'>
          <Link
            href={`/recoverAccess?email=${encodeURIComponent(emailValue)}`}
            className='font-bold underline active:text-[#144e8b]'
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
