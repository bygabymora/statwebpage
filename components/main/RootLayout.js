import React from 'react';
import Layout from './Layout';
import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: 'STAT SURGICAL SUPPLY',
  description: 'Discounted surgical supplies.',
};

export default function RootLayout({ children }) {
  return (
    <Layout title="STAT" lang="en-US">
      {' '}
      <Analytics>{children}</Analytics>
    </Layout>
  );
}
