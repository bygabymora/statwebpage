import React, { useEffect, useState } from "react";
import Layout from "../../components/main/Layout";
import Link from "next/link";
import { BsBackspace } from "react-icons/bs";
import { FaFacebookF, FaLinkedinIn, FaEnvelope } from "react-icons/fa";
import db from "../../utils/db";
import News from "../../models/News";
import Image from "next/image";

export default function Newscreen({ news }) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollY = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      setScrollProgress(Math.min((scrollY / docHeight) * 100, 100));
    };
    window.addEventListener("scroll", updateProgress);
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  if (!news) return <p className='p-8 text-center'>News not found</p>;

  const contentWithImages = news.content.split("\n").map((para, idx) => {
    const imageRegex = /\[(https?:\/\/[^\s\]]+)\]/;
    const match = para.match(imageRegex);
    const text = para.replace(imageRegex, "").trim();

    if (match) {
      return (
        <div key={idx} className='mb-6 clear-both justify-center items-center'>
          <Image
            src={match[1]}
            alt={`Image ${idx}`}
            width={288}
            height={100}
            className='float-left w-72 h-auto mr-5 mb-4 rounded-lg object-cover'
          />
          {text && <p className='text-gray-700 leading-relaxed'>{text}</p>}
        </div>
      );
    }

    if (para.startsWith("#")) {
      return (
        <h2
          key={idx}
          className='text-2xl font-bold text-[#144e8b] clear-both my-6'
        >
          {para.substring(1)}
        </h2>
      );
    }

    return (
      <p key={idx} className='mb-4 text-gray-700 leading-relaxed'>
        {para}
      </p>
    );
  });

  return (
    <Layout title={news.slug} news={news}>
      <div
        className='fixed top-0 left-0 h-1 bg-gradient-to-r from-[#144e8b] to-[#67b7dc] z-50'
        style={{ width: `${scrollProgress}%` }}
      />

      <div className='container mx-auto px-4 sm:px-6 lg:px-24 py-8 -mt-10'>
        <Link
          href='/news'
          className='flex items-center text-[#144e8b] hover:text-[#0e3260] mb-4'
        >
          <BsBackspace className='mr-2' /> Back to News
        </Link>

        <h1 className='text-3xl font-extrabold text-[#144e8b] mb-3'>
          {news.title}
        </h1>
        <div className='text-gray-500 text-sm flex items-center gap-2 mb-4'>
          <span>By {news.author}</span>
          <span className='mx-2'>|</span>
          <time dateTime={news.createdAt}>
            {new Date(news.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </div>
        <div className='flex gap-3 mb-4'>
          <a
            href='https://www.facebook.com/statsurgicalsupply'
            target='_blank'
            rel='noreferrer'
            className='text-gray-600 hover:text-[#3b5998] transition'
          >
            <FaFacebookF size={20} />
          </a>
          <a
            href='https://www.linkedin.com/company/statsurgicalsupply/'
            target='_blank'
            rel='noreferrer'
            className='text-gray-600 hover:text-[#0077b5] transition'
          >
            <FaLinkedinIn size={20} />
          </a>
          <a
            href='mailto:sales@statsurgicalsupply.com'
            target='_blank'
            rel='noreferrer'
            className='text-gray-600 hover:text-[#256128] transition'
          >
            <FaEnvelope size={20} />
          </a>
        </div>
        <div className='border-t border-gray-200 pt-4 mb-8'>
          <div className='relative w-full h-64 sm:h-80 rounded-lg overflow-hidden mb-6'>
            <Image
              src={news.imageUrl}
              alt={news.title}
              layout='fill'
              objectFit='cover'
              priority
            />
          </div>
          <div className='text-gray-600 mb-4'>
            <span className='text-sm'>{news.slug}</span>
          </div>
        </div>
        <div className='border-t border-gray-200 pt-4 mb-8'>
          <article className='prose prose-lg max-w-none mb-8 my-5'>
            {contentWithImages}
          </article>
        </div>

        {news.sources?.length > 0 && (
          <section className='border-t border-gray-200 pt-4 mb-8'>
            <h3 className='text-xl font-bold text-[#144e8b] mb-3'>Sources</h3>
            <ul className='list-disc list-inside space-y-2'>
              {news.sources.map((src, i) => (
                <li key={i}>
                  <a
                    href={src.url}
                    className='text-[#144e8b] hover:underline'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {src.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className='text-center mt-12'>
          <Link
            href='/news'
            className='px-6 py-2 bg-[#144e8b] text-white rounded-full font-semibold hover:bg-[#0e3260] transition'
          >
            Explore More News
          </Link>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { slug } = context.params;
  await db.connect(true);

  const doc = await News.findOne({ slug }).lean();
  if (!doc) return { notFound: true };

  const formattedSources = (doc.sources || []).map((s) => ({
    ...s,
    _id: s._id.toString(),
  }));

  return {
    props: {
      news: {
        ...doc,
        _id: doc._id.toString(),
        imageUrl: doc.imageUrl || "",
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
        sources: formattedSources,
      },
    },
  };
}
