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
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const { email: emailFromQuery, access } = router.query || {};

    // Check for access parameter
    if (access === "allowed") {
      setHasAccess(true);
    } else {
      setHasAccess(false);
      return;
    }

    if (typeof emailFromQuery === "string") {
      setQuery(emailFromQuery.trim());
    }
  }, [router.query]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleSearch = async () => {
    if (!hasAccess) {
      setStatus("error");
      setMessage("Access denied. Please use the link provided in your email.");
      return;
    }

    if (!query.trim()) {
      setStatus("error");
      setMessage("Enter an email to search.");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(query.trim())) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
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
    if (!hasAccess) {
      setStatus("error");
      setMessage("Access denied. Please use the link provided in your email.");
      return;
    }

    if (!match?._id) {
      setStatus("error");
      setMessage("Search for a customer before unsubscribing.");
      return;
    }

    try {
      setStatus("loading");
      setMessage("");

      const requestBody = {
        action: "unsubscribe",
        customerId: match._id,
      };

      // If unsubscribing a purchase executive, include their ID
      if (match.isPurchaseExecutive && match.purchaseExecutive?._id) {
        requestBody.purchaseExecutiveId = match.purchaseExecutive._id;
      }

      const response = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Unable to unsubscribe.");
      }

      // Update the match state to reflect unsubscribed status
      setMatch((prev) => {
        if (!prev) return prev;
        if (prev.isPurchaseExecutive && prev.purchaseExecutive) {
          return {
            ...prev,
            purchaseExecutive: {
              ...prev.purchaseExecutive,
              opOutEmail: true,
            },
          };
        } else {
          return { ...prev, opOutEmail: true };
        }
      });

      setStatus("success");
      setMessage("Unsubscribed successfully.");
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Unable to unsubscribe.");
    }
  };

  const handleOpenConfirm = () => {
    if (!hasAccess) {
      setStatus("error");
      setMessage("Access denied. Please use the link provided in your email.");
      return;
    }

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

  // Show access denied if no proper access parameter
  if (!hasAccess) {
    return (
      <Layout
        title='Unsubscribe | Stat Surgical Supply'
        description='Manage your email preferences for Stat Surgical Supply.'
        schema={[]}
      >
        <div className='min-h-[50vh] flex items-center justify-center px-4 py-5'>
          <div className='card w-full max-w-2xl p-8 text-center shadow-sm'>
            <div className='w-16 h-16 mx-auto mb-4 text-red-500'>
              <svg fill='currentColor' viewBox='0 0 24 24'>
                <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z' />
              </svg>
            </div>
            <h1 className='text-xl font-semibold text-gray-800 mb-2'>
              Access Denied
            </h1>
            <p className='text-gray-600 mb-4'>
              This page is only accessible through the unsubscribe link provided
              in your emails.
            </p>
            <p className='text-sm text-gray-500'>
              Please check your email for the correct unsubscribe link.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title='Unsubscribe | Stat Surgical Supply'
      description='Manage your email preferences for Stat Surgical Supply.'
      schema={[]}
    >
      <div className='min-h-[50vh] flex items-center justify-center px-4 py-5'>
        <div className='card w-full max-w-2xl p-8 text-center shadow-sm'>
          <p className='text-xs uppercase tracking-widest text-gray-500'>
            Email preferences
          </p>
          <h1 className='section__title mt-2'>Unsubscribe</h1>
          <p className='mt-3 text-gray-600'>
            Search by email to find the subscriber.
          </p>

          <div className='mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center'>
            <input
              type='text'
              className='w-full max-w-md border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#0e355e] focus:ring-2 focus:ring-[#144e8b] transition-all duration-300 outline-none'
              placeholder='email@company.com'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={status === "loading" || !hasAccess}
            />
            <button
              className={`
                relative overflow-hidden px-6 py-3 rounded-xl font-medium text-white text-sm 
                transition-all duration-300 transform hover:scale-105 hover:shadow-lg 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#144e8b]
                ${
                  !query.trim() || status === "loading" ?
                    "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#0e355e] to-[#144e8b] hover:from-[#144e8b] hover:to-[#0e355e] shadow-md"
                }
              `}
              onClick={handleSearch}
              disabled={status === "loading" || !query.trim() || !hasAccess}
              type='button'
            >
              <span
                className={`flex items-center justify-center gap-2 ${status === "loading" ? "opacity-75" : ""}`}
              >
                {status === "loading" ?
                  <>
                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                    <span>Searching...</span>
                  </>
                : <>
                    <svg
                      className='w-4 h-4'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                      />
                    </svg>
                    <span>Search</span>
                  </>
                }
              </span>
            </button>
          </div>

          {match && (
            <div className='mt-6 border-2 border-gray-200 rounded-xl p-6 text-left bg-gradient-to-br from-white to-gray-50 shadow-sm transition-all duration-300 hover:shadow-md'>
              <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                  <p className='text-sm text-gray-500'>
                    {match.isPurchaseExecutive ?
                      "Information found"
                    : "Match found"}
                  </p>
                  <p className='text-base font-semibold'>
                    {match.isPurchaseExecutive ?
                      `${match.purchaseExecutive?.name || ""} ${match.purchaseExecutive?.lastName || ""}`.trim() ||
                      "(No name)"
                    : match.companyName || "(No company name)"}
                  </p>
                  <p className='text-sm text-gray-600'>
                    {match.isPurchaseExecutive ?
                      match.purchaseExecutive?.email || ""
                    : match.email || ""}
                  </p>
                  {match.isPurchaseExecutive && (
                    <>
                      <p className='text-xs text-gray-500 mt-1'>
                        {(
                          match.purchaseExecutive?.title &&
                          match.purchaseExecutive?.role
                        ) ?
                          `${match.purchaseExecutive.title} - ${match.purchaseExecutive.role}`
                        : match.purchaseExecutive?.title ||
                          match.purchaseExecutive?.role ||
                          "Contact"
                        }
                      </p>
                      <p className='text-xs text-gray-400'>
                        Company: {match.companyName || "(No company name)"}
                      </p>
                    </>
                  )}
                </div>
                <button
                  className={`
                    relative overflow-hidden px-6 py-3 rounded-xl font-medium text-sm 
                    transition-all duration-300 transform hover:scale-105 hover:shadow-lg 
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${
                      (
                        match.isPurchaseExecutive ?
                          match.purchaseExecutive?.opOutEmail
                        : match.opOutEmail
                      ) ?
                        "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : status === "loading" ?
                        "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md focus:ring-red-400"
                    }
                  `}
                  onClick={handleOpenConfirm}
                  disabled={
                    status === "loading" ||
                    (match.isPurchaseExecutive ?
                      match.purchaseExecutive?.opOutEmail
                    : match.opOutEmail) ||
                    !hasAccess
                  }
                  type='button'
                >
                  <span className='flex items-center justify-center gap-2'>
                    {(
                      match.isPurchaseExecutive ?
                        match.purchaseExecutive?.opOutEmail
                      : match.opOutEmail
                    ) ?
                      <>
                        <svg
                          className='w-4 h-4'
                          fill='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                        <span>Already unsubscribed</span>
                      </>
                    : <>
                        <svg
                          className='w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                          />
                        </svg>
                        <span>Unsubscribe</span>
                      </>
                    }
                  </span>
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
      </div>
      <CustomConfirmModal
        isOpen={isConfirmOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        message={{
          title: "Confirm unsubscribe",
          body:
            match?.isPurchaseExecutive ?
              `Are you sure you want to unsubscribe ${match.purchaseExecutive?.name || "this contact"} from receiving our emails?`
            : "Are you sure you want to stop receiving our emails?",
        }}
      />
    </Layout>
  );
}
