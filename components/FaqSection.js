"use client";

import React, { useState } from "react";
import { FaQuestionCircle, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { supportFaqs } from "../utils/faqData";
import { jsonLd } from "../utils/seo";

export default function FaqSection() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <>
      {/* Enhanced FAQ Section */}
      <section className='mb-16'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold text-[#144e8b] mb-4'>
            Frequently Asked Questions
          </h2>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            Quick answers to common questions about our Surgical Supplies
            services
          </p>
        </div>

        <div className='max-w-4xl mx-auto space-y-4'>
          {supportFaqs.map((faq, index) => (
            <div
              key={index}
              className='bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden'
            >
              <button
                className='w-full p-6 text-left hover:bg-gray-50 transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#144e8b] focus:ring-inset'
                onClick={() => toggleFaq(index)}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center'>
                    <div className='shrink-0 w-8 h-8 bg-[#144e8b] rounded-full flex items-center justify-center mr-4'>
                      <FaQuestionCircle className='text-white text-sm' />
                    </div>
                    <h3 className='text-lg font-semibold text-[#144e8b] pr-4'>
                      {faq.question}
                    </h3>
                  </div>
                  <div className='shrink-0'>
                    {openFaq === index ?
                      <FaChevronUp className='text-[#144e8b] text-xl' />
                    : <FaChevronDown className='text-[#144e8b] text-xl' />}
                  </div>
                </div>
              </button>

              {/* Always in the HTML (hidden while collapsed) so the answers
                  match the FAQPage data below for crawlers */}
              <div className='px-6 pb-6' hidden={openFaq !== index}>
                <div className='ml-12 p-4 bg-gray-50 rounded-lg border-l-4 border-[#144e8b]'>
                  <p className='text-gray-700 leading-relaxed'>{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: supportFaqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />
    </>
  );
}
