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
      <MiniHeader />
      <div className='relative block item-center justify-center md:hidden flex-1 max-w-md mx-4 w-full'>
        <div className='flex items-center w-[90%] justify-between border rounded-full px-3 bg-gray-100 my-2'>
          <input
            autoComplete='off'
            type='text'
            value={searchQuery}
            onChange={handleSearchInputChange}
            onKeyDown={handleKeyDown}
            className=' bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm'
            placeholder='Search...'
          />
          <button
            onClick={() => handleSearch()}
            aria-label='Search'
            className='p-1'
          >
            <SearchIcon className='text-[#03793d] text-lg' />
          </button>
        </div>
        {suggestions.length > 0 && (
          <div className='suggestions-list absolute w-[90%] mt-1 overflow-auto max-h-[50vh] bg-white shadow-md bottom-full z-[9999] custom-scrollbar'>
            {suggestions.map((product, index) => (
              <div
                key={index}
                className='p-2 hover:bg-gray-100 cursor-pointer'
                onMouseDown={() => handleSuggestionClick(product.name)}
              >
                {product.name} / {product.manufacturer}
              </div>
            ))}
          </div>
        )}
      </div>
      <nav className='md:h-[5rem] md:my-5 nav text-center max-w-7xl mx-auto justify-between items-center px-4 '>
        <div className='flex items-center min-h-[200px]'>
          <button
            onClick={handleHomeClick}
            className='relative w-14 h-14 md:w-24 md:h-24 lg:w-30 lg:h-32 min-h-[200px]'
          >
            <Image
              src={Logo2}
              alt='Company Logo - STAT Surgical Supply'
              title='types Equipment Distributor'
              width={100}
              height={100}
            />
          </button>
        </div>

        <div className='relative md:block hidden flex-1 max-w-md mx-4 w-full'>
          <div className='flex items-center border rounded-full px-3 py-1 bg-gray-100'>
            <input
              autoComplete='off'
              type='text'
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyDown={handleKeyDown}
              className='w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm'
              placeholder='Search...'
            />
            <button
              onClick={() => handleSearch()}
              aria-label='Search'
              className='p-2'
            >
              <SearchIcon className='text-[#03793d] text-lg' />
            </button>
          </div>
          {suggestions.length > 0 && (
            <div className='suggestions-list absolute w-full mt-1 bg-white shadow-md top-full z-[9999] max-h-[50vh] overflow-auto custom-scrollbar'>
              {suggestions.map((product, index) => (
                <div
                  key={index}
                  className='p-2 hover:bg-gray-100 cursor-pointer'
                  onMouseDown={() => handleSuggestionClick(product.name)}
                >
                  {product.name} / {product.manufacturer}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className='flex items-center gap-6 relative'>
          {active && (
            <Link
              href='/cart'
              title='Your Shopping Cart Products'
              aria-label='Cart'
              className='relative group'
            >
              <CartIcon className='text-3xl text-[#0e355e] transition-transform transform group-hover:scale-110' />
              {cartItemsCount > 0 && (
                <span className='absolute -top-2 -right-2 bg-[#03793d] text-white w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold shadow-lg'>
                  {cartItemsCount}
                </span>
              )}
            </Link>
          )}
          <Signupbutton aria-label='Profile' />
          <Navbar />
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
