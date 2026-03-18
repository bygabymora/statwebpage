import React from "react";
import Layout from "../../components/main/Layout";
import Link from "next/link";
import Image from "next/image";
import { BsChevronRight } from "react-icons/bs";
import { FaQuestionCircle } from "react-icons/fa";
import {
  generateBreadcrumbJSONLD,
  generateFAQDetailPageJSONLD,
} from "../../utils/seo";
import { faqData, getFaqBySlug, getAllFaqSlugs } from "../../utils/faqData";
import db from "../../utils/db";
import Product from "../../models/Product";

export async function getStaticPaths() {
  const slugs = getAllFaqSlugs();
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const faq = getFaqBySlug(params.slug);
  if (!faq) {
    return { notFound: true };
  }

  const relatedFaqs = faq.relatedSlugs
    .map((slug) => getFaqBySlug(slug))
    .filter(Boolean)
    .map(({ question, slug }) => ({ question, slug }));

  let relatedProducts = [];
  try {
    await db.connect(true);
    const searchTerms = faq.productSearchTerms || [];
    if (searchTerms.length > 0) {
      const regexPatterns = searchTerms.map((term) => new RegExp(term, "i"));
      const products = await Product.find(
        {
          approved: true,
          active: true,
          $or: [
            { name: { $in: regexPatterns } },
            { keywords: { $in: regexPatterns } },
            { "each.description": { $in: regexPatterns } },
          ],
        },
        {
          name: 1,
          manufacturer: 1,
          image: 1,
          "each.wpPrice": 1,
          "each.description": 1,
          "each.countInStock": 1,
          "box.wpPrice": 1,
          "box.countInStock": 1,
        },
      )
        .limit(6)
        .lean();

      relatedProducts = products.map((p) => ({
        _id: p._id.toString(),
        name: p.name,
        manufacturer: p.manufacturer,
        image: p.image || "",
        price: p.each?.wpPrice || p.box?.wpPrice || 0,
        description: p.each?.description?.slice(0, 100) || "",
        hasStock:
          (p.each?.countInStock || 0) > 0 || (p.box?.countInStock || 0) > 0,
      }));
    }
  } catch (error) {
    console.error("Error fetching related products for FAQ:", error);
  }

  return {
    props: {
      faq,
      relatedFaqs,
      relatedProducts,
    },
    revalidate: 600,
  };
}

