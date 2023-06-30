import React from 'react';
import '../styles/global.css';
import StoreProvider from '../utils/Store';
import { SessionProvider } from 'next-auth/react';

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <StoreProvider>
        <Component {...pageProps} />
      </StoreProvider>
    </SessionProvider>
  );
}
