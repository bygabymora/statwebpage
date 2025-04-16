import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { Store } from '../utils/Store';
import { motion, AnimatePresence } from 'framer-motion';

const CookieAcceptancePopup = () => {
  const { state, dispatch } = useContext(Store);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    const accepted = localStorage.getItem('cookieAccepted');
    if (accepted === 'true') dispatch({ type: 'ACCEPT_COOKIES' });
  }, [dispatch]);

  if (!isClient || state.cookieAccepted) return null;

  const acceptCookies = () => {
    localStorage.setItem('cookieAccepted', 'true');
    dispatch({ type: 'ACCEPT_COOKIES' });
  };

  const declineCookies = () => {
    // Just close the popup but don’t set cookieAccepted in storage
    dispatch({ type: 'ACCEPT_COOKIES' });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto sm:w-[95%] max-w-xl mx-auto p-5 sm:p-6 bg-white/90 backdrop-blur-md border border-gray-300 shadow-xl rounded-xl z-[9999] text-sm text-[#414b53]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-center sm:text-left text-sm leading-relaxed">
            We use cookies to enhance your experience. By continuing to use our website, you agree to our use of cookies.
            <Link href="/privacy-policy" prefetch={false} className="ml-1 text-[#144e8b] font-semibold hover:underline">
              Learn about our privacy policy
            </Link>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center sm:justify-end">
            <button
              onClick={acceptCookies}
              className="px-5 py-2 rounded-full bg-[#144e8b] text-white hover:bg-[#03793d] transition shadow-sm text-sm"
            >
              I Understand
            </button>
            <button
              onClick={declineCookies}
              className="px-5 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition shadow-sm text-sm"
            >
              Decline
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CookieAcceptancePopup;