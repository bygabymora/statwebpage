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

const Header = () => {
  const router = useRouter();
  const { state } = useContext(Store);
  const { cart } = state;
  const [cartItemsCount, setCarItemsCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const { status, data: session } = useSession();

  const active = session?.user?.active || status === "authenticated";

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
          params: {
            keyword: e.target.value,
          },
        });
        setSuggestions(data);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSearch = async (query) => {
    const searchWord = query || searchQuery.trim();

    await axios.post('/api/searched', {
      searchedWord: searchWord,
      slug: 'raw-search',
      manufacturer: 'raw-search',
      fullName: 'raw-search',
      email: 'raw-search',
    });

    if (searchWord) {
      router.push(`/search?query=${searchWord}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setSuggestions([]); // clear suggestions once one is clicked
    handleSearch(suggestion); // pass the selected suggestion to the search function
  };

  return (
    <header className="header">
      <nav className="nav container text-center flex-row-reverse ">
        <div className="search-field relative flex col-span-2 text-center ml-4 mr-4">
          <div className="flex flex-col items-center w-full">
            <div className="flex flex-row w-full">
              <input
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyDown={handleKeyDown}
                type="text"
                className="bg-transparent border-b-2 border-blue-900 outline-none focus:bg-white focus:border-blue-900 md:ml-4 w-full text-blue-900"
                placeholder="Search..."
                onBlur={() => setSuggestions([])}
              />
              <button
                className="nav__search-button"
                onClick={handleSearch}
                aria-label="search"
              >
                <BiSearch className="nav__search-icon" />
              </button>
            </div>

            {suggestions.length > 1 && (
              <div className="suggestions-list absolute top-full w-full mt-1 bg-white shadow-lg z-10">
                {suggestions.map((product, idx) => (
                  <div
                    key={idx}
                    className="suggestion-item px-3 py-2 hover:bg-gray-200"
                    onMouseDown={() => handleSuggestionClick(product.slug)}
                  >
                    {product.slug}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex h-12 items-center nav-field">
          <div className="flex h-12 items-center">
            <Link href="/" className="nav__logo logo" onClick={handleHomeClick}>
              <div className="r__logo r__logo-1 overflow-hidden ">
                <Image 
                src={Logo2} 
                alt="logo" 
                width={500} 
               
                quality={5} />
              </div>
            </Link>
            <Link
              href="/"
              className="nav__logo_2 logo"
              onClick={handleHomeClick}
            >
              <div className="r__logo r__logo-2 overflow-hidden h-10 w-10 md:w-18">
                <Image 
                src={Logo} 
                alt="logo" 
                className='max-w-full h-auto object-contain'
                width={200} 
                />
              </div>
            </Link>
          </div>

          <div className="nav-reverse flex h-12 place-items-center gap-4">
          {active === "loading" ? (
            "Loading"
          ) : (
            active && (
            <div className="flex h-12 items-center">
              <Link
                href={{ pathname: '/cart' }}
                className="flex text-xl font-bold p-2"
                aria-label="cart"
              >
                <BsCart2 />
              </Link>
              {cartItemsCount > 0 && (
                <sub
                  className="cart-badge"
                  onClick={() => router.push('/cart')}
                >
                  {cartItemsCount}
                </sub>
              )}
            </div>
             )
            )}
            <Signupbutton aria-label="profile" />
            <Navbar />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
