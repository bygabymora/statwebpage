import React, { useState, useEffect } from "react";
import Image from "next/image";
import Head from "next/head";
import Banner1 from "../public/images/assets/banner1.jpg";
import Banner2 from "../public/images/assets/banner2.svg";
import Banner3 from "../public/images/assets/banner3.webp";
import Link from "next/link";

// Inline SVG icons — eliminates react-icons/fi and react-icons/ti from this chunk
function PhoneIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      width='1em'
      height='1em'
      aria-hidden='true'
    >
      <path
        d='M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

function CartIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox='0 0 24 24'
      fill='currentColor'
      width='1em'
      height='1em'
      aria-hidden='true'
    >
      <path d='M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z' />
    </svg>
  );
}

const Banner = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const banners = [Banner1, Banner2, Banner3];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Organization Schema for enhanced SEO
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "STAT Surgical Supply",
    url: "https://www.statsurgicalsupply.com",
    logo: "https://www.statsurgicalsupply.com/images/assets/logo.png",
    description:
      "Your trusted source for surgical supplies. High-quality surgical disposables, implants, and instruments at unmatched prices.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "US",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: "English",
    },
    sameAs: ["https://www.statsurgicalsupply.com"],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.statsurgicalsupply.com",
      },
    ],
  };

  return (
    <>
      <Head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema),
          }}
        />
        {/* Preload critical banner images for better LCP */}
        <link
          rel='preload'
          href={Banner1.src || Banner1}
          as='image'
          fetchpriority='high'
        />
        <link rel='preload' href={Banner2.src || Banner2} as='image' />
      </Head>
      <section
        className='text-title-color-dark text-center'
        aria-label='STAT Surgical Supply - Premium Healthcare Equipment'
        role='banner'
      >
        <div className='grid lg:grid-cols-2 md:grid-cols-1 banner-container mx-auto px-4 items-center'>
          {/* Main Content */}
          <header className='text-left -mt-6'>
            <h1 className='text-4xl font-bold mb-6 text-center text-[#0e355e] my-10'>
              Premium Surgical Supplies | STAT Surgical Supply
            </h1>

            <div className='text-[#414b53de] text-base font-normal text-center mb-6'>
              <p className='mb-4'>
                <strong>Your trusted source for surgical supplies</strong> -
                serving over 150+ healthcare facilities nationwide. We provide
                high-quality surgical disposables and instruments at unmatched
                competitive prices. Explore our comprehensive range of premium
                Surgical Supplies featuring industry-leading brands. Our
                cost-saving solutions are specifically tailored to meet your
                healthcare facility&apos;s unique needs with fast, reliable
                delivery and exceptional customer service.
              </p>
            </div>

            <nav
              className='flex flex-wrap gap-4 justify-center text-center w-full'
              role='navigation'
              aria-label='Primary actions'
            >
              <Link
                href='/products'
                className='w-full sm:w-auto'
                aria-label='Browse our complete catalog of surgical supplies'
                title='Shop Premium Surgical Supplies - Fast Delivery Available'
              >
                <button
                  className='w-full sm:w-auto bg-[#03793d] text-white px-6 py-3 rounded shadow-md hover:bg-green-700 transition-all flex items-center justify-center gap-3'
                  type='button'
                  aria-label='Shop surgical supplies'
                >
                  <CartIcon />
                  Shop Surgical Supplies
                </button>
              </Link>

              <Link
                href='/#contact'
                className='w-full sm:w-auto'
                aria-label='Contact STAT Surgical Supply for personalized assistance and quotes'
                title='Get Expert Consultation - Free Quotes Available'
              >
                <button
                  className='w-full sm:w-auto border border-[#03793d] text-[#03793d] px-6 py-3 rounded shadow-md hover:bg-[#03793d] hover:text-white transition-all flex items-center justify-center gap-3'
                  type='button'
                  aria-label='Contact our surgical supply experts'
                >
                  <PhoneIcon />
                  Get Free Quote
                </button>
              </Link>
            </nav>
          </header>

          <figure
            className='relative w-full max-w-[500px] aspect-[1/1] mx-auto'
            role='img'
            aria-label='Showcase of premium Surgical Supplies'
          >
            {banners.map((banner, index) => {
              const imageDescriptions = [
                "Premium Surgical Supplies for hospitals and clinics - featuring sterile instruments and high-quality healthcare supplies",
                "Professional Surgical Supplies catalog showing surgical tools, disposables, and hospital-grade instruments available for purchase",
                "Healthcare facility supplies including surgical disposables and sterile equipment for clinical use",
              ];

              return (
                <div
                  key={index}
                  className='absolute inset-0 transition-opacity duration-[1500ms] ease-in-out'
                  style={{
                    opacity: index === currentBanner ? 1 : 0,
                    pointerEvents: index === currentBanner ? "auto" : "none",
                  }}
                >
                  <Image
                    src={banner}
                    alt={imageDescriptions[index]}
                    title={`STAT Surgical Supply - ${
                      index === 0 ? "Premium Surgical Supplies"
                      : index === 1 ? "Surgical Instruments Catalog"
                      : "Healthcare Supplies Collection"
                    }`}
                    fill
                    priority={index === 0}
                    fetchPriority={index === 0 ? "high" : undefined}
                    sizes='(max-width: 768px) 330px, (max-width: 1024px) 500px, 500px'
                    className='rounded-lg object-cover'
                    loading={index === 0 ? "eager" : "lazy"}
                    quality={index === 0 ? 95 : 85}
                  />
                </div>
              );
            })}
            <figcaption className='sr-only'>
              Interactive showcase of premium surgical equipment, medical
              disposables, and healthcare supplies available from STAT Surgical
              Supply for hospitals, clinics, and healthcare facilities.
            </figcaption>
          </figure>
        </div>
      </section>
    </>
  );
};

export default Banner;
