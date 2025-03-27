import React from "react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaQuestionCircle } from "react-icons/fa";
import Layout from "../components/main/Layout";
import { BsChevronRight } from "react-icons/bs";
import Link from "next/link";

export default function Support() {

  const breadcrumbs = [
    { href: '/', name: 'Home' },
    { name: 'Support' },
  ];
  return (
    <Layout title={'Support'}>
      <nav className="text-sm text-gray-700">
        <ul className="flex ml-0 lg:ml-20 items-center space-x-2">
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={index} className="flex items-center">
              {breadcrumb.href ? (
                <Link href={breadcrumb.href} className="hover:underline text-[#144e8b]">
                  {breadcrumb.name}
                </Link>
              ) : (
                <span>{breadcrumb.name}</span>
              )}
              {index < breadcrumbs.length - 1 && (
                <BsChevronRight className="mx-2 text-gray-500" />
              )}
            </li>
          ))}
        </ul>
      </nav>
      <section className="w-full min-h-screen flex justify-center items-center px-6">
        <div className="max-w-4xl w-full p-10 text-center">
          <h2 className="text-4xl font-bold text-[#144e8b]">Personalized Support</h2>
          <p className="text-lg text-[#414b53] mt-4">
            Need help? Contact us through email, phone, or visit us in person.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-10">

            <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-md transition-transform duration-300 hover:scale-105">
              <FaMapMarkerAlt className="text-5xl text-[#03793d]" />
              <h4 className="font-bold text-[#144e8b] mt-3">Visit Us</h4>
              <p className="text-[#414b53] text-sm mt-1">100 Ashley Dr S #600, Tampa, FL</p>
            </div>

            <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-md transition-transform duration-300 hover:scale-105">
              <FaPhone className="text-5xl text-[#03793d]" />
              <h4 className="font-bold text-[#144e8b] mt-3">Call Us</h4>
              <a className="text-[#414b53] text-sm mt-1" href="tel:+18132520727" >+1 813-607-4110 </a>
            </div>

            <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-md transition-transform duration-300 hover:scale-105">
              <FaEnvelope className="text-5xl text-[#03793d]"/>
              <h4 className="font-bold text-[#144e8b] mt-3">Email</h4>
              <a className="text-[#414b53] text-sm mt-1" href="mailto:support@example.com?subject=Support%20Request&body=Hello,%20I%20need%20help%20with..."
              >sales@statsurgicalsupply.com </a>
            </div>
          </div>

          <div className="mt-12 overflow-hidden shadow-lg rounded-xl">
            <iframe
              className="w-full h-72 rounded-lg shadow-lg"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3520.452662320981!2d-82.45997262365074!3d27.944638676091582!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88c2c48c390490ab%3A0x202198cbac670f1a!2s100%20Ashley%20Dr%20S%20%23600%2C%20Tampa%2C%20FL%2033602%2C%20EE.%20UU.!5e0!3m2!1ses-419!2sco!4v1711570310453!5m2!1ses-419!2sco"
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>

          <div className="mt-10 text-left">
            <h3 className="text-2xl font-bold text-[#144e8b]">Frequently Asked Questions</h3>
            <div className="mt-4 bg-gray-100 p-4 rounded-lg shadow-md">
              <p className="flex items-center text-[#414b53]">
                <FaQuestionCircle className="text-[#03793d] mr-2" /> How long does support take to respond?
              </p>
              <p className="mt-2 text-sm text-gray-600">We usually respond within 24 hours.</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}