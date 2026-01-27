import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/main/Layout";
import CustomConfirmModal from "../components/main/CustomConfirmModal";

export default function Unsubscribe() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [match, setMatch] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    const { email: emailFromQuery, companyName } = router.query || {};

    if (typeof emailFromQuery === "string") {
      setQuery(emailFromQuery.trim());
    } else if (typeof companyName === "string") {
      setQuery(companyName.trim());
    }
  }, [router.query]);

  const handleSearch = async () => {
    if (!query.trim()) {
      setStatus("error");
      setMessage("Enter an email or company name to search.");
      return;
    }

    try {
      setStatus("loading");
      setMessage("");
      setMatch(null);

      const response = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "search", query: query.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "No match found.");
      }

      setMatch(data?.match || null);
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Unable to search.");
    }
  };

  const handleUnsubscribe = async () => {
    if (!match?._id) {
      setStatus("error");
      setMessage("Search for a customer before unsubscribing.");
      return;
    }

    try {
      setStatus("loading");
      setMessage("");

      const response = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unsubscribe", customerId: match._id }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Unable to unsubscribe.");
      }

      setMatch((prev) => (prev ? { ...prev, opOutEmail: true } : prev));
      setStatus("success");
      setMessage("Unsubscribed successfully.");
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Unable to unsubscribe.");
    }
  };

  const handleOpenConfirm = () => {
    if (!match?._id) {
      setStatus("error");
      setMessage("Search for a customer before unsubscribing.");
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    setIsConfirmOpen(false);
    handleUnsubscribe();
  };

  const handleCancel = () => {
    setIsConfirmOpen(false);
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
          Search by email or company name to find the subscriber.
        </p>

        <div className='mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center'>
          <input
            type='text'
            className='w-full max-w-md border rounded px-3 py-2 text-sm'
            placeholder='email@company.com or Company Name'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={status === "loading"}
          />
          <button
            className={`btn ${!query.trim() ? "opacity-60" : ""}`}
            onClick={handleSearch}
            disabled={status === "loading" || !query.trim()}
            type='button'
          >
            {status === "loading" ? "Searching..." : "Search"}
          </button>
        </div>

        {match && (
          <div className='mt-6 border rounded p-4 text-left'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <p className='text-sm text-gray-500'>Match found</p>
                <p className='text-base font-semibold'>
                  {match.companyName || "(No company name)"}
                </p>
                <p className='text-sm text-gray-600'>{match.email || ""}</p>
              </div>
              <button
                className={`btn ${match.opOutEmail ? "opacity-60" : ""}`}
                onClick={handleOpenConfirm}
                disabled={status === "loading" || match.opOutEmail}
                type='button'
              >
                {match.opOutEmail ? "Already unsubscribed" : "Unsubscribe"}
              </button>
            </div>
          </div>
        )}

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
      <CustomConfirmModal
        isOpen={isConfirmOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        message={{
          title: "Confirm unsubscribe",
          body: "Are you sure you want to stop receiving our emails?",
        }}
      />
    </Layout>
  );
}
