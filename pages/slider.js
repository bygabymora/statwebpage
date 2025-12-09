// pages/slider.js

import React from "react";
import {
  FaBoxOpen,
  FaDollarSign,
  FaHeadset,
  FaShieldAlt,
} from "react-icons/fa";
import Link from "next/link";
import { motion } from "framer-motion";
import { generateServicePageJSONLD } from "../utils/seo";

const benefits = [
  {
    icon: <FaDollarSign />,
    title: "Guaranteed Savings on Premium Surgical Supplies",
    description:
      "Designed for out-of-contract procurement, discontinued SKUs, and urgent supply needs when primary distributors cannot fulfill orders, while delivering savings of up to 50% on surgical disposables.",
    extra: {
      heading: "Ideal for:",
      bullets: [
        "Out-of-contract hospital purchasing",
        "Discontinued and hard-to-source OEM SKUs",
        "Cost containment initiatives",
        "Urgent surgical demand coverage",
      ],
    },
    link: "/savings",
    ariaLabel:
      "Learn about guaranteed savings on surgical supplies and medical equipment",
    keywords:
      "surgical supplies savings, bulk medical equipment pricing, healthcare cost reduction",
  },
  {
    icon: <FaBoxOpen />,
    title: "In-Stock Medical Products with Next-Day Shipping",
    description:
      "Next-Day shipping applies to in-stock items confirmed before cutoff time. Expedited and overnight options are available based on destination.",
    extra: {
      heading: "Shipping support includes:",
      bullets: [
        "Same-day processing for confirmed inventory",
        "Next-day and expedited shipping options",
        "Nationwide U.S. delivery",
        "Clear cutoff times per shipment method",
      ],
    },
    link: "/products",
    ariaLabel:
      "Browse our complete inventory of medical supplies with fast delivery",
    keywords:
      "in-stock surgical products, fast medical supply delivery, nationwide shipping",
  },
  {
    icon: <FaShieldAlt />,
    title: "Secure Healthcare Equipment Trading Process",
    description:
      "Buy or sell surgical products through our verified, secure platform for medical professionals and healthcare institutions. All products are unused, sealed, and sourced from verified U.S. healthcare facilities and OEM-approved channels.",
    extra: {
      heading: "Compliance standards:",
      bullets: [
        "Unused and factory-sealed products only",
        "OEM-compatible and verified sourcing",
        "U.S.-based healthcare facilities",
        "Quality and expiration date controls",
      ],
    },
    link: "/selling",
    ariaLabel:
      "Learn about our secure process for buying and selling medical equipment",
    keywords:
      "secure medical equipment trading, verified surgical supply marketplace",
  },
  {
    icon: <FaHeadset />,
    title: "Expert Support for Healthcare Professionals",
    description:
      "STAT complements primary distributor relationships by providing healthcare professionals with rapid response support for urgent, complex, or hard-to-source requests.",
    extra: {
      heading: "Support scenarios:",
      bullets: [
        "Backorders and supply interruptions",
        "Urgent procedural requirements",
        "Discontinued or constrained SKUs",
        "Short-notice surgical scheduling",
      ],
    },
    link: "/support",
    ariaLabel: "Contact our expert support team for personalized assistance",
    keywords:
      "medical supply support, healthcare equipment consultation, surgical supply experts",
  },
];

const variants = {
  hidden: { opacity: 0, x: 100 }, // starts shifted to the right and hidden
  show: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.3,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

export default function BenefitsSection() {
  // Generate comprehensive schema markup
  const servicesPageSchema = generateServicePageJSONLD(
    "Healthcare Supply Services Overview",
    "slider",
    "Discover why over 150+ healthcare professionals choose STAT Surgical Supply for premium surgical disposables, medical equipment, and exceptional healthcare solutions with guaranteed savings and expert support."
  );

  return (
    <div
      title='Why Choose STAT Surgical Supply | Healthcare Benefits & Services'
      description='Discover why over 150+ healthcare professionals choose STAT Surgical Supply for guaranteed savings, in-stock medical products with next-day shipping, secure trading processes, and expert support for all surgical supply needs.'
      schema={[servicesPageSchema]}
    >
      <main className='w-full bg-white my-5 px-6'>
        <section
          className='max-w-6xl mx-auto'
          aria-labelledby='benefits-heading'
          role='region'
        >
          <header className='text-center mb-12'>
            <h1
              id='benefits-heading'
              className='text-4xl font-bold text-[#0e355e] leading-tight'
              itemProp='headline'
            >
              Why Healthcare Professionals Choose STAT Surgical Supply
            </h1>
            <p className='sr-only'>
              STAT Surgical Supply operates as a secondary and contingency
              medical supplier, supporting hospitals and surgical centers when
              primary distributors are unable to meet urgency, availability, or
              cost requirements.
            </p>
            <p
              className='text-[#414b53] text-base font-normal mt-4 max-w-3xl mx-auto'
              itemProp='description'
            >
              Discover why over 150+ clinics, hospitals, and medical
              professionals trust STAT Surgical Supply for premium surgical
              disposables, medical equipment, and exceptional healthcare
              solutions nationwide.
            </p>
          </header>

          <section
            className='grid grid-cols-1 md:grid-cols-2 gap-8 mt-12'
            role='list'
            aria-label='Key benefits of STAT Surgical Supply services'
          >
            {benefits.map((benefit, index) => (
              <motion.article
                key={benefit.title}
                className='p-6 bg-white rounded-xl shadow-lg flex flex-col items-center transform transition duration-300 hover:scale-105 group'
                initial='hidden'
                whileInView='show'
                viewport={{ once: true, amount: 0.2 }}
                custom={index}
                variants={variants}
                role='listitem'
                itemScope
                itemType='https://schema.org/Service'
              >
                <div
                  className='text-5xl text-[#07783e] mb-4 transform transition-transform duration-300 group-hover:scale-110'
                  aria-hidden='true'
                  role='presentation'
                >
                  {benefit.icon}
                </div>

                <div className='text-center flex-1'>
                  <h2
                    className='text-xl font-bold text-[#0e355e] mb-3'
                    itemProp='name'
                  >
                    {benefit.title}
                  </h2>

                  <p
                    className='text-[#414b53] text-sm mb-4 leading-relaxed'
                    itemProp='description'
                  >
                    {benefit.description}
                  </p>

                  {benefit.extra && (
                    <div className='benefit-extra mt-4 text-left'>
                      <p className='text-sm font-bold text-[#0e355e] mb-2'>
                        {benefit.extra.heading}
                      </p>
                      <ul className='list-disc list-inside text-sm text-[#414b53] space-y-1'>
                        {benefit.extra.bullets.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Link
                    href={benefit.link}
                    className='inline-block mt-4 px-6 py-2 bg-[#07783e] text-white font-bold rounded-lg shadow-md hover:bg-[#065f2d] transition-all duration-300'
                    aria-label={benefit.ariaLabel}
                    title={`Learn more about ${benefit.title.toLowerCase()}`}
                    itemProp='url'
                  >
                    Learn More →
                  </Link>
                  <meta itemProp='keywords' content={benefit.keywords} />
                </div>
              </motion.article>
            ))}
          </section>
        </section>
      </main>
    </div>
  );
}
