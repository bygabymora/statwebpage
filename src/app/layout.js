import React from 'react';
import Layout from '../app/components/Layout';

export const metadata = {
  title: 'STAT SURGICAL SUPPLY',
  description: 'Discounted surgical supplies.',
};

export default function RootLayout({ children }) {
  return <Layout title={metadata.title}>{children}</Layout>;
}
