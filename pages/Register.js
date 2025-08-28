import Link from "next/link";
import React, { useState, useEffect, useCallback } from "react";
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

export default function RegisterScreen() {
  const { data: session } = useSession();
  const router = useRouter();
  const { redirect } = router.query;
  const [showPassword, setShowPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState({ title: "", body: "" });
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  }, []);

  // If already logged in, redirect away
  useEffect(() => {
    if (session?.user) router.push(redirect || "/");
  }, [session?.user, redirect, router]);

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
      setSubmitting(true);

      // Create the user
      await axios.post("/api/auth/signup", {
        firstName,
        lastName,
        email,
        password,
        companyName,
        companyEinCode,
        active: true, // keep as you had it; set to false if you want manual activation
        approved: false,
      });

      // Non-blocking marketing event (only after success)
      try {
        window.gtag?.("event", "ads_conversion_Sign_Up_1", {
          register_attempt: true,
          userName: firstName,
        });
      } catch {
        /* no-op if gtag is not present */
      }

      setAlertMessage({
        title: "Your account has been created successfully!",
        body: "We are reviewing your information, you will receive a notification when your account is approved.",
      });
      setIsModalOpen(true);
      setShouldRedirect(true);

      const contactToEmail = { name: firstName, email };
      const emailmessage = messageManagement(contactToEmail, "Register");
      handleSendEmails(emailmessage, contactToEmail);
    } catch (err) {
      setAlertMessage({
        title: "Error",
        body: getError(err),
      });
      setIsModalOpen(true);
      setShouldRedirect(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalConfirm = () => {
    if (shouldRedirect) router.push("/Login");
    setIsModalOpen(false);
  };

  return (
    <Layout title='Create Account'>
      {/* No inline <script>; keep the page SSR-friendly and fast */}

      <form
        className='mx-auto max-w-screen-md md:text-lg'
        onSubmit={handleSubmit(submitHandler)}
        noValidate
      >
        <h1 className='mb-1 text-xl font-bold'>Create Account</h1>
        <div className='mb-4 grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* First name */}
          <div className='md:mb-4'>
            <label
              className='block md:text-lg text-sm font-bold'
              htmlFor='firstName'
            >
              First Name*
            </label>
            <input
              autoComplete='given-name'
              type='text'
              className='w-full px-3 py-2 leading-tight border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
              id='firstName'
              placeholder='First Name'
              autoFocus
              {...register("firstName", {
                required: "Please enter First Name",
              })}
              aria-invalid={!!errors.firstName}
            />
            {errors.firstName && (
              <div className='text-red-500'>{errors.firstName.message}</div>
            )}
          </div>

          {/* Last name */}
          <div className='md:mb-4'>
            <label
              className='block md:text-lg text-sm font-bold'
              htmlFor='lastName'
            >
              Last Name*
            </label>
            <input
              autoComplete='family-name'
              type='text'
              className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
              id='lastName'
              placeholder='Last Name'
              {...register("lastName", {
                required: "Please enter Last Name",
              })}
              aria-invalid={!!errors.lastName}
            />
            {errors.lastName && (
              <div className='text-red-500'>{errors.lastName.message}</div>
            )}
          </div>

          {/* Email */}
          <div className='md:mb-4 md:col-span-2'>
            <label
              className='block md:text-lg text-sm font-bold'
              htmlFor='email'
            >
              Email*
            </label>
            <input
              autoComplete='email'
              type='email'
              {...register("email", {
                required: "Please enter email",
                pattern: {
                  // escaped dot before TLD
                  value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i,
                  message: "Please enter valid email",
                },
              })}
              className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
              id='email'
              placeholder='Email'
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <div className='text-red-500'>{errors.email.message}</div>
            )}
          </div>
          {/* Company name */}
          <div className='md:mb-4'>
            <label
              className='block md:text-lg text-sm font-bold'
              htmlFor='companyName'
            >
              Company Name*
            </label>
            <input
              autoComplete='organization'
              type='text'
              className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
              id='companyName'
              placeholder='Company Name'
              {...register("companyName", {
                required: "Please enter company name",
              })}
              aria-invalid={!!errors.companyName}
            />
            {errors.companyName && (
              <div className='text-red-500'>{errors.companyName.message}</div>
            )}
          </div>
          {/* Company EIN */}
          <div className='md:mb-4'>
            <label
              className='block md:text-lg text-sm font-bold'
              htmlFor='companyEinCode'
            >
              Company EIN*
            </label>
            <input
              autoComplete='off'
              inputMode='numeric'
              type='text'
              className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
              id='companyEinCode'
              placeholder='Company EIN'
              {...register("companyEinCode", {
                required: "Please enter company EIN",
              })}
              aria-invalid={!!errors.companyEinCode}
            />
            {errors.companyEinCode && (
              <div className='text-red-500'>
                {errors.companyEinCode.message}
              </div>
            )}
          </div>
          {/* Password */}
          <div className='md:mb-4'>
            <label
              className='block md:text-lg text-sm font-bold'
              htmlFor='password'
            >
              Password*
            </label>
            <div className='relative'>
              <input
                autoComplete='new-password'
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
                aria-invalid={!!errors.password}
              />
              <button
                type='button'
                onClick={(e) => {
                  e.preventDefault();
                  togglePasswordVisibility();
                }}
                aria-pressed={showPassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className='absolute inset-y-0 right-0 px-3 py-2 text-gray-700'
              >
                {showPassword ? <RiEyeCloseLine /> : <RiEye2Line />}
              </button>
            </div>
            {errors.password && (
              <div className='text-red-500'>{errors.password.message}</div>
            )}
          </div>
          {/* Confirm password */}
          <div className='md:mb-4'>
            <label
              className='block md:text-lg text-sm font-bold'
              htmlFor='confirmPassword'
            >
              Confirm Password*
            </label>
            <div className='relative'>
              <input
                autoComplete='new-password'
                type={showPassword ? "text" : "password"}
                className='w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline'
                id='confirmPassword'
                placeholder='Confirm Password'
                {...register("confirmPassword", {
                  required: "Please enter confirm password",
                  validate: (value) =>
                    value === getValues("password") || "Passwords do not match",
                  minLength: {
                    value: 8,
                    message: "Confirm password must be at least 8 characters",
                  },
                })}
                aria-invalid={!!errors.confirmPassword}
              />
              <button
                type='button'
                onClick={(e) => {
                  e.preventDefault();
                  togglePasswordVisibility();
                }}
                aria-pressed={showPassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className='absolute inset-y-0 right-0 px-3 py-2 text-gray-700'
              >
                {showPassword ? <RiEyeCloseLine /> : <RiEye2Line />}
              </button>
            </div>
            {errors.confirmPassword && (
              <div className='text-red-500'>
                {errors.confirmPassword.message}
              </div>
            )}
          </div>
        </div>
        {/* Terms */}
        <div className='mb-4'>
          <input
            type='checkbox'
            className='border-gray-300 rounded-sm'
            id='terms'
            required
            aria-required='true'
            name='terms'
          />
          <label
            className='mb-4 md:text-lg text-sm text-gray-700 ml-2'
            htmlFor='terms'
          >
            {" "}
            I understand that Stat Surgical Supply only sells to hospitals,
            surgery centers, physician offices, and companies in the medical
            device industry.{" "}
            <span className='font-bold'>We do not sell to individuals.</span>
          </label>
        </div>

        {/* Actions */}
        <div className='mb-4'>
          <button
            className='primary-button'
            type='submit'
            disabled={submitting}
          >
            {submitting ? "Registering..." : "Register"}
          </button>
        </div>
        <div className='mb-4'>
          Already have an account?&nbsp;
          <Link
            href='/Login'
            className='font-bold underline active:text-[#0e355e]'
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
