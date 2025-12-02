// pages/Register.js
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
import ReCaptchaV2Checkbox from "../components/recaptcha/ReCaptchaV2Checkbox";
import { BsChevronRight } from "react-icons/bs";

const RECAPTCHA_ACTION = "register_submit";

export default function RegisterScreen() {
  const { data: session } = useSession();
  const router = useRouter();

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

  // Nuevo: token de reCAPTCHA v2
  const [captchaToken, setCaptchaToken] = useState(null);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  }, []);

  useEffect(() => {
    if (session?.user) router.push(redirect || "/");
  }, [session?.user, redirect, router]);

  const {
    handleSubmit,
    register,
    getValues,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (typeof prefillEmail === "string" && prefillEmail) {
      const normalized = prefillEmail.trim().toLowerCase();
      setValue("email", normalized, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
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
    setSubmitting(true);
    try {
      // 1) Validate reCAPTCHA checked
      if (!captchaToken) {
        setAlertMessage({
          title: "reCAPTCHA required",
          body: "Please confirm you are not a robot by ticking the checkbox.",
        });
        setIsModalOpen(true);
        setShouldRedirect(false);
        return;
      }

      // 2) Verify token with the backend
      let verifyData = null;
      try {
        const verifyRes = await fetch("/api/recaptcha/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: captchaToken,
            action: RECAPTCHA_ACTION,
            version: "v2",
          }),
        });
        verifyData = await verifyRes.json();
      } catch (err) {
        console.error("[reCAPTCHA verify] network/fetch error:", err);
        setAlertMessage({
          title: "Network error",
          body: "We could not verify the reCAPTCHA. Please check your connection and try again.",
        });
        setIsModalOpen(true);
        setShouldRedirect(false);
        return;
      }

      if (!verifyData?.success) {
        console.warn("[reCAPTCHA verify] failed:", verifyData);
        const reason = verifyData?.reason;

        let bodyMessage = "reCAPTCHA verification failed. Please try again.";

        if (reason === "server_misconfig") {
          bodyMessage =
            "There is a server configuration issue with reCAPTCHA. Please try again later.";
        } else if (reason === "missing_token") {
          bodyMessage =
            "reCAPTCHA token is missing. Please reload the page and try again.";
        } else if (reason === "wrong_action") {
          bodyMessage =
            "There was a validation mismatch. Please reload the page and try again.";
        } else if (reason === "low_score") {
          bodyMessage =
            "We could not verify you are human. Please try again or contact support.";
        } else if (reason === "google_not_success") {
          bodyMessage =
            "reCAPTCHA could not be validated with Google. Please try again.";
        } else if (reason === "google_parse_error") {
          bodyMessage =
            "Unexpected response from Google reCAPTCHA. Please try again.";
        }

        setAlertMessage({
          title: "reCAPTCHA error",
          body: bodyMessage,
        });
        setIsModalOpen(true);
        setShouldRedirect(false);
        return;
      }

      // 3) If reCAPTCHA is ok → continue with the registration logic
      const normalizedEmail = (email || "").trim().toLowerCase();

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

      try {
        window.gtag?.("event", "ads_conversion_Sign_Up_1", {
          register_attempt: true,
          userName: firstName,
        });
      } catch {
        /* no-op */
      }

      setAlertMessage({
        title: "Your account has been created successfully!",
        body: "We are reviewing your information, you will receive a notification when your account is approved.",
      });
      setIsModalOpen(true);
      setShouldRedirect(true);

      const contactToEmail = {
        name: `${firstName} ${lastName}`.trim(),
        email: normalizedEmail,
        companyName: companyName || "Not provided",
        companyEinCode: companyEinCode || "Not provided",
      };

      const emailmessage = messageManagement(contactToEmail, "Register");
      handleSendEmails(emailmessage, contactToEmail);

      // Optional: reset the v2 widget
      if (typeof window !== "undefined" && window.grecaptcha) {
        window.grecaptcha.reset();
      }
      setCaptchaToken(null);
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

  const breadcrumbs = [
    { href: "/Login", name: "Login" },
    { name: "Create Account" },
  ];

  return (
    <Layout
      title='Create Account | STAT Surgical Supply'
      description='Register your organization with STAT Surgical Supply to access exclusive medical supplies and equipment discounts. Complete the registration form to create your account today.'
      schema={[]}
    >
      {from === "google" && (
        <div className='mx-auto max-w-md mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900 shadow-sm -mt-2'>
          We found your Google account. Please complete the missing fields to
          finish your registration.
        </div>
      )}
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
        noValidate
        className='max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100 my-5'
      >
        <h1 className='text-2xl font-bold text-[#0e355e] mb-2 text-center'>
          Create Account
        </h1>
        <p className='text-gray-500 text-center mb-8 text-sm'>
          Please fill in the fields below to register your organization.
        </p>

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
        <div className='mt-6 mb-4'>
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

        {/* reCAPTCHA v2 visible */}
        <div className='mb-4'>
          <ReCaptchaV2Checkbox
            id='recaptcha-v2-register'
            onChange={setCaptchaToken}
          />
        </div>

        <button
          type='submit'
          disabled={submitting}
          className='w-full py-2 bg-[#03793d] text-white font-semibold rounded-lg shadow hover:bg-[#026a35] transition-colors disabled:opacity-70 disabled:cursor-not-allowed'
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
