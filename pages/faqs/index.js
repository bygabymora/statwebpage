import React, { useState } from "react";
import Layout from "../../components/main/Layout";
import { FaQuestionCircle } from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";
import Link from "next/link";
import { BsChevronRight } from "react-icons/bs";
import { generateBreadcrumbJSONLD } from "../../utils/seo";
import { faqData } from "../../utils/faqData";

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState(null);
  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  const breadcrumbs = [
    { href: "/", name: "Home", url: "https://www.statsurgicalsupply.com" },
    { name: "FAQs", url: "https://www.statsurgicalsupply.com/faqs" },
  ];

  // Enhanced schema generation using utility functions
  const breadcrumbSchema = generateBreadcrumbJSONLD(breadcrumbs);

  // Additional WebPage schema for better SEO
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://www.statsurgicalsupply.com/faqs",
    name: "Surgical Supply FAQs - Common Questions About Surgical Equipment",
    description:
      "Find comprehensive answers to frequently asked questions about surgical supplies, surgical equipment ordering, sterilization, shipping, and healthcare procurement.",
    url: "https://www.statsurgicalsupply.com/faqs",
    isPartOf: {
      "@type": "WebSite",
      "@id": "https://www.statsurgicalsupply.com",
      name: "STAT Surgical Supply",
    },
    about: {
      "@type": "Thing",
      name: "Surgical Supply Questions and Answers",
      description:
        "Comprehensive FAQ covering surgical equipment, surgical supplies, ordering processes, and healthcare procurement.",
    },
    audience: {
      "@type": "Audience",
      audienceType:
        "Healthcare Professionals, Medical Facility Managers, Surgical Staff",
    },
  };

  return (
    <Layout
      title='Surgical Supply FAQs - Common Questions About Surgical Equipment'
      description='Get expert answers to frequently asked questions about surgical supplies, surgical equipment ordering, sterilization procedures, bulk pricing, and healthcare procurement from STAT Surgical Supply.'
      schema={[breadcrumbSchema, webPageSchema]}
    >
      <nav className='text-sm text-gray-700' aria-label='Breadcrumb navigation'>
        <ul className='flex ml-0 lg:ml-20 items-center space-x-2 -mt-4'>
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
      <div className='max-w-4xl mx-auto px-4 py-10 -mt-8'>
        <header className='text-center mb-10'>
          <h1 className='text-4xl font-bold text-[#0e355e] mb-4'>
            Frequently Asked Questions About Surgical Supplies
          </h1>
          <h3 className='text-[#575d61de] text-base mt-3'>
            Find comprehensive answers to common questions about surgical
            procedures, medical equipment ordering, sterilization standards,
            bulk pricing, shipping policies, and healthcare procurement from our
            expert team.
          </h3>
          <p className='text-[#414b53de] text-base mt-3'>
            Serving 150+ healthcare facilities with premium surgical supplies
            and exceptional customer service.
          </p>
        </header>

        <section className='mt-10 space-y-5' aria-labelledby='faq-heading'>
          <h2 id='faq-heading' className='sr-only'>
            Frequently Asked Questions and Answers
          </h2>
          {faqData.map((item, idx) => (
            <article
              key={idx}
              className='bg-white border border-gray-200 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md focus-within:ring-2 focus-within:ring-[#0e355e] focus-within:ring-opacity-50'
              itemScope
              itemType='https://schema.org/Question'
            >
              <button
                onClick={() => toggle(idx)}
                className='w-full flex items-center justify-between px-6 py-5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#0e355e] focus:ring-opacity-50 rounded-xl'
                aria-expanded={openIndex === idx}
                aria-controls={`faq-answer-${idx}`}
                id={`faq-question-${idx}`}
              >
                <div className='flex items-center space-x-4 text-left'>
                  <div
                    className='p-2 bg-green-100 rounded-full flex-shrink-0'
                    aria-hidden='true'
                  >
                    <FaQuestionCircle className='text-[#07783e]' />
                  </div>
                  <h3
                    className='text-lg font-medium text-gray-800 text-left'
                    itemProp='name'
                  >
                    {item.question}
                  </h3>
                </div>
                <IoChevronDown
                  className={`text-2xl text-gray-500 transform transition-transform duration-300 flex-shrink-0 ${
                    openIndex === idx ? "rotate-180" : ""
                  }`}
                  aria-hidden='true'
                />
              </button>
              {openIndex === idx && (
                <div
                  className='px-6 pb-6 text-gray-600 animate-fade-in-down leading-relaxed'
                  id={`faq-answer-${idx}`}
                  role='region'
                  aria-labelledby={`faq-question-${idx}`}
                  itemProp='acceptedAnswer'
                  itemScope
                  itemType='https://schema.org/Answer'
                >
                  <div itemProp='text'>{item.answer}</div>
                  <Link
                    href={`/faqs/${item.slug}`}
                    className='inline-block mt-3 text-sm font-medium text-[#0e355e] hover:underline'
                  >
                    Read full answer &rarr;
                  </Link>
                </div>
              )}
            </article>
          ))}
        </section>
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
          <Link
            href='/support'
            className='inline-block px-8 py-4 bg-[#0e355e] text-white rounded-xl hover:bg-[#07294c] transition duration-300 focus:outline-none focus:ring-2 focus:ring-[#0e355e] focus:ring-opacity-50 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105'
            aria-label='Contact our surgical supply experts for personalized assistance'
          >
            Contact Our Medical Supply Experts
          </Link>
          <p className='text-sm text-gray-500 mt-4'>
            Available Monday-Friday, 9 AM - 5 PM EST
          </p>
        </footer>
      </div>
      {/* Custom animation */}
      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.3s ease-out;
        }
      `}</style>
    </Layout>
  );
}
