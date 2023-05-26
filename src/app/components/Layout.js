import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import { BsCart2 } from 'react-icons/bs';

const Layout = ({ title, children }) => {
  return (
    <>
      <Head>
        <title>{title ? title : 'STAT'}</title>
        <meta name="description" content="STAT" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen flex-col justify-between">
        <header>
          <nav className="flex h-12 items-center shadow-md px-4 justify-between">
            <div>
              <Link href="/" className="text-lg font-bold p-2">
                Home
              </Link>
              <Link href="/about" className="text-lg font-bold p-2">
                About
              </Link>
              <Link href="/products" className="text-lg font-bold p-2">
                Products
              </Link>
              <Link href="/contact" className="text-lg font-bold p-2">
                Contact
              </Link>
            </div>
            <div className="flex h-12 items-center justify-between p-2">
              <Link href="/cart" className="text-lg font-bold p-2">
                <BsCart2 />
              </Link>
              <Link href="login" className="text-lg font-bold p-2">
                Login
              </Link>
            </div>
          </nav>
        </header>
        <main className="container m-auto mt-4 px-4">{children}</main>
        <footer className="flex h-10 justify-center shadow-inner items-center footer">
          <p>Copyrights 2023 STAT Surgical Supplies</p>
        </footer>
      </div>
    </>
  );
};

export default Layout;
