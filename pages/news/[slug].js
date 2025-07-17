import React, { useEffect, useState } from "react";
import Layout from "../../components/main/Layout";
import Link from "next/link";
import { BsBackspace } from "react-icons/bs";
import { FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import db from "../../utils/db";
import News from "../../models/News";
import Image from "next/image";

function replaceSlashNWithBreak(content) {
  return content.replace(/\/n/g, "<br/>");
}

function parseContentWithImages(content) {
  const imageTagRegex = /\[([^\]]+)\]/g;
  const matches = content?.match(imageTagRegex);
  content = replaceSlashNWithBreak(content);
  if (!matches) return content;
  let parsed = content;
  matches.forEach((match) => {
    const url = match.slice(1, -1);
    const imgEl = `<Image src="${url}" alt="Image: ${url}" class="float-left w-72 h-auto mr-8 mb-4 rounded-lg items-center"`;
    parsed = parsed.replace(match, imgEl);
  });
  return parsed;
}

function formatWithParagraphs(content) {
  content = replaceSlashNWithBreak(content);
  return content
    .split("\n")
    .map((para) =>
      para.startsWith("#")
        ? `<h3 class="mt-8 mb-4 text-2xl font-bold text-[#144e8b]">${para.substring(
            1
          )}</h3>`
        : `<p class="mb-6 leading-relaxed text-gray-700">${para}</p>`
    )
    .join("");
}

export default function Newscreen({ news }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [expanded, setExpanded] = useState(false);

  // Update scroll progress bar
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

  // Prepare full formatted HTML
  const fullParsed = parseContentWithImages(news.content);
  const fullFormatted = formatWithParagraphs(fullParsed);

  // Prepare excerpt (first 500 chars of raw content)
  const RAW = news.content;
  const EXCERPT_LENGTH = 500;
  const rawExcerpt =
    RAW.length > EXCERPT_LENGTH ? RAW.slice(0, EXCERPT_LENGTH) + "..." : RAW;
  const excerptParsed = parseContentWithImages(rawExcerpt);
  const excerptFormatted = formatWithParagraphs(excerptParsed);

  const shouldShowButton = RAW.length > EXCERPT_LENGTH;

  return (
    <Layout title={news.slug} news={news}>
      <div className='mb-8'>
        <Link
          href='/news'
          className='inline-flex items-center text-[#144e8b] hover:text-[#0e3260] text-sm font-medium transition'
        >
          <BsBackspace className='mr-2' /> Back to News
        </Link>
      </div>

      {/* Progress bar */}
      <div
        className='fixed top-0 left-0 h-1 bg-gradient-to-r from-[#144e8b] to-[#67b7dc] z-50'
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Hero */}
      <div className='relative h-96 overflow-hidden'>
        <Image
          src={news.imageUrl}
          alt={news.title}
          layout='fill'
          objectFit='cover'
          title={news.title}
          className='filter brightness-75'
          priority
        />
        <div className='absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-black/40' />
        <div className='absolute bottom-8 left-6 text-white max-w-3xl'>
          <div className='p-4'>
            <h1 className='text-5xl font-extrabold leading-tight drop-shadow-lg'>
              {news.title}
            </h1>
          </div>
          <div className='mt-2 flex gap-3 text-sm opacity-90'>
            <span className='italic'>By {news.author}</span>
            <span className='w-1 h-1 bg-white rounded-full' />
            <span>
              <time dateTime={news.createdAt}>
                {new Date(news.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </span>
          </div>
          <div className='mt-4 flex gap-4'>
            <div className='mt-4 flex gap-4'>
              <a
                href='https://www.facebook.com/statsurgicalsupply'
                target='_blank'
                rel='noreferrer'
                className='p-2 bg-white/20 rounded-full hover:bg-white/40 transition'
              >
                <FaFacebookF />
              </a>
              <a
                href='https://www.linkedin.com/company/statsurgicalsupply/'
                target='_blank'
                title='LinkedIn Profile'
                rel='noreferrer'
                className='p-2 bg-white/20 rounded-full hover:bg-white/40 transition'
              >
                <FaLinkedinIn />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className='px-4 sm:px-8 lg:px-32 bg-white text-gray-800 -mt-20 pt-20'>
        <article className='prose prose-lg lg:prose-xl max-w-none'>
          <div
            dangerouslySetInnerHTML={{
              __html: expanded ? fullFormatted : excerptFormatted,
            }}
          />
        </article>

        {shouldShowButton && !expanded && (
          <div className='text-center mt-6'>
            <button
              onClick={() => setExpanded(true)}
              className='px-6 py-2 bg-[#144e8b] text-white font-semibold rounded-full shadow hover:bg-[#0e3260] transition'
            >
              Read More
            </button>
          </div>
        )}

        {/* Sources */}
        {news.sources?.length > 0 && (
          <section className='mt-16 pt-10 border-t border-gray-200'>
            <h2 className='text-2xl font-semibold text-[#144e8b] mb-4'>
              Sources
            </h2>
            <ul className='space-y-2 list-disc list-inside text-gray-700'>
              {news.sources.map((src, i) => (
                <li key={i}>
                  <a
                    href={src.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='underline hover:text-[#0e3260] transition'
                    title={src.title}
                  >
                    {src.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* CTA */}
        <div className='mt-16 text-center my-5'>
          <Link
            href='/news'
            className='inline-block px-6 py-3 bg-gradient-to-r bg-[#144e8b] text-white font-semibold rounded-full shadow hover:bg-[#0e3260] transition'
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
