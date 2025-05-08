import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import Layout from "../components/main/Layout";
import { getError } from "../utils/error";
import { RiEye2Line, RiEyeCloseLine } from "react-icons/ri";
import { useRouter } from "next/router";
import axios from "axios";
import CustomAlertModal from "../components/main/CustomAlertModal";
import { messageManagement } from "../utils/alertSystem/customers/messageManagement";
import handleSendEmails from "../utils/alertSystem/documentRelatedEmail";

export default function LoginScreen() {
  const { data: session } = useSession();

  const router = useRouter();
  const { redirect } = router.query;

  const [showPassword, setShowPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState({ title: "", body: "" });
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  useEffect(() => {
    if (session?.user) {
      router.push(redirect || "/");
    }
  }, [router, session, redirect]);

  const {
    handleSubmit,
    register,
    getValues,
    formState: { errors },
  } = useForm();

  const submitHandler = async ({
    firstName,
    lastName,
    email,
    password,
    companyName,
    companyEinCode,
  }) => {
    try {
      // Create the user with active and approved set to false by default
      await axios.post("/api/auth/signup", {
        firstName,
        lastName,
        email,
        password,
        companyName,
        companyEinCode,
        active: true,
        approved: false,
      });

      setAlertMessage({
        title: "Your account has been created successfully!",
        body: "We are reviewing your information, you will receive a notification when your account is approved.",
      });
      setIsModalOpen(true);
      setShouldRedirect(true);
      const contactToEmail = {
        name: firstName,
        email,
      };
      const emailmessage = messageManagement(contactToEmail, "Register");
      handleSendEmails(emailmessage, contactToEmail);
    } catch (err) {
      setAlertMessage({
        title: "Error",
        body: getError(err),
      });
      setIsModalOpen(true);
      setShouldRedirect(false);
    }
  };

  const handleModalConfirm = () => {
    if (shouldRedirect) {
      router.push("/Login");
    }
    setIsModalOpen(false);
  };

  return (
    <Layout title='Create Account'>
      <form
        className='mx-auto max-w-screen-md'
        onSubmit={handleSubmit(submitHandler)}
      >
        <h1 className='mb-1 text-xl font-bold'>Create Account</h1>
        <div className='mb-4'>
          <label
            className='block mb-2 text-sm font-bold text-gray-700'
            htmlFor='name'
          >
            First Name*
          </label>
          <input
            type='text'
            className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
            id='firstName'
            placeholder='First Name'
            autoFocus
            {...register("firstName", {
              required: "Please enter First Name",
            })}
          />
          {errors.firstName && (
            <div className='text-red-500'>{errors.firstName.message}</div>
          )}
        </div>

        <div className='mb-4'>
          <label
            className='block mb-2 text-sm font-bold text-gray-700'
            htmlFor='name'
          >
            Last Name*
          </label>
          <input
            type='text'
            className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
            id='lastName'
            placeholder='Last Name'
            autoFocus
            {...register("lastName", {
              required: "Please enter Last Name",
            })}
          />
          {errors.lastName && (
            <div className='text-red-500'>{errors.lastName.message}</div>
          )}
        </div>

        <div className='mb-4'>
          <label
            className='block mb-2 text-sm font-bold text-gray-700'
            htmlFor='email'
          >
            Email*
          </label>
          <input
            type='email'
            {...register("email", {
              required: "Please enter email",
              pattern: {
                value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/i,
                message: "Please enter valid email",
              },
            })}
            className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
            id='email'
            placeholder='Email'
          ></input>
          {errors.email && (
            <div className='text-red-500'>{errors.email.message}</div>
          )}
        </div>
        <div className='mb-4'>
          <label
            className='block mb-2 text-sm font-bold text-gray-700'
            htmlFor='companyName'
          >
            Company Name*
          </label>
          <input
            type='text'
            className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
            id='companyName'
            placeholder='Company Name'
            autoFocus
            {...register("companyName", {
              required: "Please enter company name",
            })}
          />
          {errors.companyName && (
            <div className='text-red-500'>{errors.companyName.message}</div>
          )}
        </div>
        <div className='mb-4'>
          <label
            className='block mb-2 text-sm font-bold text-gray-700'
            htmlFor='companyEinCode'
          >
            Company EIN*
          </label>
          <input
            type='text'
            className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
            id='companyEinCode'
            placeholder='Company EIN'
            autoFocus
            {...register("companyEinCode", {
              required: "Please enter company name",
            })}
          />
          {errors.companyEinCode && (
            <div className='text-red-500'>{errors.companyEinCode.message}</div>
          )}
        </div>
        <div className='mb-4'>
          <label
            className='block mb-2 text-sm font-bold text-gray-700'
            htmlFor='password'
          >
            Password
          </label>
          <div className='relative'>
            <input
              type={showPassword ? "text" : "password"}
              {...register("password", {
                required: "Please enter password",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
                pattern: {
                  value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/,
                  message:
                    "Password must contain 1 lowercase, 1 uppercase, 1 number, and 1 special character",
                },
              })}
              className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
              id='password'
              placeholder='Password'
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
          {errors.password && (
            <div className='text-red-500 '>{errors.password.message}</div>
          )}
        </div>
        <div className='mb-4'>
          <label
            className='block mb-2 text-sm font-bold text-gray-700'
            htmlFor='confirmPassword'
          >
            Confirm Password
          </label>
          <div className='relative'>
            <input
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
            <div className='text-red-500 '>
              {errors.confirmPassword.message}
            </div>
          )}
          {errors.confirmPassword &&
            errors.confirmPassword.type === "validate" && (
              <div className='text-red-500 '>Passwords do not match</div>
            )}
        </div>

        <div className='mb-4'>
          <input
            type='checkbox'
            className='border-gray-300 rounded-sm'
            id='terms'
            required
          />
          <label className=' mb-2 text-sm text-gray-700' htmlFor='terms'>
            {" "}
            I understand that Stat Surgical Supply only sells to hospitals,
            surgery centers, physician offices, and companies in the medical
            device industry.{" "}
            <span className='font-bold'>We do not sell to individuals.</span>
          </label>
        </div>
        <div className='mb-4 '>
          <button className='primary-button'>Register</button>
        </div>
        <div className='mb-4 '>
          Already have an account? &nbsp;
          <Link
            href='/Login'
            className='font-bold underline active:text-[#144e8b]'
          >
            Login
          </Link>
        </div>
      </form>
      <CustomAlertModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalConfirm}
        message={alertMessage}
      />
    </Layout>
  );
}
