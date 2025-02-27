import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../components/main/Layout';
import { getError } from '../utils/error';
import { RiEye2Line, RiEyeCloseLine } from 'react-icons/ri';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function LoginScreen() {
  const { data: session } = useSession();

  const router = useRouter();
  const { redirect } = router.query;

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  useEffect(() => {
    if (session?.user) {
      router.push(redirect || '/');
    }
  }, [router, session, redirect]);

  const submitHandler = async ({ name, email, password, companyName, companyEinCode }) => {
    try {
      // Create the user with active and approved set to false by default
      await axios.post('/api/auth/signup', {
        name,
        email,
        password,
        companyName,
        companyEinCode,
        active: false, // These values ​​are added for security
        approved: false,
      });
  
      toast.success("Account created successfully. Please wait for approval.");
      router.push("/Login"); // Redirect to login without automatic login
    } catch (err) {
      toast.error(getError(err));
    }
  };
  return (
    <Layout title="Create Account">
      <form
        className="mx-auto max-w-screen-md"
        onSubmit={handleSubmit(submitHandler)}
      >
        <h1 className="mb-1 text-xl font-bold">Create Account</h1>
        <div className="mb-4">
          <label
            className="block mb-2 text-sm font-bold text-gray-700"
            htmlFor="name"
          >
            Full Name*
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
            id="name"
            autoFocus
            {...register('name', {
              required: 'Please enter name',
            })}
          />
          {errors.name && (
            <div className="text-red-500">{errors.name.message}</div>
          )}
        </div>

        <div className="mb-4">
          <label
            className="block mb-2 text-sm font-bold text-gray-700"
            htmlFor="email"
          >
            Email*
          </label>
          <input
            type="email"
            {...register('email', {
              required: 'Please enter email',
              pattern: {
                value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/i,
                message: 'Please enter valid email',
              },
            })}
            className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
            id="email"
          ></input>
          {errors.email && (
            <div className="text-red-500">{errors.email.message}</div>
          )}
        </div>
        <div className="mb-4">
          <label
            className="block mb-2 text-sm font-bold text-gray-700"
            htmlFor="companyName"
          >
            Company Name*
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
            id="companyName"
            autoFocus
            {...register('companyName', {
              required: 'Please enter company name',
            })}
          />
          {errors.companyName && (
            <div className="text-red-500">{errors.companyName.message}</div>
          )}
        </div>
        <div className="mb-4">
          <label
            className="block mb-2 text-sm font-bold text-gray-700"
            htmlFor="companyEinCode"
          >
            Company EIN*
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
            id="companyEinCode"
            autoFocus
            {...register('companyEinCode', {
              required: 'Please enter company name',
            })}
          />
          {errors.companyEinCode && (
            <div className="text-red-500">{errors.companyEinCode.message}</div>
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
              type={showPassword ? 'text' : 'password'}
              {...register('password', {
                required: 'Please enter password',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
                pattern: {
                  value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/,
                  message:
                    'Password must contain 1 lowercase, 1 uppercase, 1 number, and 1 special character',
                },
              })}
              className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
              id="password"
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
            <div className="text-red-500 ">{errors.password.message}</div>
          )}
        </div>
        <div className="mb-4">
          <label
            className="block mb-2 text-sm font-bold text-gray-700"
            htmlFor="confirmPassword"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
              id="confirmPassword"
              {...register('confirmPassword', {
                required: 'Please enter confirm password',
                validate: (value) => value === getValues('password'),
                minLength: {
                  value: 8,
                  message: 'Confirm password must be at least 8 characters',
                },
              })}
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
          {errors.confirmPassword && (
            <div className="text-red-500 ">
              {errors.confirmPassword.message}
            </div>
          )}
          {errors.confirmPassword &&
            errors.confirmPassword.type === 'validate' && (
              <div className="text-red-500 ">Passwords do not match</div>
            )}
        </div>
        
        <div className="mb-4">
          <input
            type="checkbox"
            className="border-gray-300 rounded-sm"
            id="terms"
            required
          />
          <label className=" mb-2 text-sm text-gray-700" htmlFor="terms">
            {' '}
            I understand that Stat Surgical Supply only sells to hospitals,
            surgery centers, physician offices, and companies in the medical
            device industry.{' '}
            <span className="font-bold">We do not sell to individuals.</span>
          </label>
        </div>
        <div className="mb-4 ">
          <button className="primary-button">Register</button>
        </div>
        <div className="mb-4 ">
          Already have an account? &nbsp;
          <Link
            href="/Login"
            className="font-bold underline active:text-[#144e8b]"
          >
            Login
          </Link>
        </div>
      </form>
    </Layout>
  );
}
