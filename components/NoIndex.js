import Head from "next/head";

// Keeps a page out of search results and AI answers, for pages that don't
// render Layout on the server (Layout has its own `noindex` prop).
export default function NoIndex() {
  return (
    <Head>
      <meta name='robots' content='noindex, nofollow' />
    </Head>
  );
}