export default function FAQDetail({ faq, relatedFaqs, relatedProducts }) {
  const breadcrumbs = [
    { href: "/", name: "Home", url: "https://www.statsurgicalsupply.com" },
    {
      href: "/faqs",
      name: "FAQs",
      url: "https://www.statsurgicalsupply.com/faqs",
    },
    {
      name:
        faq.question.length > 50 ?
          faq.question.slice(0, 50) + "..."
        : faq.question,
      url: `https://www.statsurgicalsupply.com/faqs/${faq.slug}`,
    },
  ];

  const breadcrumbSchema = generateBreadcrumbJSONLD(breadcrumbs);
  const faqSchemas = generateFAQDetailPageJSONLD(faq);

  return (
    <Layout
      title={`${faq.question} | Stat Surgical Supply`}
      description={faq.metaDescription}
      schema={[breadcrumbSchema, ...faqSchemas]}
    >
      <nav className='text-sm text-gray-700' aria-label='Breadcrumb navigation'>
        <ul className='flex ml-0 lg:ml-20 items-center space-x-2 -mt-4 flex-wrap'>
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={index} className='flex items-center'>
              {breadcrumb.href ?
                <Link
                  href={breadcrumb.href}
                  className='hover:underline text-[#0e355e] focus:outline-none focus:ring-2 focus:ring-[#0e355e] focus:ring-opacity-50 rounded'
                  aria-label={`Go to ${breadcrumb.name} page`}
                >
                  {breadcrumb.name}
                </Link>
              : <span aria-current='page' className='text-gray-600 font-medium'>
                  {breadcrumb.name}
                </span>
              }
              {index < breadcrumbs.length - 1 && (
                <BsChevronRight
                  className='mx-2 text-gray-500'
                  aria-hidden='true'
                />
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className='max-w-4xl mx-auto px-4 py-10'>
        <article itemScope itemType='https://schema.org/Question'>
          <header className='mb-8'>
            <div className='flex items-start space-x-4 mb-6'>
              <div
                className='p-3 bg-green-100 rounded-full flex-shrink-0 mt-1'
                aria-hidden='true'
              >
                <FaQuestionCircle className='text-[#07783e] text-xl' />
              </div>
              <h1
                className='text-3xl md:text-4xl font-bold text-[#0e355e] leading-tight'
                itemProp='name'
              >
                {faq.question}
              </h1>
            </div>
          </header>

          <div
            className='bg-[#f0f7f4] border-l-4 border-[#07783e] rounded-r-xl px-6 py-5 mb-8'
            itemProp='acceptedAnswer'
            itemScope
            itemType='https://schema.org/Answer'
          >
            <p className='text-gray-700 font-medium text-lg leading-relaxed'>
              {faq.answer}
            </p>
          </div>

          <section className='prose prose-lg max-w-none mb-12'>
            {faq.expandedAnswer.map((paragraph, idx) => (
              <p
                key={idx}
                className='text-gray-600 leading-relaxed mb-5 text-base'
                itemProp={idx === 0 ? "text" : undefined}
              >
                {paragraph}
              </p>
            ))}
          </section>
        </article>

        {relatedProducts.length > 0 && (
          <section className='mt-10 mb-10' aria-labelledby='products-heading'>
            <h2
              id='products-heading'
              className='text-2xl font-bold text-[#0e355e] mb-6'
            >
              Related Products
            </h2>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
              {relatedProducts.map((product) => (
                <Link
                  key={product._id}
                  href={`/products/${encodeURIComponent(product.manufacturer + "-" + product.name)}`}
                  title={`${product.manufacturer} ${product.name} - Surgical Product - View Details`}
                  className='flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group'
                >
                  <div className='relative w-full aspect-square bg-gray-50'>
                    {product.image ?
                      <Image
                        src={product.image}
                        alt={`${product.manufacturer} ${product.name}`}
                        title={`${product.manufacturer} ${product.name}`}
                        fill
                        className='object-contain p-2 group-hover:scale-105 transition-transform duration-300'
                        sizes='(max-width: 640px) 50vw, 33vw'
                      />
                    : <div className='flex items-center justify-center h-full text-gray-400 text-sm'>
                        No image
                      </div>
                    }
                    {product.hasStock && (
                      <span className='absolute top-2 right-2 bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded'>
                        In Stock
                      </span>
                    )}
                  </div>
                  <div className='p-3 flex flex-col flex-grow'>
                    <p className='text-xs text-gray-500 uppercase tracking-wide'>
                      {product.manufacturer}
                    </p>
                    <h3 className='text-sm font-semibold text-[#0e355e] mt-1 group-hover:underline line-clamp-2'>
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className='text-xs text-gray-500 mt-1 line-clamp-2'>
                        {product.description}
                      </p>
                    )}
                    {product.price > 0 && (
                      <p className='text-sm font-bold text-[#07783e] mt-auto pt-2'>
                        ${product.price.toFixed(2)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <div className='text-center mt-6'>
              <Link
                href='/products'
                className='inline-block text-sm font-medium text-[#0e355e] hover:underline'
              >
                Browse all products &rarr;
              </Link>
            </div>
          </section>
        )}

        {relatedFaqs.length > 0 && (
          <section className='mt-10 mb-10' aria-labelledby='related-heading'>
            <h2
              id='related-heading'
              className='text-2xl font-bold text-[#0e355e] mb-6'
            >
              Related Questions
            </h2>
            <div className='space-y-3'>
              {relatedFaqs.map((related) => (
                <Link
                  key={related.slug}
                  href={`/faqs/${related.slug}`}
                  className='flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group'
                >
                  <div
                    className='p-2 bg-green-100 rounded-full flex-shrink-0'
                    aria-hidden='true'
                  >
                    <FaQuestionCircle className='text-[#07783e] text-sm' />
                  </div>
                  <span className='text-gray-800 group-hover:text-[#0e355e] font-medium transition-colors'>
                    {related.question}
                  </span>
                  <BsChevronRight
                    className='ml-auto text-gray-400 group-hover:text-[#0e355e] flex-shrink-0 transition-colors'
                    aria-hidden='true'
                  />
                </Link>
              ))}
            </div>
          </section>
        )}

        <footer className='text-center mt-12 p-8 bg-gray-50 rounded-2xl'>
          <h3 className='text-xl font-semibold text-[#0e355e] mb-3'>
            Still Have Questions?
          </h3>
          <p className='text-lg text-gray-700 mb-4'>
            Didn&rsquo;t find what you&rsquo;re looking for? Our medical supply
            experts are here to help.
          </p>
          <p className='text-gray-600 mb-6'>
            Get personalized assistance with surgical equipment selection, bulk
            pricing, custom orders, or any other questions about our medical
            supplies.
          </p>
          <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
            <Link
              href='/faqs'
              className='inline-block px-6 py-3 border-2 border-[#0e355e] text-[#0e355e] rounded-xl hover:bg-[#0e355e] hover:text-white transition duration-300 focus:outline-none focus:ring-2 focus:ring-[#0e355e] focus:ring-opacity-50 font-semibold'
              aria-label='View all frequently asked questions'
            >
              View All FAQs
            </Link>
            <Link
              href='/support'
              className='inline-block px-8 py-3 bg-[#0e355e] text-white rounded-xl hover:bg-[#07294c] transition duration-300 focus:outline-none focus:ring-2 focus:ring-[#0e355e] focus:ring-opacity-50 font-semibold shadow-lg hover:shadow-xl'
              aria-label='Contact our surgical supply experts for personalized assistance'
            >
              Contact Our Experts
            </Link>
          </div>
          <p className='text-sm text-gray-500 mt-4'>
            Available Monday-Friday, 9 AM - 5 PM EST
          </p>
        </footer>
      </div>
    </Layout>
  );
}
