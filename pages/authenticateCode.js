import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import Layout from "../components/main/Layout";
import { getError } from "../utils/error";
import axios from "axios";
import { RiEye2Line, RiEyeCloseLine } from "react-icons/ri";

export default function RecoverAccess() {
  const router = useRouter();
  const { email: emailQuery, code: codeQuery } = router.query;

  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      code: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (emailQuery) setEmail(emailQuery);
    if (codeQuery) setResetCode(codeQuery);
  }, [emailQuery, codeQuery]);

  const togglePassword = () => setShowPassword((v) => !v);

  const onSubmit = async ({ code, password }) => {
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });
    try {
      await axios.post("/api/auth/resetPassword", {
        email,
        code: resetCode || code,
        newPassword: password,
      });
      setStatus({
        type: "success",
        message: "Your password has been reset. You may now log in.",
      });
    } catch (err) {
      setStatus({
        type: "error",
        message: getError(err),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title='Recover Access'>
      {console.log("Reset Code:", resetCode)}
      <div className='max-w-md mx-auto p-6 border rounded shadow mt-12'>
        <h1 className='text-2xl font-bold mb-4'>Recover Your Access</h1>

        <p className='mb-2 text-gray-700'>
          Resetting password for:{" "}
          <h1 className='text-xl font-bold mb-4'>{email}</h1>
        </p>

        {(!email || !resetCode) && (
          <p className='text-red-500 mb-4'>
            Invalid link. Please{" "}
            <a href='/forgot-password' className='underline'>
              request a new reset code
            </a>
            .
          </p>
        )}

        {status.message && (
          <div
            className={
              status.type === "success"
                ? "mb-4 p-3 bg-green-100 text-green-800 rounded"
                : "mb-4 p-3 bg-red-100 text-red-800 rounded"
            }
          >
            {status.message}
          </div>
        )}

        {status.type !== "success" && email && resetCode && (
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            {/* Code (read-only) */}

            <label className='block font-semibold mb-1' htmlFor='code'>
              Reset Code
            </label>
            <div className='w-full px-3 py-2 border rounded bg-gray-100'>
              {resetCode}
            </div>

            {/* New Password */}
            <div>
              <label className='block font-semibold mb-1' htmlFor='password'>
                New Password
              </label>
              <div className='relative'>
                <input
                  id='password'
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Please enter a new password",
                    minLength: {
                      value: 8,
                      message: "At least 8 characters",
                    },
                    pattern: {
                      value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/,
                      message:
                        "Must include lowercase, uppercase, number & special char",
                    },
                  })}
                  className='w-full px-3 py-2 border rounded focus:outline-none'
                />
                <button
                  type='button'
                  onClick={togglePassword}
                  className='absolute inset-y-0 right-0 px-3 py-2 text-gray-600'
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

            {/* Confirm Password */}
            <div>
              <label
                className='block font-semibold mb-1'
                htmlFor='confirmPassword'
              >
                Confirm Password
              </label>
              <div className='relative'>
                <input
                  id='confirmPassword'
                  type={showPassword ? "text" : "password"}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (v) =>
                      v === watch("password") || "Passwords do not match",
                  })}
                  className='w-full px-3 py-2 border rounded focus:outline-none'
                />
                <button
                  type='button'
                  onClick={togglePassword}
                  className='absolute inset-y-0 right-0 px-3 py-2 text-gray-600'
                >
                  {showPassword ? <RiEyeCloseLine /> : <RiEye2Line />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className='text-red-500 text-sm mt-1'>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type='submit'
              className='primary-button w-full'
              disabled={isSubmitting}
            >
              {isSubmitting ? "Resetting…" : "Reset Password"}
            </button>
          </form>
        )}

        {status.type === "success" && (
          <button
            onClick={() => router.push("/Login")}
            className='primary-button'
          >
            Go to Login
          </button>
        )}
      </div>
    </Layout>
  );
}
