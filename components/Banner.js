import React, { useState, useEffect } from "react";
import Image from "next/image";
import Head from "next/head";
import Banner1 from "../public/images/assets/banner1.jpg";
import Banner2 from "../public/images/assets/banner2.svg";
import Banner3 from "../public/images/assets/banner3.webp";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiPhoneForwarded } from "react-icons/fi";
import { TiShoppingCart } from "react-icons/ti";

const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: "easeOut" },
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.2, ease: "easeOut" },
  },
};

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
      <motion.section
        className='text-title-color-dark text-center'
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
        aria-label='STAT Surgical Supply - Premium Healthcare Equipment'
        role='banner'
      >
        <div className='grid lg:grid-cols-2 md:grid-cols-1 banner-container mx-auto px-4 items-center'>
          {/* Main Content */}
          <motion.header
            className='text-left -mt-6'
            variants={containerVariants}
          >
            <h1 className='text-4xl font-bold mb-6 text-center text-[#0e355e] my-10'>
              Premium Surgical Supplies & Medical Equipment | STAT Surgical
              Supply
            </h1>

            <div className='text-[#414b53de] text-base font-normal text-center mb-6'>
              <p className='mb-4'>
                <strong>Your trusted source for surgical supplies</strong> -
                serving over 150+ healthcare facilities nationwide. We provide
                high-quality surgical disposables and instruments at unmatched
                competitive prices. Explore our comprehensive range of premium
                medical equipment featuring industry-leading brands. Our
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
                aria-label='Browse our complete catalog of surgical supplies and medical equipment'
                title='Shop Premium Surgical Supplies - Fast Delivery Available'
              >
                <motion.button
                  className='w-full sm:w-auto bg-[#03793d] text-white px-6 py-3 rounded shadow-md hover:bg-green-700 transition-all flex items-center justify-center gap-3'
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type='button'
                  aria-label='Shop surgical supplies and medical equipment'
                >
                  <TiShoppingCart aria-hidden='true' />
                  Shop Now
                </motion.button>
              </Link>

              <Link
                href='/#contact'
                className='w-full sm:w-auto'
                aria-label='Contact STAT Surgical Supply for personalized assistance and quotes'
                title='Get Expert Consultation - Free Quotes Available'
              >
                <motion.button
                  className='w-full sm:w-auto border border-[#03793d] text-[#03793d] px-6 py-3 rounded shadow-md hover:bg-[#03793d] hover:text-white transition-all flex items-center justify-center gap-3'
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type='button'
                  aria-label='Contact our surgical supply experts'
                >
                  <FiPhoneForwarded aria-hidden='true' />
                  Get Free Quote
                </motion.button>
              </Link>
            </nav>
          </motion.header>

          <motion.figure
            className='relative w-full max-w-[500px] aspect-[1/1] mx-auto'
            variants={imageVariants}
            role='img'
            aria-label='Showcase of premium surgical equipment and medical supplies'
          >
            {banners.map((banner, index) => {
              const imageDescriptions = [
                "Premium surgical equipment and medical disposables for hospitals and clinics - featuring sterile instruments and high-quality healthcare supplies",
                "Professional medical equipment catalog showing surgical tools, disposables, and hospital-grade instruments available for purchase",
                "Healthcare facility supplies including surgical disposables, medical instruments, and sterile equipment for clinical use",
              ];

              return (
                <motion.div
                  key={index}
                  className='absolute inset-0'
                  initial={false}
                  animate={{ opacity: index === currentBanner ? 1 : 0 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  style={{
                    pointerEvents: index === currentBanner ? "auto" : "none",
                  }}
                >
                  <Image
                    src={banner}
                    alt={imageDescriptions[index]}
                    title={`STAT Surgical Supply - ${
                      index === 0 ? "Premium Medical Equipment"
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
                </motion.div>
              );
            })}
            <figcaption className='sr-only'>
              Interactive showcase of premium surgical equipment, medical
              disposables, and healthcare supplies available from STAT Surgical
              Supply for hospitals, clinics, and healthcare facilities.
            </figcaption>
          </motion.figure>
        </div>
      </motion.section>
    </>
  );
};

export default Banner;
