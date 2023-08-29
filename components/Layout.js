import Head from 'next/head';
import React from 'react';
import Header from './Header';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from './Footer';

export default function Layout({ title, children }) {
  return (
    <div className="w-full">
      <Head>
        <title>{title ? title : 'STAT'}</title>
        <meta name="surgical supplies" content="Surgical Supplies" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ToastContainer position="bottom-center" limit={1} />
      <div className="flex min-h-screen flex-col justify-between">
        <Header />

        <main className="main container  m-auto mt-11 px-4">{children}</main>

        <Footer />
      </div>
    </div>
  );
}
