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
  // Query params to prefill (sent from NextAuth signIn callback)
  const {
    redirect,
    prefillEmail = "",
    prefillName = "",
    picture = "",
    from = "",
  } = router.query || {};
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
    setValue, // needed to prefill
    formState: { errors },
  } = useForm();

  // Prefill from query params (Google → name/email/picture)
  useEffect(() => {
    // Email
    if (typeof prefillEmail === "string" && prefillEmail) {
      const normalized = prefillEmail.trim().toLowerCase();
      setValue("email", normalized, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    // Name → separate first/last
    if (typeof prefillName === "string" && prefillName) {
      const parts = prefillName.trim().split(/\s+/);
      const first = parts[0] || "";
      const last = parts.slice(1).join(" ") || "";
      if (first)
        setValue("firstName", first, {
          shouldValidate: true,
          shouldDirty: true,
        });
      if (last)
        setValue("lastName", last, { shouldValidate: true, shouldDirty: true });
    }
  }, [prefillEmail, prefillName, setValue]);

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

      // Normalize email for security
      const normalizedEmail = (email || "").trim().toLowerCase();

      // Create the user
      await axios.post("/api/auth/signup", {
        firstName,
        lastName,
        email: normalizedEmail,
        password,
        companyName,
        companyEinCode,
        active: false,
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
      const contactToEmail = { name: firstName, email: normalizedEmail };
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
      {/* Contextual notice if coming from Google */}
      {from === "google" && (
        <div className='mx-auto max-w-md mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900 shadow-sm -mt-2'>
          We found your Google account. Please complete the missing fields to
          finish your registration.
        </div>
      )}

      <form
        onSubmit={handleSubmit(submitHandler)}
        noValidate
        className='max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100 my-5'
      >
        <h1 className='text-2xl font-bold text-[#0e355e] mb-2 text-center'>
          Create Account
        </h1>
        <p className='text-gray-500 text-center mb-8 text-sm'>
          Please fill in the fields below to register your organization.
        </p>

        {/* Avatar (if from Google) */}
        {picture && (
          <div className='flex items-center justify-center mb-6'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={String(picture)}
              alt='Google avatar'
              className='h-12 w-12 rounded-full border-2 border-[#03793d] shadow-sm'
              referrerPolicy='no-referrer'
            />
            <span className='ml-3 text-gray-600 text-sm'>
              Using your Google profile photo
            </span>
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          {/* First Name */}
          <div>
            <label
              htmlFor='firstName'
              className='block text-sm font-semibold text-gray-700 mb-2'
            >
              First Name*
            </label>
            <input
              id='firstName'
              type='text'
              autoComplete='given-name'
              placeholder='First Name'
              {...register("firstName", {
                required: "Please enter First Name",
              })}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03793d]/40 focus:border-[#03793d] outline-none transition-all'
            />
            {errors.firstName && (
              <p className='text-red-500 text-xs mt-1'>
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label
              htmlFor='lastName'
              className='block text-sm font-semibold text-gray-700 mb-2'
            >
              Last Name*
            </label>
            <input
              id='lastName'
              type='text'
              autoComplete='family-name'
              placeholder='Last Name'
              {...register("lastName", { required: "Please enter Last Name" })}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03793d]/40 focus:border-[#03793d] outline-none transition-all'
            />
            {errors.lastName && (
              <p className='text-red-500 text-xs mt-1'>
                {errors.lastName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className='md:col-span-2'>
            <label
              htmlFor='email'
              className='block text-sm font-semibold text-gray-700 mb-2'
            >
              Email*
            </label>
            <input
              id='email'
              type='email'
              autoComplete='email'
              placeholder='your@email.com'
              {...register("email", {
                required: "Please enter email",
                pattern: {
                  value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i,
                  message: "Please enter valid email",
                },
                setValueAs: (v) =>
                  typeof v === "string" ? v.trim().toLowerCase() : v,
              })}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03793d]/40 focus:border-[#03793d] outline-none transition-all'
            />
            {errors.email && (
              <p className='text-red-500 text-xs mt-1'>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Company Name */}
          <div>
            <label
              htmlFor='companyName'
              className='block text-sm font-semibold text-gray-700 mb-2'
            >
              Company Name*
            </label>
            <input
              id='companyName'
              type='text'
              autoComplete='organization'
              placeholder='Company Name'
              {...register("companyName", {
                required: "Please enter company name",
              })}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03793d]/40 focus:border-[#03793d] outline-none transition-all'
            />
            {errors.companyName && (
              <p className='text-red-500 text-xs mt-1'>
                {errors.companyName.message}
              </p>
            )}
          </div>

          {/* Company EIN */}
          <div>
            <label
              htmlFor='companyEinCode'
              className='block text-sm font-semibold text-gray-700 mb-2'
            >
              Company EIN*
            </label>
            <input
              id='companyEinCode'
              type='text'
              inputMode='numeric'
              placeholder='00-0000000'
              {...register("companyEinCode", {
                required: "Please enter company EIN",
              })}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03793d]/40 focus:border-[#03793d] outline-none transition-all'
            />
            {errors.companyEinCode && (
              <p className='text-red-500 text-xs mt-1'>
                {errors.companyEinCode.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor='password'
              className='block text-sm font-semibold text-gray-700 mb-2'
            >
              Password*
            </label>
            <div className='relative'>
              <input
                id='password'
                type={showPassword ? "text" : "password"}
                placeholder='••••••••'
                {...register("password", {
                  required: "Please enter password",
                  minLength: { value: 8, message: "At least 8 characters" },
                  pattern: {
                    value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/,
                    message:
                      "Must contain uppercase, lowercase, number & special char",
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

          {/* Confirm Password */}
          <div>
            <label
              htmlFor='confirmPassword'
              className='block text-sm font-semibold text-gray-700 mb-2'
            >
              Confirm Password*
            </label>
            <div className='relative'>
              <input
                id='confirmPassword'
                type={showPassword ? "text" : "password"}
                placeholder='••••••••'
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === getValues("password") || "Passwords do not match",
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
            {errors.confirmPassword && (
              <p className='text-red-500 text-xs mt-1'>
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        {/* Terms */}
        <div className='mt-6 mb-6'>
          <label className='flex items-start text-sm text-gray-700'>
            <input
              type='checkbox'
              id='terms'
              required
              className='mt-1 mr-2 border-gray-300 rounded focus:ring-[#03793d]'
            />
            <span>
              I understand that{" "}
              <span className='font-semibold'>Stat Surgical Supply</span> only
              sells to hospitals, surgery centers, physician offices, and
              companies in the medical device industry.{" "}
              <span className='font-bold'>We do not sell to individuals.</span>
            </span>
          </label>
        </div>

        {/* Actions */}
        <button
          type='submit'
          disabled={submitting}
          className='w-full py-2 bg-[#03793d] text-white font-semibold rounded-lg shadow hover:bg-[#026a35] transition-colors'
        >
          {submitting ? "Registering..." : "Register"}
        </button>

        <div className='text-center text-sm text-gray-600 mt-6'>
          Already have an account?{" "}
          <Link
            href='/Login'
            className='text-[#03793d] font-semibold hover:underline'
          >
            Log in
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
