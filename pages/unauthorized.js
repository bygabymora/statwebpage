import React from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Unauthorized() {
  const router = useRouter();
  const { message } = router.query;

  return (
    <Layout title="Unauthorized Page">
      <div className="mx-auto max-w-screen-md w-full text-center items-center">
        <h1 className="text-center text-2xl font-semibold">
          You are not authorized to view this page.
        </h1>
        <br />
        {message && (
          <Link href="/Login" className="banner-link text-2xl ">
            {message}
          </Link>
        )}
      </div>
    </Layout>
  );
}
