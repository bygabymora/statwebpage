import React from "react";
import Head from "next/head";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaQuestionCircle,
} from "react-icons/fa";
import Layout from "../components/main/Layout";
import { BsChevronRight } from "react-icons/bs";
import Link from "next/link";

export default function Support() {
  const breadcrumbs = [{ href: "/", name: "Home" }, { name: "Support" }];
  const faqData = [
    {
      question: "How long does support take to respond?",
      answer: "We usually respond within 24 hours.",
    },
    {
      question: "What are your support hours?",
      answer: "Our support team is available Monday to Friday, 9 AM to 5 PM.",
    },
    {
      question: "Can I get support in Spanish?",
      answer: "Yes, we offer support in both English and Spanish.",
    },
    {
      question: "Where can I find product manuals?",
      answer:
        "You can find product manuals on our website under the 'Resources' section.",
    },
    {
      question: "Do you offer technical support?",
      answer:
        "Yes, we provide technical support for all our products. Please contact us for assistance.",
    },
  ];

  // The JSON-LD Schema
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
    <Layout title='Support'>
      <Head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema, null, 2),
          }}
        />
      </Head>
      <nav className='text-sm text-gray-700'>
        <ul className='flex ml-0 lg:ml-20 items-center space-x-2'>
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={index} className='flex items-center'>
              {breadcrumb.href ? (
                <Link
                  href={breadcrumb.href}
                  className='hover:underline text-[#144e8b]'
                >
                  {breadcrumb.name}
                </Link>
              ) : (
                <span>{breadcrumb.name}</span>
              )}
              {index < breadcrumbs.length - 1 && (
                <BsChevronRight className='mx-2 text-gray-500' />
              )}
            </li>
          ))}
        </ul>
      </nav>
      <section className='w-full min-h-screen flex justify-center items-center px-6'>
        <div className='max-w-4xl w-full p-10 text-center'>
          <h2 className='text-4xl font-bold text-[#144e8b]'>Support</h2>
          <p className='text-lg text-[#414b53] mt-4'>
            Need help? Contact us through email, phone, or visit us in person.
          </p>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-8 mt-10'>
            <div className='flex flex-col items-center p-6 bg-white rounded-xl shadow-md transition-transform duration-300 hover:scale-105'>
              <FaMapMarkerAlt className='text-5xl text-[#03793d]' />
              <h4 className='font-bold text-[#144e8b] mt-3'>Visit Us</h4>
              <p className='text-[#414b53] text-sm mt-1'>
                100 Ashley Dr S #600, Tampa, FL
              </p>
            </div>

            <div className='flex flex-col items-center p-6 bg-white rounded-xl shadow-md transition-transform duration-300 hover:scale-105'>
              <FaPhone className='text-5xl text-[#03793d]' />
              <h4 className='font-bold text-[#144e8b] mt-3'>Call Us</h4>
              <a
                className='text-[#414b53] text-sm mt-1'
                href='tel:+18132520727'
              >
                +1 813-252-0727
              </a>
            </div>

            <div className='flex flex-col items-center p-6 bg-white rounded-xl shadow-md transition-transform duration-300 hover:scale-105'>
              <FaEnvelope className='text-5xl text-[#03793d]' />
              <h4 className='font-bold text-[#144e8b] mt-3'>Email</h4>
              <a
                className='text-[#414b53] text-sm mt-1'
                href='mailto:support@example.com?subject=Support%20Request&body=Hello,%20I%20need%20help%20with...'
              >
                sales@statsurgicalsupply.com
              </a>
            </div>
          </div>

          <div className='mt-12 max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-[#07783e]'>
            <iframe
              src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d881.1556225029047!2d-82.45766380676294!3d27.944216161107967!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88c2c59877a39355%3A0xd495507c20fbd5f0!2sStat%20Surgical%20Supply!5e0!3m2!1sen!2sco!4v1748536969142!5m2!1sen!2sco'
              className='w-full h-96'
              allowFullScreen
              loading='lazy'
              referrerPolicy='no-referrer-when-downgrade'
            ></iframe>
          </div>

          <div className='mt-10 text-left'>
            <h3 className='text-2xl font-bold text-[#144e8b]'>
              Frequently Asked Questions
            </h3>
            <div className='mt-4 bg-gray-100 p-4 rounded-lg shadow-md'>
              <p className='flex items-center text-[#414b53]'>
                <FaQuestionCircle className='text-[#03793d] mr-2' />{" "}
                {faqData[(0, 1)].question}
              </p>
              <p className='mt-2 text-sm text-gray-600'>
                {faqData[(0, 1)].answer}
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
