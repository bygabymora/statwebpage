import React, { useContext, useEffect, useState } from 'react';
import { Store } from '../utils/Store';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AiFillCheckCircle } from "react-icons/ai";
import { HiXCircle } from "react-icons/hi";
import { IoMdSettings } from "react-icons/io";

const CookieAcceptancePopup = () => {
  const { state, dispatch } = useContext(Store);
  const [isClient, setIsClient] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const cookieAccepted = localStorage.getItem('cookieAccepted');
    if (cookieAccepted) {
      dispatch({ type: 'ACCEPT_COOKIES' });
    }
  }, [dispatch]);

  if (!isClient || state.cookieAccepted) {
    return null;
  }

  const acceptCookies = () => {
    localStorage.setItem('cookieAccepted', 'true');
    dispatch({ type: 'ACCEPT_COOKIES' });
  };

  const declineCookies = () => {
    localStorage.setItem('cookieAccepted', 'false');
    dispatch({ type: 'DECLINE_COOKIES' });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-6 right-20 sm:left-5 sm:transform sm:-translate-x-1/2 w-full max-w-xl p-6 bg-[#fff] shadow-lg rounded-lg text-[#788b9b] z-50 border border-[#788b9b] sm:bottom-6"
      >
        {!showPreferences ? (
          <div className="flex flex-col space-y-6">
            <p className="text-base text-center text-[#788b9b]">
              We use cookies to improve your experience. By continuing, you agree to our use of cookies.
              <Link href="/privacy-policy" className="text-[#144e8b] hover:underline"> More information</Link>
            </p>
            <div className="flex flex-wrap justify-center sm:space-x-6">
              <button
                className="flex items-center px-4 py-2 bg-[#144e8b] text-white rounded-full hover:bg-[#03793d] transition text-sm sm:text-lg"
                onClick={acceptCookies}
              >
                <AiFillCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2" /> Accept
              </button>
              <button
                className="flex items-center px-4 py-2 bg-[#414b53] text-white rounded-full hover:bg-gray-600 transition text-sm sm:text-lg"
                onClick={declineCookies}
              >
                <HiXCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2" /> Decline
              </button>
              <button
                className="flex items-center px-4 py-2 bg-[#ffd700] text-[--dark-text-color] rounded-full hover:bg-yellow-500 transition text-sm sm:text-lg"
                onClick={() => setShowPreferences(true)}
              >
                <IoMdSettings className="w-5 h-5 sm:w-6 sm:h-6 mr-2" /> Preferences
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4 text-[#144e8b]">Cookie Preferences</h3>
            <p className="text-base mb-6 text-[#788b9b]">Customize your cookie settings.</p>
            <button
              className="px-5 py-3 bg-[#144e8b] text-white rounded-full hover:bg-[#03793d] transition text-lg"
              onClick={acceptCookies}
            > 
              Save Preferences
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default CookieAcceptancePopup;