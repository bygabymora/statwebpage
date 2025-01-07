import React, { useEffect, useState } from "react";
import Layout from '../components/main/Layout';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { signIn } from 'next-auth/react';
import { toast } from 'react-toastify';
import { getError } from '../utils/error';
import { useSession } from 'next-auth/react';
import { RiEye2Line, RiEyeCloseLine } from "react-icons/ri";
import { useRouter } from 'next/router';

export default function Login() {
  const { data: session } = useSession();
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const { redirect } = router.query;

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  useEffect(() => {
    if (session?.user) {
      router.push(redirect || '/');
    }
  }, [router, session, redirect]);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  const submitHandler = async ({ email, password }) => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      if (result.error) {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error(getError(err));
    }
  };

  return (
    <Layout title="Login">
      <form className="mx-2 pr-5" onSubmit={handleSubmit(submitHandler)}>
        <h1 className="mb-1 text-xl font-bold">Login</h1>
        <div className="mb-4">
          <label
            className="block mb-2 text-sm font-bold text-gray-700"
            htmlFor="email"
          >
            Email
          </label>
          <input
            className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
            autoFocus
            id="email"
            type="email"
            {...register('email', {
              required: 'Please enter email',
              pattern: {
                value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i,
                message: 'Invalid email',
              },
            })}
            placeholder="Email"
          ></input>
          {errors.email && (
            <div className="text-blue-950">{errors.email.message}</div>
          )}
        </div>
        <div className="mb-4">
          <label
            className="block mb-2 text-sm font-bold text-gray-700"
            htmlFor="password"
          >
            Password
          </label>
          <div className="relative">
            <input
              className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
              autoFocus
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password", {
                required: "Please enter a password",
                minLength: {
                  value: 8,
                  message: "Password must have at least 8 characters",
                },
                validate: (value) =>
                  /^(?=.*[a-z])(?=.*[A-Z])[A-Za-z\d@$!%*?&]+$/.test(value) ||
                  "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
              })}
              placeholder="Password"
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault(), togglePasswordVisibility();
              }}
              className="absolute inset-y-0 right-0 px-3 py-2 text-gray-700"
            >
              {showPassword ? <RiEyeCloseLine /> : <RiEye2Line />}
            </button>
          </div>
          {errors.password && (
            <div className="text-blue-950">{errors.password.message}</div>
          )}
        </div>
        <div className="mb-4">
          <button className="primary-button" type="submit">
            Login
          </button>
        </div>
        <div className="mb-4">
          Don&apos;t have an account? &nbsp;
          <Link
            href="/Register"
            className="font-bold underline active:text-gray-700"
          >
            Register
          </Link>
        </div>
      </form>
    </Layout>
  );
}
