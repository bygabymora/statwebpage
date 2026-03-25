import Signupbutton from "./Signupbutton";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo2 from "../../public/images/assets/logo.png";
import Navbar from "./Navbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import axios from "axios";
import StaticHeader from "./StaticHeader";
import Menu from "./../Menu";
import MiniHeader from "./../MiniHeader";
import { useModalContext } from "../context/ModalContext";
import StatusMessage from "./StatusMessage";

// Inline SVG icons — eliminates react-icons/bs and react-icons/bi from the
// shared Header bundle, saving JS parse time on every page load.
function CartIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox='0 0 16 16'
      fill='currentColor'
      width='1em'
      height='1em'
      aria-hidden='true'
    >
      <path d='M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5zM3.14 5l1.25 5h8.22l1.25-5H3.14zM5 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0z' />
    </svg>
  );
}

function SearchIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox='0 0 24 24'
      fill='currentColor'
      width='1em'
      height='1em'
      aria-hidden='true'
    >
      <path d='M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z' />
    </svg>
  );
}

function PhoneIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox='0 0 24 24'
      fill='currentColor'
      width='1em'
      height='1em'
      aria-hidden='true'
    >
      <path d='M20.487 17.14l-4.065-3.696a1.001 1.001 0 0 0-1.391.043l-2.393 2.461c-.576-.11-1.734-.471-2.926-1.66-1.192-1.193-1.553-2.354-1.66-2.926l2.459-2.394a1 1 0 0 0 .043-1.391L6.859 3.513a1 1 0 0 0-1.391-.087l-2.17 1.861a1 1 0 0 0-.29.649c-.015.25-.301 6.172 4.291 10.766C11.305 20.707 16.323 21 17.705 21c.202 0 .326-.006.359-.008a.992.992 0 0 0 .648-.291l1.86-2.171a.998.998 0 0 0-.085-1.39z' />
    </svg>
  );
}

