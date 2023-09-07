import React from 'react';
import Layout from '../../components/Layout';
import Link from 'next/link';
import { BsBackspace } from 'react-icons/bs';
import db from '../../utils/db';
import News from '../../models/News';
import Image from 'next/image';

function parseContentWithImages(content) {
  // Use a regular expression to find image tags in the content
  const imageTagRegex = /\[([^\]]+)\]/g;
  const matches = content.match(imageTagRegex);

  if (!matches) {
    return content;
  }

  // Replace image tags with actual image elements
  let parsedContent = content;
  matches.forEach((match) => {
    const imageUrl = match.slice(1, -1); // Remove brackets [ and ]
    const imgElement = `<Image src="${imageUrl}" alt="${content}" width=${300} height=${200}/>`;
    parsedContent = parsedContent.replace(match, imgElement);
  });

  return parsedContent;
}

function formatContentWithParagraphTitles(content) {
  // Split the content into paragraphs
  const paragraphs = content.split('\n');

  // Process each paragraph
  const formattedContent = paragraphs
    .map((paragraph) => {
      if (paragraph.startsWith('#')) {
        return `<p><strong>${paragraph.substring(1)}</strong></p>`;
      } else {
        // Otherwise, keep the paragraph as is
        return `<p >${paragraph}</p>`;
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
        <div className="flex flex-row justify-between items-center gap-4">
          <Image src={news.imageUrl} alt={news.slug} width={600} height={400} />
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
        <div className="flex flex-row justify-between items-center gap-4 font-bold mt-6">
          {news.author}
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
  await db.disconnect();

  return {
    props: {
      news: news ? db.convertDocToObj(news) : null,
    },
  };
}
