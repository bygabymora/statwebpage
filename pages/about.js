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
      <div className='grid lg:grid-cols-2 md:grid-cols-1 banner-container mx-auto items-center lg:h-screen lg:items-center lg:justify-center my-20'>
        <animated.div className='image-container' style={imageAnimation}>
          <Image src={image} alt='About Us' className='about-image' />
        </animated.div>{" "}
        <animated.div className='content-container' style={contentAnimation}>
          <h2 className='section__title'> About Us</h2>
          <p className='about-content'>
            Stat Surgical was founded to combat the rising costs of healthcare
            supply chains. Our company targets the &quot;small &quot; portion of
            &quot;off-contract&quot; purchases and backorders. Stat Surgical
            strictly focuses on sourcing safe, ethical products from trusted
            suppliers, US-based hospitals, and surgery centers. We source
            surgical disposables in original OEM packaging, sealed, long-dated,
            and strictly inspected by our trained quality control department.
            When doing business with Stat Surgical you can buy products by the
            &quot;each &quot;, or by the &quot;box &quot;. With 35+ years of
            surgical sales experience, the founders have a wealth of knowledge
            of cost savings and the ability to navigate healthcare systems and
            IDNs. As surgical disposable costs rise, numerous healthcare systems
            rely on us for cost savings. Our customers are &quot;priority one
            &quot;.
          </p>
        </animated.div>
      </div>
    </Layout>
  );
}
