import Head from 'next/head';
import React from 'react';
import Header from './Header';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Layout({ title, children }) {
  return (
    <>
      <Head>
        <title>{title ? title : 'STAT'}</title>
        <meta name="description" content="STAT" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ToastContainer position="bottom-center" limit={1} />
      <div className="flex min-h-screen flex-col justify-between ">
        <Header />

        <main className="main container  m-auto mt-11 px-4">{children}</main>

        <footer className="footer_1 flex h-10 justify-center shadow-inner items-center footer ">
          <p className="md:white">Copyrights 2023 STAT Surgical Supply</p>
        </footer>
      </div>
    </>
  );
}
