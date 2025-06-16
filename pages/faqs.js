import React, { useState } from "react";
import Head from "next/head";
import Layout from "../components/main/Layout";
import { FaQuestionCircle } from "react-icons/fa";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";

const faqData = [
  {
    question: "How long does a typical surgical procedure last?",
    answer:
      "Most minor procedures take between 30 minutes and 2 hours. Major surgeries can range from 2 to 6 hours or more depending on complexity and patient factors.",
  },
  {
    question: "What factors influence the duration of surgery?",
    answer:
      "Procedure complexity, patient health, anesthesia type, and the surgical team’s experience all play a role in how long a surgery takes.",
  },
  {
    question: "How sterile are surgical supplies upon delivery?",
    answer:
      "All our supplies are terminally sterilized and arrive in sealed, tamper-evident packaging that meets FDA and ISO 13485 standards.",
  },
  {
    question:
      "Can surgical supplies expire, and how do I check their expiration dates?",
    answer:
      "Yes—every sterilized item has an expiration date printed on its packaging. You can also find lot and expiry details in your order confirmation or by inspecting the package label.",
  },
  {
    question: "How should I store surgical instruments to maintain sterility?",
    answer:
      "Keep items in a clean, dry environment at room temperature, away from direct sunlight and moisture. Do not break the sterile seal until immediately before use.",
  },
  {
    question: "How far in advance should I order surgical supplies?",
    answer:
      "For standard items, we recommend ordering at least 7–10 days before your scheduled procedure. For large or custom orders, allow 2–3 weeks to ensure availability.",
  },
];

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState(null);
  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  // JSON-LD Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <Layout title='FAQs'>
      <Head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema, null, 2),
          }}
        />
      </Head>

      <section className='max-w-4xl mx-auto p-5 text-center'>
        <h1 className='text-3xl font-bold text-[#144e8b]'>
          Frequently Asked Questions
        </h1>

        <section className='max-w-3xl mx-auto px-4 space-y-4 my-10'>
          {faqData.map((item, idx) => (
            <div
              key={idx}
              className='bg-white rounded-2xl shadow-lg overflow-hidden transition-transform transform hover:scale-105'
            >
              <button
                onClick={() => toggle(idx)}
                className='w-full flex items-center justify-between p-6 focus:outline-none'
              >
                <div className='flex items-center space-x-3'>
                  <div className='p-2 bg-green-100 rounded-full'>
                    <FaQuestionCircle className='text-[#07783e] text-xl' />
                  </div>
                  <span className='text-lg font-semibold text-gray-800'>
                    {item.question}
                  </span>
                </div>
                {openIndex === idx ? (
                  <IoChevronUp className='text-2xl text-gray-600' />
                ) : (
                  <IoChevronDown className='text-2xl text-gray-600' />
                )}
              </button>
              {openIndex === idx && (
                <div className='p-6 border-t border-gray-200 bg-gray-50'>
                  <p className='text-gray-700 leading-relaxed'>{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </section>
      </section>
    </Layout>
  );
}
