import React from "react";
import Layout from "../components/main/Layout";
import Image from "next/image";
import image from "../public/images/assets/about.svg";
import { useSpring, animated } from "react-spring";
import Link from "next/link";
import { BsChevronRight } from "react-icons/bs";

export default function AboutScreen() {
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
    <Layout title='About Us'>
      <nav className='text-sm text-gray-700'>
        <ul className='flex ml-0 lg:ml-20 items-center space-x-2'>
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={index} className='flex items-center'>
              {breadcrumb.href ? (
                <Link
                  href={breadcrumb.href}
                  className='hover:underline text-[#0e355e]'
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
      <div className='flex flex-col lg:flex-row items-center justify-center max-w-7xl mx-auto px-4 my-20 gap-10'>
        <animated.div
          className='block lg:hidden text-center'
          style={contentAnimation}
        >
          <h2 className='text-3xl font-bold text-[#0e355e] mb-4 -mt-10'>
            About Us
          </h2>
        </animated.div>
        <animated.div
          className='w-full lg:w-1/2 flex justify-center'
          style={imageAnimation}
        >
          <Image
            src={image}
            alt='About Us'
            title='About Us'
            className='w-64 sm:w-80 md:w-96 lg:w-[500px] xl:w-[550px] -mt-10'
            priority
          />
        </animated.div>
        <animated.div
          className='w-full lg:w-1/2 text-justify'
          style={contentAnimation}
        >
          <h1 className='hidden lg:block text-4xl font-bold text-[#0e355e] mb-6 -mt-10'>
            About Us
          </h1>
          <h3 className='text-[#414b53de] text-base font-normal'>
            Stat Surgical was founded to combat the rising costs of healthcare
            supply chains. Our company targets the &quot;small&quot; portion of
            &quot;off-contract&quot; purchases and backorders. Stat Surgical
            strictly focuses on sourcing safe, ethical products from trusted
            suppliers, US-based hospitals, and surgery centers. We source
            surgical disposables in original OEM packaging, sealed, long-dated,
            and strictly inspected by our trained quality control department.
            When doing business with Stat Surgical you can buy products by the
            &quot;each&quot;, or by the &quot;box&quot;. With 35+ years of
            surgical sales experience, the founders have a wealth of knowledge
            of cost savings and the ability to navigate healthcare systems and
            IDNs. As surgical disposable costs rise, numerous healthcare systems
            rely on us for cost savings. Our customers are &quot;priority
            one&quot;.
          </h3>
          <div className='mt-10 flex justify-start'>
            <Link href='/products'>
              <animated.button
                style={contentAnimation}
                className='px-6 py-3 bg-[#0e355e] hover:bg-[#144e8b] text-white font-semibold rounded-full shadow-md transition duration-300'
              >
                Explore Our Products
              </animated.button>
            </Link>
          </div>
        </animated.div>
      </div>
    </Layout>
  );
}
