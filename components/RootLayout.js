import React from 'react';
import Layout from './Layout';

export const metadata = {
  title: 'STAT SURGICAL SUPPLY',
  description: 'Discounted surgical supplies.',
};

export default function RootLayout({ children }) {
  return <Layout title="STAT">{children}</Layout>;
}