const Header = () => {
  const router = useRouter();
  const { user, isVisible, statusMessage, messageType } = useModalContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const { status, data: session } = useSession();

  const active =
    session?.user?.active &&
    session?.user?.approved &&
    status === "authenticated";

  const cartItemsCount = user?.cart?.reduce((a, c) => a + c.quantity, 0) || 0;

  const handleHomeClick = () => {
    if (router.pathname === "/") {
      router.reload();
    } else {
      router.push("/");
    }
  };

  const handleSearchInputChange = async (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length >= 2) {
      try {
        const { data } = await axios.get("/api/search", {
          params: { keyword: e.target.value },
        });
        setSuggestions(data);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSearch = async (query = "") => {
    const searchWord = query || searchQuery.trim();
    if (!searchWord) return;
    try {
      await axios.post("/api/searched", {
        searchedWord: searchWord,
        manufacturer: "raw-search",
        name: "raw-search",
        email: "raw-search",
      });
      setSearchQuery("");
      setSuggestions([]);
      router.push(`/products?query=${encodeURIComponent(searchWord)}`);
    } catch (error) {
      console.error(
        "Error in the search:",
        error.response?.data || error.message,
      );
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion._id);
    setSuggestions([]); // clear suggestions once one is clicked
    handleSearch(suggestion); // pass the selected suggestion to the search function
  };

  return (
    <header className='header'>
      {/* ── Top utility bar (desktop only) ── */}
      <MiniHeader />

      {/* ── Mobile search bar (fixed top on mobile) ── */}
      <div className='relative block md:hidden w-full px-4 py-2 bg-white'>
        <div className='flex items-center w-full border border-gray-200 rounded-full px-4 py-2 bg-gray-50 shadow-sm'>
          <input
            autoComplete='off'
            type='text'
            value={searchQuery}
            onChange={handleSearchInputChange}
            onKeyDown={handleKeyDown}
            className='flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm'
            placeholder='Search products...'
          />
          <button
            onClick={() => handleSearch()}
            aria-label='Search'
            className='ml-2 p-1.5 rounded-full bg-[#03793d] text-white hover:bg-[#025f2f] transition-colors'
          >
            <SearchIcon className='text-sm' />
          </button>
        </div>
        {suggestions.length > 0 && (
          <div className='suggestions-list absolute left-4 right-4 mt-1 overflow-auto max-h-[50vh] bg-white rounded-lg shadow-lg border border-gray-100 top-full z-[9999] custom-scrollbar'>
            {suggestions.map((product, index) => (
              <div
                key={index}
                className='px-4 py-2.5 hover:bg-green-50 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-b-0 transition-colors'
                onMouseDown={() => handleSuggestionClick(product.name)}
              >
                <span className='font-medium text-[#0e355e]'>
                  {product.name}
                </span>
                <span className='text-gray-400 ml-1'>
                  / {product.manufacturer}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Main navigation bar ── */}
      <nav className='max-w-7xl mx-auto w-full px-4 py-2 md:py-0'>
        <div className='flex items-center justify-between gap-4 md:gap-6 md:h-20'>
          {/* Logo */}
          <button
            onClick={handleHomeClick}
            className='flex-shrink-0 focus:outline-none'
          >
            <Image
              src={Logo2}
              alt='Company Logo - STAT Surgical Supply'
              title='Surgical Equipment Distributor'
              width={80}
              height={80}
              className='w-12 h-12 md:w-20 md:h-20 object-contain'
            />
          </button>

          {/* Desktop search bar */}
          <div className='relative hidden md:flex flex-1 max-w-xl'>
            <div className='flex items-center w-full border border-gray-200 rounded-full pl-5 pr-1.5 py-1.5 bg-gray-50 hover:border-[#03793d]/40 focus-within:border-[#03793d] focus-within:ring-2 focus-within:ring-[#03793d]/10 transition-all'>
              <input
                autoComplete='off'
                type='text'
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyDown={handleKeyDown}
                className='flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm'
                placeholder='Search products, manufacturers...'
              />
              <button
                onClick={() => handleSearch()}
                aria-label='Search'
                className='ml-2 p-2 rounded-full bg-[#03793d] text-white hover:bg-[#025f2f] transition-colors'
              >
                <SearchIcon className='text-base' />
              </button>
            </div>
            {suggestions.length > 0 && (
              <div className='suggestions-list absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 top-full z-[9999] max-h-[50vh] overflow-auto custom-scrollbar'>
                {suggestions.map((product, index) => (
                  <div
                    key={index}
                    className='px-5 py-3 hover:bg-green-50 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-b-0 transition-colors'
                    onMouseDown={() => handleSuggestionClick(product.name)}
                  >
                    <span className='font-medium text-[#0e355e]'>
                      {product.name}
                    </span>
                    <span className='text-gray-400 ml-1.5'>
                      / {product.manufacturer}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Phone number (desktop only) */}
          <a
            href='tel:+18132520727'
            className='hidden lg:flex items-center gap-2 text-[#0e355e] hover:text-[#03793d] transition-colors flex-shrink-0'
            title='Call us'
          >
            <PhoneIcon className='text-lg' />
            <span className='text-sm font-semibold whitespace-nowrap'>
              (813) 252-0727
            </span>
          </a>

          {/* Action buttons */}
          <div className='flex items-center gap-3 md:gap-5 flex-shrink-0'>
            {active && (
              <Link
                href='/cart'
                title='Your Shopping Cart Products'
                aria-label='Cart'
                className='relative group p-2'
              >
                <CartIcon className='text-2xl md:text-[1.7rem] text-[#0e355e] transition-transform group-hover:scale-110' />
                {cartItemsCount > 0 && (
                  <span className='absolute -top-0.5 -right-0.5 bg-[#03793d] text-white min-w-[1.25rem] h-5 flex items-center justify-center rounded-full text-[11px] font-bold shadow-md px-1'>
                    {cartItemsCount}
                  </span>
                )}
              </Link>
            )}
            <Signupbutton aria-label='Profile' />
            <Navbar />
          </div>
        </div>
      </nav>

      <StatusMessage
        type={messageType}
        message={statusMessage}
        isVisible={isVisible}
      />
      <Menu />
      <StaticHeader />
    </header>
  );
};

export default Header;
