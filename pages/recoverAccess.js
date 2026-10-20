import React, { useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/main/Layout";
import axios from "axios";
import { useModalContext } from "../components/context/ModalContext";
import { BsChevronRight } from "react-icons/bs";
import Link from "next/link";

export default function ForgotPassword() {
  const router = useRouter();
  const { showStatusMessage, startLoading, stopLoading } = useModalContext();

  // null until the user types, so the email from the link fills the input
  const [typedEmail, setEmail] = useState(null);
  const email = typedEmail ?? (router.query.email || "");

  const handleRequestCode = async () => {
    try {
      startLoading();
      // The server emails the code; it is never sent back to the browser.
      await axios.post("/api/auth/requestResetCode", {
        email: email.trim(),
      });

      showStatusMessage(
        "success",
        "If we find your email, a reset code has been sent to it. Please check your inbox."
      );
      router.push("/");
    } catch (error) {
      showStatusMessage(
        "error",
        error.response?.data?.message || "Failed to send reset code"
      );
    } finally {
      stopLoading();
    }
  };

  const breadcrumbs = [
    { href: "/Login", name: "Login" },
    { name: "Forgot Password" },
  ];

  return (
    <Layout
      title='Forgot Password | STAT Surgical Supply'
      description='Recover access to your STAT Surgical Supply account by requesting a password reset code. Enter your registered email to receive instructions for resetting your password securely.'
      schema={[]}
    >
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
      <div className='flex items-center justify-center'>
        <div className='w-full max-w-sm sm:max-w-md lg:max-w-lg'>
          <div className='bg-white shadow-lg rounded-2xl p-6 sm:p-8 border border-gray-100'>
            <div className='text-center mb-6 sm:mb-8'>
              <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-[#0e355e] mb-3 sm:mb-4'>
                Reset Your Password
              </h1>
              <h5 className='text-sm sm:text-base text-gray-500 leading-relaxed'>
                Enter your email address and we ll send you instructions to
                reset your password securely
              </h5>
            </div>

            <div className='space-y-4 sm:space-y-6'>
              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-semibold text-gray-700 mb-2'
                >
                  Email Address
                </label>
                <input
                  id='email'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='your@email.com'
                  className='w-full px-4 py-3 sm:py-3.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03793d]/40 focus:border-[#03793d] outline-hidden transition-all duration-200 bg-white'
                  autoComplete='email'
                />
              </div>

              <button
                onClick={handleRequestCode}
                disabled={!email.trim()}
                className='w-full py-3 sm:py-3.5 px-4 bg-[#03793d] hover:bg-[#026a35] disabled:bg-gray-300 text-white text-sm sm:text-base font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-[#03793d]/40 focus:ring-offset-2'
              >
                Send Reset Instructions
              </button>
            </div>

            <div className='mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100 text-center'>
              <p className='text-xs sm:text-sm text-gray-500'>
                Remember your password?{" "}
                <button
                  onClick={() => router.push("/Login")}
                  className='text-[#03793d] hover:text-[#026a35] font-semibold hover:underline transition-colors duration-200'
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>

          <div className='mt-4 sm:mt-6 text-center my-5'>
            <h6 className='text-xs sm:text-sm text-gray-400'>
              Need help? Contact our support team at{" "}
              <a
                href='mailto:sales@statsurgicalsupply.com'
                className='text-[#03793d] hover:text-[#026a35] font-medium hover:underline transition-colors duration-200'
              >
                sales@statsurgicalsupply.com
              </a>
            </h6>
          </div>
        </div>
      </div>
    </Layout>
  );
}
