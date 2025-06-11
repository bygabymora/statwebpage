// pages/unauthorized.js
import React from "react";
import Layout from "../components/main/Layout";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Unauthorized() {
  const router = useRouter();
  const { message, redirect } = router.query;

  return (
    <Layout title='Unauthorized Page'>
      <div className='mx-auto max-w-screen-md w-full text-center items-center'>
        <h1 className='text-2xl font-semibold'>
          You are not authorized to view this page.
        </h1>
        <br />
        {message && (
          <Link
            href={`/Login?redirect=${encodeURIComponent(redirect || "/")}`}
            className='banner-link text-2xl'
          >
            {message}
          </Link>
        )}
      </div>
    </Layout>
  );
}
