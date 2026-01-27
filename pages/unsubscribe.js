import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/main/Layout";

export default function Unsubscribe() {
  const router = useRouter();
  const [mailChimpId, setMailChimpId] = useState("");
  const [mailChimpUniqueEmailId, setMailChimpUniqueEmailId] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const { mailChimpId: mcId, mailChimpUniqueEmailId: mcUniqueId } =
      router.query || {};

    if (typeof mcId === "string") {
      setMailChimpId(mcId.trim());
    }
    if (typeof mcUniqueId === "string") {
      setMailChimpUniqueEmailId(mcUniqueId.trim());
    }
  }, [router.query]);

  const handleUnsubscribe = async () => {
    if (!mailChimpId || !mailChimpUniqueEmailId) {
      setStatus("error");
      setMessage(
        "Missing unsubscribe identifiers. Please use the link from your email.",
      );
      return;
    }

    try {
      setStatus("loading");
      setMessage("");
      const response = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mailChimpId, mailChimpUniqueEmailId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Unable to unsubscribe.");
      }

      setStatus("success");
      setMessage(
        "You have been unsubscribed. You will no longer receive these emails.",
      );
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Unable to unsubscribe.");
    }
  };

  const isComplete = status === "success";

  return (
    <Layout
      title='Unsubscribe | Stat Surgical Supply'
      description='Manage your email preferences for Stat Surgical Supply.'
      schema={[]}
    >
      <div className='card p-6 my-10 max-w-2xl mx-auto text-center'>
        <h1 className='section__title'>Unsubscribe</h1>
        <p className='mt-4 text-gray-600'>
          Are you sure you want to stop receiving our emails?
        </p>

        <div className='mt-6'>
          <button
            className={`btn ${isComplete ? "opacity-60" : ""}`}
            onClick={handleUnsubscribe}
            disabled={status === "loading" || isComplete}
            type='button'
          >
            {status === "loading" ? "Processing..." : "Yes, unsubscribe me"}
          </button>
        </div>

        {message && (
          <p
            className={`mt-4 text-sm ${
              status === "error" ? "text-red-600" : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}

        {status !== "success" && (
          <p className='mt-6 text-xs text-gray-500'>
            If you reached this page by mistake, you can close this window.
          </p>
        )}
      </div>
    </Layout>
  );
}
