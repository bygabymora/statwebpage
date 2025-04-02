'use client';
import Signupbutton from './Signupbutton';
import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { BsCart2 } from 'react-icons/bs';
import Image from 'next/image';
import Logo2 from '../../public/images/assets/logo.png';
import Navbar from './Navbar';
import { Store } from '../../utils/Store';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/router';
import { BiSearch } from 'react-icons/bi';
import axios from 'axios';
import StaticHeader from './StaticHeader';
import Menu from './../Menu';
import MiniHeader from './../MiniHeader';

const Header = () => {
  const router = useRouter();
  const { state } = useContext(Store);
  const { cart } = state;
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const { status, data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);

  const active = session?.user?.active && session?.user?.approved && status === "authenticated";

  useEffect(() => {
    setCartItemsCount(cart.cartItems.reduce((a, c) => a + c.quantity, 0));
  }, [cart.cartItems]);

  const handleHomeClick = () => {
    if (router.pathname === '/') {
      router.reload();
    } else {
      router.push('/');
    }
  };

  const handleSearchInputChange = async (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length >= 2) {
      try {
        const { data } = await axios.get('/api/search', {
          params: { keyword: e.target.value },
        });
        setSuggestions(data);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSearch = async (query = '') => {
    const searchWord = query || searchQuery.trim();
    if (!searchWord) return;
    try {
      await axios.post('/api/searched', {
        searchedWord: searchWord,
        manufacturer: 'raw-search',
        name: 'raw-search',
        email: 'raw-search',
      });
      router.push(`/search?query=${encodeURIComponent(searchWord)}`);
    } catch (error) {
      console.error("Error in the search:", error.response?.data || error.message);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setSuggestions([]); // clear suggestions once one is clicked
    handleSearch(suggestion); // pass the selected suggestion to the search function
  };
  useEffect(() => {
    let ticking = false;
  
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };
  
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <MiniHeader />
      <header className={`bg-white shadow-md sticky top-0 z-[9999] transition-all duration-300`}>
        <div className={`transition-all duration-300 ${isScrolled ? "py-0" : "py-2"}`}>
          <nav className="container mx-auto flex items-center justify-between px-4 lg:px-6">
            <Link href="/" onClick={handleHomeClick} aria-label="Home">
              <Image 
                src={Logo2} 
                alt="logo" 
                width={65} 
                height={50} 
                className="hidden md:block object-contain"
              />
              <Image 
                src={Logo2} 
                alt="logo" 
                width={50} 
                height={50} 
                className="block md:hidden object-contain"
              />
            </Link>

            <div className="relative flex-1 max-w-md mx-4 w-full">
              <div className="flex items-center border rounded-full px-3 py-1 bg-gray-100">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
                  placeholder="Search..."
                 />
                <button onClick={() => handleSearch()} aria-label="Search" className="p-2">
                  <BiSearch className="text-[#03793d] text-lg"/>
                </button>
              </div>
              {suggestions.length > 0 && (
                <div className="suggestions-list absolute w-full mt-1 bg-white shadow-md top-full">
                  {suggestions.map((product, idx) => (
                    <div key={idx} className="p-2 hover:bg-gray-100 cursor-pointer" onMouseDown={() => handleSuggestionClick(product.name)}>
                      {product.name}
                    </div>
                  ))} 
                </div>
              )}
            </div>

            <div className="flex items-center gap-6 relative">
              {active && (
                <Link href="/cart" aria-label="Cart" className="relative group">
                  <BsCart2 className="text-3xl text-[#144e8b] transition-transform transform group-hover:scale-110" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#03793d] text-white w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold shadow-lg">
                      {cartItemsCount}
                    </span>
                  )} 
                </Link>
              )}
              <Signupbutton aria-label="Profile" />
              <Navbar />
            </div>
          </nav>
        </div>
        <Menu />
      </header>      
      <StaticHeader/>
    </>
  );
};

export default Header;