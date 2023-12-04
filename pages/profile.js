import React, { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { getError } from '../utils/error';
import axios from 'axios';
import Layout from '../components/Layout';
import Link from 'next/link';

export default function ProfileScreen() {
  const { data: session } = useSession();

  const {
    handleSubmit,
    register,
    getValues,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    setValue('name', session.user.name);
    setValue('email', session.user.email);
  }, [session.user, setValue]);

  const [showModifyForm, setShowModifyForm] = useState(false);

  const toggleModifyForm = () => {
    setShowModifyForm((prevShowModifyForm) => !prevShowModifyForm);
  };

  const submitHandler = async ({ name, email, password }) => {
    try {
      await axios.put('/api/auth/update', {
        name,
        email,
        password,
      });
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      toast.success('Profile updated successfully');
      if (result.error) {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error(getError(err));
    }
  };

  return (
    <Layout title="Profile">
      <h1 className="mb-4 text-xl ml-10">User Profile Information</h1>
      <div className="mb-4 ml-10">
        <p>
          <strong>Full Name:</strong>
          <div>{session.user.name}</div>
        </p>
        <p>
          <strong>Email:</strong>
          <div>{session.user.email}</div>
        </p>
        <p>
          <strong>Company Name:</strong>
          <div>{session.user.companyName}</div>
        </p>
        <p>
          <strong>Company EIN:</strong>
          <div>{session.user.companyEinCode}</div>
        </p>
        <Link href={'/order-history'} className="font-bold underline">
          Order History
        </Link>
      </div>
      <div
        className={`mx-auto max-w-screen-md ${
          showModifyForm ? 'block' : 'hidden'
        }`}
      >
        {/* Modify Profile Form */}
        <form onSubmit={handleSubmit(submitHandler)}>
          <h1 className="mb-4 text-xl">Update Profile</h1>
          <div className="my-4">
            <label
              className="block mb-2 text-sm font-bold text-gray-700"
              htmlFor="name"
            >
              Full Name
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
              Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
              id="email"
              {...register('email', {
                required: 'Please enter email',
                pattern: {
                  value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/i,
                  message: 'Please enter valid email',
                },
              })}
            />
            {errors.email && (
              <div className="text-red-500">{errors.email.message}</div>
            )}
          </div>

          <div className="mb-4">
            <label
              className="block mb-2 text-sm font-bold text-gray-700"
              htmlFor="password"
            >
              New Password
            </label>
            <input
              className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
              type="password"
              id="password"
              {...register('password', {
                required: 'Please enter new password',
                minLength: {
                  value: 6,
                  message: 'password is more than 5 chars',
                },
              })}
            />
            {errors.password && (
              <div className="text-red-500 ">{errors.password.message}</div>
            )}
          </div>

          <div className="mb-4">
            <label
              className="block mb-2 text-sm font-bold text-gray-700"
              htmlFor="confirmPassword"
            >
              Confirm New Password
            </label>
            <input
              className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
              type="password"
              id="confirmPassword"
              {...register('confirmPassword', {
                required: 'Please confirm new password',
                validate: (value) => value === getValues('password'),
                minLength: {
                  value: 6,
                  message: 'confirm password is more than 5 chars',
                },
              })}
            />
            {errors.confirmPassword && (
              <div className="text-red-500 ">
                {errors.confirmPassword.message}
              </div>
            )}
            {errors.confirmPassword &&
              errors.confirmPassword.type === 'validate' && (
                <div className="text-red-500 ">Password do not match</div>
              )}
          </div>
          <div className="mb-4">
            <button className="primary-button">Update Profile</button>
          </div>
        </form>
      </div>

      {/* Show Profile Information */}
      <div
        className={`mx-auto max-w-screen-md ${
          showModifyForm ? 'hidden' : 'block'
        }`}
      ></div>

      <div>
        {/* Show Modify Profile Button */}
        <button
          className={`primary-button ${
            showModifyForm ? 'hidden' : 'block'
          } mr-2`}
          onClick={toggleModifyForm}
        >
          Modify Profile
        </button>
      </div>
    </Layout>
  );
}

ProfileScreen.auth = true;
