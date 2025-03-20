'use client';
import Signupbutton from './Signupbutton';
import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { BsCart2 } from 'react-icons/bs';
import Image from 'next/image';
import Logo from '../../public/images/assets/logo2.svg';
import Logo2 from '../../public/images/assets/logo.png';
import Navbar from './Navbar';
import { Store } from '../../utils/Store';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/router';
import { BiSearch } from 'react-icons/bi';
import axios from 'axios';
import StaticHeader from './StaticHeader';

const Header = () => {
  const router = useRouter();
  const { state } = useContext(Store);
  const { cart } = state;
  const [cartItemsCount, setCarItemsCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const { status, data: session } = useSession();

  const active = session?.user?.active && session?.user?.approved && status === "authenticated";

  useEffect(() => {
    setCarItemsCount(cart.cartItems.reduce((a, c) => a + c.quantity, 0));
  }, [cart.cartItems]);

  const handleHomeClick = () => {
    // Check if the current route is the home page
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

  return (
    <>
    <header className="bg-white shadow-md sticky top-0 z-[9999]">
      <nav className="container mx-auto flex justify-between items-center py-4 px-6">
        <div className="flex items-center gap-4">
          <Link href="/" onClick={handleHomeClick} aria-label="Home">
           <div className="block md:hidden">
              <Image src={Logo} alt="logo" width={100} height={50} className="object-contain"/>
           </div>
            <div className="hidden md:block">
              <Image src={Logo2} alt="logo" width={55} height={50} className="object-contain"/>
            </div>
          </Link>
        </div>
        <div className="relative w-full max-w-lg">
          <div className="flex items-center border-b-2 border-[#03793d]">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyDown={handleKeyDown}
              className="w-full p-2 outline-none text-[#144e8b]"
              placeholder="Search..."
            />
            <button onClick={() => handleSearch()} aria-label="Search">
              <BiSearch className="text-[#03793d] text-xl" />
            </button>
          </div>
          {suggestions.length > 0 && (
            <div className="suggestions-list absolute w-full mt-1 bg-white shadow-md top-full">
              {suggestions.map((product, idx) => (
                <div key={idx} className="p-2 hover:bg-blue-100 cursor-pointer" onMouseDown={() => handleSuggestionClick(product.name)}>
                  {product.name}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-6">
          {active && (
            <Link href="/cart" aria-label="Carrito" className="relative">
              <BsCart2 className="text-2xl text-[#144e8b]"/>
              {cartItemsCount > 0 && <span className="absolute -top-2 -right-2 bg-[#03793d] text-white rounded-full text-xs px-2">{cartItemsCount}</span>}
            </Link>
          )}
          <Signupbutton aria-label="profile"/>
          <Navbar />
        </div>
      </nav>
    </header>
    <StaticHeader /> 
    </>
  );
};

export default Header;
