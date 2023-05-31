import React from 'react';
import '../styles/global.css';
import StoreProvider from '../utils/Store';

export default function MyApp({ Component, pageProps }) {
  return (
    <StoreProvider>
      <Component {...pageProps} />
    </StoreProvider>
  );
}
