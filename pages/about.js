import React from "react";
import Layout from "../components/main/Layout";
import Image from "next/image";
import image from "../public/images/assets/about.svg";
import { useSpring, animated } from "react-spring";
import Link from "next/link";
import { BsChevronRight } from "react-icons/bs";
import {
  generateAboutPageJSONLD,
  generateOrganizationJSONLD,
} from "../utils/seo";

export default function AboutScreen() {
  const aboutSchema = generateAboutPageJSONLD();
  const orgSchema = generateOrganizationJSONLD();

  const imageAnimation = useSpring({
    opacity: 1,
    transform: "translateY(0)",
    from: { opacity: 0, transform: "translateY(100px)" },
    config: { duration: 1000 },
  });

  const contentAnimation = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    delay: 500,
    config: { duration: 800 },
  });

  const breadcrumbs = [{ href: "/", name: "Home" }, { name: "About Us" }];

  return (
    <Layout
      title='About STAT Surgical Supply - Premium Medical Equipment Provider'
      description='Learn about STAT Surgical Supply, a leading provider of premium surgical equipment and medical disposables serving 150+ healthcare facilities nationwide with cost-effective solutions.'
      schema={[aboutSchema, orgSchema]}
    >
      <nav className='text-sm text-gray-700' aria-label='Breadcrumb navigation'>
        <ul className='flex ml-0 lg:ml-20 items-center space-x-2'>
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={index} className='flex items-center'>
              {breadcrumb.href ? (
                <Link
                  href={breadcrumb.href}
                  className='hover:underline text-[#0e355e] focus:outline-none focus:ring-2 focus:ring-[#0e355e] focus:ring-opacity-50 rounded'
                  aria-label={`Go to ${breadcrumb.name} page`}
                >
                  {breadcrumb.name}
                </Link>
              ) : (
                <span aria-current='page'>{breadcrumb.name}</span>
              )}
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
      <div className='flex flex-col lg:flex-row items-center justify-center max-w-7xl mx-auto px-4 my-20 gap-10'>
        <animated.header
          className='block lg:hidden text-center'
          style={contentAnimation}
        >
          <h2 className='text-3xl font-bold text-[#0e355e] mb-4 -mt-10'>
            About STAT Surgical Supply
          </h2>
          <p className='text-lg text-[#414b53de] mt-2'>
            Your trusted partner in premium surgical equipment and medical
            supplies
          </p>
        </animated.header>

        <animated.figure
          className='w-full lg:w-1/2 flex justify-center'
          style={imageAnimation}
        >
          <Image
            src={image}
            alt='STAT Surgical Supply team and facilities - Premium medical equipment provider serving healthcare professionals nationwide'
            title='About STAT Surgical Supply - Medical Equipment Experts'
            className='w-64 sm:w-80 md:w-96 lg:w-[500px] xl:w-[550px] -mt-10'
            priority
            width={550}
            height={400}
          />
          <figcaption className='sr-only'>
            Visual representation of STAT Surgical Supply&apos;s commitment to
            providing premium medical equipment and surgical supplies to
            healthcare facilities.
          </figcaption>
        </animated.figure>

        <animated.article
          className='w-full lg:w-1/2 text-justify'
          style={contentAnimation}
        >
          <header className='hidden lg:block mb-6'>
            <h1 className='text-4xl font-bold text-[#0e355e] mb-3 -mt-10'>
              About STAT Surgical Supply
            </h1>
          </header>

          <section className='text-[#414b53de] text-base font-normal leading-relaxed space-y-4'>
            <p>
              <strong>STAT Surgical Supply</strong> was founded with a clear
              mission: to combat the rising costs of healthcare supply chains
              while maintaining the highest standards of quality and safety. Our
              company specializes in targeting the critical gap in
              &quot;off-contract&quot; purchases and backorders that challenge
              healthcare facilities daily.
            </p>

            <p>
              We strictly focus on sourcing <em>safe, ethical products</em> from
              trusted suppliers, US-based hospitals, and accredited surgery
              centers. Every surgical disposable we offer comes in original OEM
              packaging, factory-sealed, with extended expiration dates, and
              undergoes rigorous inspection by our trained quality control
              department.
            </p>

            <p>
              Our flexible purchasing options allow healthcare facilities to buy
              products individually (&quot;each&quot;) or in bulk quantities
              (&quot;by the box&quot;), providing the flexibility needed for
              efficient inventory management.
            </p>

            <p>
              With over{" "}
              <strong>35 years of combined surgical sales experience</strong>,
              our founders bring unparalleled expertise in cost savings
              strategies and the ability to navigate complex healthcare systems
              and IDNs. As surgical disposable costs continue to rise, numerous
              healthcare systems rely on our proven cost-saving solutions.
            </p>

            <p className='text-[#0e355e] font-semibold text-lg'>
              At STAT Surgical Supply, our customers are &quot;priority
              one&quot; - always.
            </p>
          </section>

          <footer className='mt-10 flex justify-start'>
            <Link
              href='/products'
              aria-label='Browse our complete catalog of premium surgical supplies and medical equipment'
            >
              <animated.button
                style={contentAnimation}
                className='px-6 py-3 bg-[#0e355e] hover:bg-[#144e8b] text-white font-semibold rounded-full shadow-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-[#144e8b] focus:ring-opacity-50'
                type='button'
              >
                Explore Our Premium Products
              </animated.button>
            </Link>
          </footer>
        </animated.article>
      </div>
    </Layout>
  );
}
