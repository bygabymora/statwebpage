import React from "react";
import Layout from "../../components/main/Layout";
import Link from "next/link";
import { BsBackspace } from "react-icons/bs";
import db from "../../utils/db";
import News from "../../models/News";
import Image from "next/image";

function replaceSlashNWithBreak(content) {
  return content.replace(/\/n/g, "<br/>");
}

function parseContentWithImages(content) {
  // Use a regular expression to find image tags in the content
  const imageTagRegex = /\[([^\]]+)\]/g;
  const matches = content?.match(imageTagRegex);

  // Replace /n with <br/>
  content = replaceSlashNWithBreak(content);

  if (!matches) {
    return content;
  }

  // Replace image tags with actual image elements
  let parsedContent = content;
  matches.forEach((match) => {
    const imageUrl = match.slice(1, -1); // Remove brackets [ and ]
    const altText = `Image: ${imageUrl}`; // Set alt text based on image URL
    const imgElement = `<Image src="${imageUrl}" alt="${altText}" width={300} height={200} class="mx-auto my-auto rounded-lg"/>`;
    parsedContent = parsedContent.replace(match, imgElement);
  });

  return parsedContent;
}

function formatContentWithParagraphTitles(content) {
  // Replace /n with <br/>
  content = replaceSlashNWithBreak(content);

  // Split the content into paragraphs
  const paragraphs = content.split("\n");

  // Process each paragraph
  const formattedContent = paragraphs
    .map((paragraph) => {
      if (paragraph.startsWith("#")) {
        return `<p><strong>${paragraph.substring(1)}</strong></p>`;
      } else {
        // Otherwise, keep the paragraph as is
        return `<p>${paragraph}</p>`;
      }
    })
    .join("");

  return formattedContent;
}

export default function Newscreen(props) {
  const { news } = props;
  if (!news) {
    return <p>News not found</p>;
  }

  // Parse news.content to display embedded images
  const parsedContentWithImages = parseContentWithImages(news.content);

  // Format content with paragraph titles in bold
  const formattedContent = formatContentWithParagraphTitles(
    parsedContentWithImages
  );

  return (
    <Layout title={news.slug} news={news}>
      <div className='px-4 sm:px-8 md:px-12 lg:px-32 bg-white text-gray-800'>
        <div className='mb-8'>
          <Link
            href='/news'
            className='flex items-center text-sm gap-2 text-gray-500 hover:text-[#144e8b] transition'
          >
            <BsBackspace className='text-base' />
            <span className='underline'>Back to News</span>
          </Link>
        </div>
        <article className='max-w-4xl mx-auto'>
          <h1 className='text-4xl md:text-5xl font-extrabold text-[#144e8b] leading-tight mb-4'>
            {news.title}
          </h1>

          <div className='flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-10'>
            <span className='italic'>By {news.author}</span>
            <span className='w-1 h-1 bg-gray-400 rounded-full'></span>
            <span className='uppercase tracking-wide'>News</span>
            <span className='w-1 h-1 bg-gray-400 rounded-full'></span>
            <span>{new Date(news.createdAt).toLocaleDateString()}</span>
          </div>

          <div className='mb-10'>
            <Image
              src={news.imageUrl}
              alt={news.slug}
              width={900}
              height={500}
              className='rounded-2xl w-full object-cover shadow-md border'
              loading='lazy'
            />
          </div>

          <div
            className='prose prose-lg lg:prose-xl max-w-none prose-headings:text-[#144e8b] prose-img:rounded-xl prose-img:shadow-md prose-a:text-blue-600 prose-a:hover:text-blue-800 prose-p:leading-relaxed'
            dangerouslySetInnerHTML={{ __html: formattedContent }}
          ></div>

          {news.sources?.length > 0 && (
            <section className='mt-16 pt-10 border-t border-gray-200 my-9'>
              <h2 className='text-2xl font-semibold text-[#144e8b] mb-4'>
                Sources
              </h2>
              <ul className='space-y-2 list-disc list-inside text-gray-700'>
                {news.sources.map((source, index) => (
                  <li key={index}>
                    <a
                      href={source.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='underline hover:text-blue-700 transition-colors'
                    >
                      {source.title}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { params } = context;
  const { slug } = params;

  await db.connect();

  const news = await News.findOne({ slug }).lean();
  console.log("Fetched news:", news);

  if (!news) {
    return {
      notFound: true,
    };
  }

  try {
    // Convert _id field within sources array to strings
    const formattedSources = news.sources.map((source) => ({
      ...source,
      _id: source._id.toString(),
    }));

    const formattedNews = {
      ...news,
      _id: news._id.toString(),
      imageUrl: news.imageUrl || "",
      createdAt: news.createdAt.toISOString(),
      updatedAt: news.updatedAt.toISOString(),
      sources: formattedSources,
    };

    console.log("Formatted news:", formattedNews);

    await db.disconnect();

    return {
      props: {
        news: formattedNews,
      },
    };
  } catch (error) {
    console.error("Error formatting news:", error);
    await db.disconnect();

    return {
      notFound: true,
    };
  }
}
