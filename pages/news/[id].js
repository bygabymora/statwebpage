import React from 'react';
import Layout from '../../components/main/Layout';
import Link from 'next/link';
import { BsBackspace } from 'react-icons/bs';
import db from '../../utils/db';
import News from '../../models/News';
import Image from 'next/image';

function replaceSlashNWithBreak(content) {
  return content.replace(/\/n/g, '<br/>');
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
  const paragraphs = content.split('\n');

  // Process each paragraph
  const formattedContent = paragraphs
    .map((paragraph) => {
      if (paragraph.startsWith('#')) {
        return `<p><strong>${paragraph.substring(1)}</strong></p>`;
      } else {
        // Otherwise, keep the paragraph as is
        return `<p>${paragraph}</p>`;
      }
    })
    .join('');

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
      <div className="py-2">
        <Link href={'/news'} className="flex gap-4 items-center">
          <BsBackspace />
          Back to news.
        </Link>
      </div>
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-2xl mb-6">{news.title}</h1>
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start">
          <Image
            src={news.imageUrl}
            alt={news.slug}
            width={600}
            height={400}
            className="rounded-lg"
          />
          <div className="flex flex-col justify-center items-center">
            <div
              className="news-content"
              style={{
                whiteSpace: 'pre-line',
              }}
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            ></div>
          </div>
        </div>
        <div className="flex flex-row justify-between items-center gap-4 font-bold mt-3 ">
          {news.author}
        </div>
        <div className="source-links my-4">
          <span className="flex flex-row justify-between items-center gap-4 font-bold ">
            Sources:{' '}
          </span>
          {news.sources &&
            news.sources.map((source, index) => (
              <div key={index} className="source-link underline ">
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.title}
                </a>
              </div>
            ))}
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { params } = context;
  const { slug } = params;

  await db.connect();

  const news = await News.findOne({ slug }).lean();
  console.log('Fetched news:', news);

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
      imageUrl: news.imageUrl || '',
      createdAt: news.createdAt.toISOString(),
      updatedAt: news.updatedAt.toISOString(),
      sources: formattedSources,
    };

    console.log('Formatted news:', formattedNews);

    await db.disconnect();

    return {
      props: {
        news: formattedNews,
      },
    };
  } catch (error) {
    console.error('Error formatting news:', error);
    await db.disconnect();

    return {
      notFound: true,
    };
  }
}
