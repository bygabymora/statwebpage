// pages/news/[slug].js
import React, { useEffect, useState } from "react";
import Layout from "../../components/main/Layout";
import Link from "next/link";
import { BsBackspace } from "react-icons/bs";
import { FaFacebookF, FaLinkedinIn, FaEnvelope } from "react-icons/fa";
import db from "../../utils/db";
import News from "../../models/News";
import Image from "next/image";

export default function Newscreen({
  news,
  relatedNews,
  showProductsButton = false,
}) {
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

  const pageTitle = `${news.title.slice(0, 40)}... | STAT Surgical Supply`;

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
            title={`Image ${news.title}`}
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
          className='text-2xl font-bold text-[#0e355e] clear-both my-6'
        >
          {para.substring(1)}
        </h2>
      );
    }

    return (
      <h3
        key={idx}
        className='text-base text-[#414b53] mb-6 max-w-base font-normal leading-relaxed'
      >
        {para}
      </h3>
    );
  });

  return (
    <Layout
      title={pageTitle} // Use the constructed page title
      news={news}
      description={`${news.content?.slice(0, 160)}...`}
      image={news.imageUrl}
      url={`https://www.statsurgicalsupply.com/news/${news.slug}`}
    >
      <div
        className='fixed top-0 left-0 h-1 bg-gradient-to-r from-[#0e355e] to-[#67b7dc] z-50'
        style={{ width: `${scrollProgress}%` }}
      />

      <div className='container mx-auto px-4 sm:px-6 lg:px-24 py-8 -mt-10'>
        <Link
          href='/news'
          className='flex items-center text-[#0e355e] hover:text-[#144e8b] mb-4'
        >
          <BsBackspace className='mr-2' /> Back to News
        </Link>

        <h1 className='text-3xl font-extrabold text-[#0e355e] mb-3'>
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
            title='Follow STAT Surgical Supply on LinkedIn'
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
          {news.hasVideo && news.videoUrl ?
            <div className='relative w-full rounded-lg overflow-hidden mb-6'>
              {/* Video Player */}
              {news.videoType === "youtube" ?
                <div className='relative w-full h-64 sm:h-80 lg:h-96'>
                  <iframe
                    src={news.videoUrl.replace("watch?v=", "embed/")}
                    title={news.title}
                    alt={news.title}
                    className='absolute top-0 left-0 w-full h-full'
                    frameBorder='0'
                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                    allowFullScreen
                  />
                </div>
              : news.videoType === "vimeo" ?
                <div className='relative w-full h-64 sm:h-80 lg:h-96'>
                  <iframe
                    src={news.videoUrl}
                    title={news.title}
                    className='absolute top-0 left-0 w-full h-full'
                    frameBorder='0'
                    allow='autoplay; fullscreen; picture-in-picture'
                    allowFullScreen
                  />
                </div>
              : <div className='relative w-full h-64 sm:h-80 lg:h-96'>
                  <video
                    controls
                    className='w-full h-full object-cover'
                    poster={news.imageUrl}
                    preload='metadata'
                  >
                    <source
                      src={news.videoUrl}
                      type={`video/${news.videoType || "mp4"}`}
                    />
                    Your browser does not support the video tag.
                  </video>
                </div>
              }
            </div>
          : <div className='relative w-full h-64 sm:h-80 rounded-lg overflow-hidden mb-6'>
              <Image
                src={news.imageUrl}
                alt={news.title}
                title={news.title}
                layout='fill'
                objectFit='cover'
                priority
              />
            </div>
          }
          <div className='text-gray-600 mb-4'>
            <span className='text-sm'>{news.title}</span>
          </div>
        </div>
        <div className='border-t border-gray-200 pt-4 mb-8'>
          <article className='prose prose-lg max-w-none mb-8 my-5'>
            {contentWithImages}
          </article>
        </div>

        {news.sources?.length > 0 && (
          <section className='border-t border-gray-200 pt-4 mb-8'>
            <h3 className='text-xl font-bold text-[#0e355e] mb-3'>Sources</h3>
            <ul className='list-disc list-inside space-y-2'>
              {news.sources.map((src, i) => (
                <li key={i}>
                  <a
                    href={src.url}
                    className='text-[#0e355e] hover:underline'
                    target='_blank'
                    title={src.title}
                    rel='noopener noreferrer'
                  >
                    {src.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {relatedNews && relatedNews.length > 0 && (
          <section className='border-t border-gray-200 pt-8 mb-8'>
            <h3 className='text-2xl font-bold text-[#0e355e] mb-6 text-center'>
              Related News
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {relatedNews.map((article) => (
                <div
                  key={article._id}
                  className='bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden'
                >
                  <Link href={`/news/${article.slug}`}>
                    <div className='cursor-pointer'>
                      <div className='relative h-48 w-full'>
                        <Image
                          src={article.imageUrl}
                          alt={article.title}
                          title={article.title}
                          layout='fill'
                          objectFit='cover'
                          className='transition-transform duration-300 hover:scale-105'
                        />
                      </div>
                      <div className='p-4'>
                        <h4
                          className='text-lg font-semibold text-[#0e355e] mb-2 hover:text-[#144e8b] transition-colors'
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {article.title}
                        </h4>
                        <p
                          className='text-gray-600 text-sm mb-3'
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {article.content
                            .replace(/\[(https?:\/\/[^\s\]]+)\]/g, "")
                            .slice(0, 120)}
                          ...
                        </p>
                        <div className='flex items-center justify-between text-xs text-gray-500'>
                          <span>By {article.author}</span>
                          <time dateTime={article.createdAt}>
                            {new Date(article.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </time>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className='text-center mt-12'>
          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
            <Link
              href='/news'
              className='px-6 py-2 bg-[#0e355e] text-white rounded-full font-semibold hover:bg-[#0e3260] transition'
            >
              Explore More News
            </Link>
            {showProductsButton && (
              <Link
                href='/products'
                className='px-6 py-2 bg-white border-2 border-[#0e355e] text-[#0e355e] rounded-full font-semibold hover:bg-[#0e355e] hover:text-white transition'
              >
                View Products
              </Link>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { slug } = context.params;
  await db.connect(true);

  // Function to transform URL-encoded/title-case slugs to clean format
  const cleanSlug = (rawSlug) => {
    return decodeURIComponent(rawSlug)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .trim()
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  };

  // Function to handle common abbreviation patterns
  const fixAbbreviations = (slugStr) => {
    return slugStr
      .replace(/\b(u-s|u\.s\.)\b/g, "us") // u-s or u.s. → us
      .replace(/\b(u-k|u\.k\.)\b/g, "uk") // u-k or u.k. → uk
      .replace(/\b(e-u|e\.u\.)\b/g, "eu") // e-u or e.u. → eu
      .replace(/\b(c-e-o)\b/g, "ceo") // c-e-o → ceo
      .replace(/\b(i-t)\b/g, "it") // i-t → it
      .replace(/\b(a-i)\b/g, "ai") // a-i → ai
      .replace(/\b(i-o-t)\b/g, "iot") // i-o-t → iot
      .replace(/-+/g, "-") // Clean up any multiple hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  };

  // First try to find with the original slug
  let doc = await News.findOne({ slug }).lean();

  // If not found, try various alternative slug formats
  if (!doc) {
    const alternativeSlugs = [
      // Try with cleaned slug (for encoded URLs)
      cleanSlug(slug),
      // Try with abbreviation fixes
      fixAbbreviations(slug),
      // Try with both cleaning and abbreviation fixes
      fixAbbreviations(cleanSlug(slug)),
    ].filter((altSlug) => altSlug !== slug && altSlug.length > 0); // Only try different slugs

    for (const altSlug of alternativeSlugs) {
      doc = await News.findOne({ slug: altSlug }).lean();
      if (doc) {
        // If found with alternative slug, redirect to correct URL
        return {
          redirect: {
            destination: `/news/${altSlug}`,
            permanent: true,
          },
        };
      }
    }
  }

  if (!doc) return { notFound: true };

  // Get related news based on category and tags
  let relatedNews = [];
  try {
    const relatedQuery = {
      slug: { $ne: slug }, // Exclude current article
      $or: [{ category: doc.category }, { tags: { $in: doc.tags || [] } }],
    };

    relatedNews = await News.find(relatedQuery)
      .select("title slug content imageUrl author category createdAt")
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    // If we don't have enough related news based on category/tags, fill with latest news
    if (relatedNews.length < 4) {
      const additionalNews = await News.find({
        slug: { $ne: slug },
        _id: { $nin: relatedNews.map((r) => r._id) },
      })
        .select("title slug content imageUrl author category createdAt")
        .sort({ createdAt: -1 })
        .limit(4 - relatedNews.length)
        .lean();

      relatedNews = [...relatedNews, ...additionalNews];
    }
  } catch (error) {
    console.error("Error fetching related news:", error);
  }

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
        videoUrl: doc.videoUrl || null,
        hasVideo: doc.hasVideo || false,
        videoType: doc.videoType || null,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
        sources: formattedSources,
      },
      relatedNews: relatedNews.map((article) => ({
        ...article,
        _id: article._id.toString(),
        createdAt: article.createdAt.toISOString(),
      })),
      showProductsButton: true,
    },
  };
}
