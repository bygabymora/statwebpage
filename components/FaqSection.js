"use client";

import React, { useState } from "react";
import { FaQuestionCircle, FaChevronDown, FaChevronUp } from "react-icons/fa";

const faqData = [
  {
    question: "How long does support take to respond?",
    answer:
      "We usually respond within 24 hours. For urgent matters, please call us directly at +1 813-252-0727.",
  },
  {
    question: "How do you acquire your products?",
    answer:
      "Stat Surgical acquires products from domestic hospitals, surgery centers, and trusted suppliers, ensuring authenticity and quality.",
  },
  {
    question: "What is the expiration dating of your products?",
    answer:
      "Stat Surgical strives to provide long-dated products. Typically products have 1-3+ years until expiration. We never send short-dated products unless approved by the customer.",
  },
  {
    question: "Are your products in original packaging?",
    answer:
      "All products arrive in original manufacturer packaging, exactly as if shipped directly from the source.",
  },
  {
    question: "Can I negotiate prices on surgical and medical supplies?",
    answer:
      "Stat Surgical has the best prices in the business. We will never let pricing get in the way of our strong relationships with our customers. If pricing is an issue, we will make it work!",
  },
  {
    question: "What payment methods do you accept for billing?",
    answer:
      "We accept purchase orders from domestic hospitals and surgery centers. Other approved customers can pay via ACH, wire transfer, domestic credit card, or domestic PayPal.",
  },
  {
    question: "Can I buy items individually or do I have to buy a full box?",
    answer:
      "Unlike manufacturer minimums, you can purchase single items or full boxes. Cost savings are always our priority!",
  },
];

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
            Quick answers to common questions about our medical supply services
          </p>
        </div>

        <div className='max-w-4xl mx-auto space-y-4'>
          {faqData.map((faq, index) => (
            <div
              key={index}
              className='bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden'
            >
              <button
                className='w-full p-6 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#144e8b] focus:ring-inset'
                onClick={() => toggleFaq(index)}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0 w-8 h-8 bg-[#144e8b] rounded-full flex items-center justify-center mr-4'>
                      <FaQuestionCircle className='text-white text-sm' />
                    </div>
                    <h3 className='text-lg font-semibold text-[#144e8b] pr-4'>
                      {faq.question}
                    </h3>
                  </div>
                  <div className='flex-shrink-0'>
                    {openFaq === index ? (
                      <FaChevronUp className='text-[#144e8b] text-xl' />
                    ) : (
                      <FaChevronDown className='text-[#144e8b] text-xl' />
                    )}
                  </div>
                </div>
              </button>

              {openFaq === index && (
                <div className='px-6 pb-6'>
                  <div className='ml-12 p-4 bg-gray-50 rounded-lg border-l-4 border-[#144e8b]'>
                    <p className='text-gray-700 leading-relaxed'>
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqData.map((faq) => ({
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
