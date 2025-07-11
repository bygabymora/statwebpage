"use client";
import Signupbutton from "./Signupbutton";
import React, { useState } from "react";
import Link from "next/link";
import { BsCart2 } from "react-icons/bs";
import Image from "next/image";
import Logo2 from "../../public/images/assets/logo.png";
import Navbar from "./Navbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { BiSearch } from "react-icons/bi";
import axios from "axios";
import StaticHeader from "./StaticHeader";
import Menu from "./../Menu";
import MiniHeader from "./../MiniHeader";
import { useModalContext } from "../context/ModalContext";
import StatusMessage from "./StatusMessage";

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
        error.response?.data || error.message
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
            <BiSearch className='text-[#03793d] text-lg' />
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
        <div className='flex items-center'>
          <button
            onClick={handleHomeClick}
            className='relative w-14 h-14 md:w-24 md:h-24 lg:w-30 lg:h-32'
          >
            <Image
              src={Logo2}
              alt='STAT Surgical Supply Logo'
              title='STAT Surgical Supply Logo'
              fill
              priority
              sizes='(max-width:768px) 56px, (max-width:1024px) 96px, 128px'
              className='object-contain'
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
              <BiSearch className='text-[#03793d] text-lg' />
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
              title='Cart'
              aria-label='Cart'
              className='relative group'
            >
              <BsCart2 className='text-3xl text-[#144e8b] transition-transform transform group-hover:scale-110' />
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
