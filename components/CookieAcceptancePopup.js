import React, { useContext, useEffect, useState } from 'react';
import { Store } from '../utils/Store';

const CookieAcceptancePopup = () => {
  const { state, dispatch } = useContext(Store);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // once the component mounts (client side), this will be true
  }, []);
  if (!isClient || state.cookieAccepted) {
    return null; // If we're server-side or if cookie is accepted, don't render anything
  }

  if (typeof window === 'undefined' || state.cookieAccepted) {
    return null;
  }

  if (state.cookieAccepted) {
    return null;
  }

  const declineCookies = () => {
    dispatch({ type: 'ACCEPT_COOKIES' });
  };

  return (
    <div className="fixed bottom-0 left-0 w-full p-4 bg-gray-500 text-white shadow-md z-50">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <p className="text-sm">
            We use cookies to enhance your experience. By continuing to use our
            website, you agree to our cookies use.
          </p>
          <div className="flex space-x-4">
            <button
              className="px-4 py-2 bg-green-800 hover:bg-titlecolordark text-white rounded hover:text-black transition duration-300"
              onClick={() => dispatch({ type: 'ACCEPT_COOKIES' })}
            >
              I Understand
            </button>
            <button
              className="px-4 py-2 bg-red-300 hover:bg-red-100 text-black rounded transition duration-300"
              onClick={declineCookies}
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieAcceptancePopup;
