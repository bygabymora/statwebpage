import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

export default function GoogleLoginButton({ callbackUrl = "/" }) {
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    try {
      setLoading(true);
      // Initiates the Google flow (NextAuth → /api/auth/signin/google)
      await signIn("google", {
        callbackUrl,
        // prompt: "select_account", // uncomment if you want to force the account selector
      });
    } catch {
      setLoading(false);
      // If something fails, it redirects to the native NextAuth page as a fallback.
      window.location.href = "/api/auth/signin";
    }
  };

  return (
    <button
      type='button'
      onClick={handleGoogle}
      disabled={loading}
      className={`mt-4 w-full flex items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none ${
        loading ? "opacity-70 cursor-not-allowed" : ""
      }`}
      aria-label='Sign in with Google'
      title='Sign in with Google'
    >
      <FcGoogle className='text-2xl' />
      <span>{loading ? "Connecting..." : "Sign in with Google"}</span>
    </button>
  );
}
