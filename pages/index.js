import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { BiSkipNextCircle, BiSkipPreviousCircle } from "react-icons/bi";
import Layout from "../components/main/Layout";
import { ProductItem } from "../components/products/ProductItem";
import { motion } from "framer-motion";

// Render hero/above-the-fold on the server so LCP is discoverable
const Banner = dynamic(() => import("../components/Banner"), { ssr: true });
const StaticBanner = dynamic(() => import("../components/StaticBanner"), {
  ssr: true,
});
// This one can stay client-side if it's below the fold
const Benefits = dynamic(() => import("./slider"), { ssr: false });
const Contact = dynamic(() => import("../components/contact/Contact"), {
  ssr: true,
});
const NewsSection = dynamic(() => import("../components/NewsSection"), {
  ssr: true,
});

// ----- Server-side (ISR) -----
import db from "../utils/db";
import Product from "../models/Product";
import News from "../models/News";
import { enrichAndSortForPublic } from "../utils/productSort";
import ShippingCutoffTimer from "../components/timer";

export async function getStaticProps() {
  await db.connect(true);

  // Pull just what the home grid/cards need (keeps payload small)
  const raw = await Product.find(
    { approved: true, active: true },
    {
      name: 1,
      image: 1,
      manufacturer: 1,
      sentOvernigth: 1,
      "each.description": 1,
      "box.description": 1,
      "each.countInStock": 1,
      "box.countInStock": 1,
      "each.clearanceCountInStock": 1,
      "box.clearanceCountInStock": 1,
      "each.wpPrice": 1,
      "box.wpPrice": 1,
      "clearance.price": 1,
    }
  ).lean();

  // Same public ordering you described:
  // 0) stock+price, 1) stock w/o price, 2) out of stock
  const ordered = enrichAndSortForPublic(raw);

  // Home "featured": the same filter you had (each price > 0 AND in stock)
  const featured = ordered.filter(
    (p) => (p.each?.wpPrice ?? 0) > 0 && (p.each?.countInStock ?? 0) > 0
  );

  // Limit how many cards we send initially for mobile perf
  const HOME_COUNT = 9;
  const products = featured.slice(0, HOME_COUNT);

  // Fetch recent news for homepage integration
  const recentNews = await News.find()
    .sort({ createdAt: -1 })
    .limit(3)
    .select("title slug content imageUrl author createdAt category tags")
    .lean();

  const newsWithExcerpts = recentNews.map((news) => ({
    ...news,
    _id: news._id.toString(),
    createdAt: news.createdAt.toISOString(),
    excerpt: news.content
      ? news.content.replace(/<[^>]*>/g, "").slice(0, 150) + "..."
      : "",
  }));

  return {
    props: {
      products: JSON.parse(JSON.stringify(products)),
      news: newsWithExcerpts,
    },
    revalidate: 300, // ISR every 5 minutes
  };
}

// Variants of scrolling animations
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.8, ease: "easeOut" },
  }),
};

// Enhanced carousel component with SEO optimization
function Carousel({ products }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [visibleItems, setVisibleItems] = useState(3);
  const [totalSlides, setTotalSlides] = useState(7);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [mouseStartX, setMouseStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const updateTotals = () => {
      if (window.innerWidth < 768) {
        setVisibleItems(1);
        setTotalSlides(Math.max(products.length, 1));
      } else {
        setVisibleItems(3);
        setTotalSlides(Math.max(Math.ceil(products.length / 3), 1));
      }
    };
    updateTotals();
    window.addEventListener("resize", updateTotals);
    return () => window.removeEventListener("resize", updateTotals);
  }, [products.length]);

  useEffect(() => {
    if (isInteracting) return;
    const iv = setInterval(
      () => setCurrentSlide((s) => (s + 1) % totalSlides),
      3000
    );
    return () => clearInterval(iv);
  }, [isInteracting, totalSlides]);

  let interactionEndTimer;
  const handleInteractionStart = () => {
    clearTimeout(interactionEndTimer);
    setIsInteracting(true);
  };
  const handleInteractionEnd = () => {
    interactionEndTimer = setTimeout(() => setIsInteracting(false), 3000);
  };

  const prevSlide = () => setCurrentSlide((s) => Math.max(s - 1, 0));
  const nextSlide = () =>
    setCurrentSlide((s) => (s + 1 < totalSlides ? s + 1 : 0));

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
    handleInteractionStart();
  };
  const handleTouchMove = (e) => setTouchEndX(e.touches[0].clientX);
  const handleTouchEnd = () => {
    if (touchStartX - touchEndX > 75) nextSlide();
    else if (touchEndX - touchStartX > 75) prevSlide();
    handleInteractionEnd();
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setMouseStartX(e.clientX);
    setIsDragging(true);
    handleInteractionStart();
  };
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const delta = mouseStartX - e.clientX;
    if (delta > 75) nextSlide();
    else if (delta < -75) prevSlide();
  };
  const handleMouseUp = () => {
    setIsDragging(false);
    handleInteractionEnd();
  };

  return (
    <motion.section
      className='carousel-container'
      initial='hidden'
      whileInView='show'
      viewport={{ once: true, amount: 0.2 }}
      aria-label='Featured surgical supplies and medical equipment carousel'
      role='region'
    >
      <nav
        className='flex justify-center mb-4'
        role='navigation'
        aria-label='Product carousel navigation'
      >
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className='w-full mt-3 flex items-center justify-center text-[#0e355e] rounded disabled:opacity-50'
          aria-label={`Go to previous page of products (currently showing page ${
            currentSlide + 1
          } of ${totalSlides})`}
          title='Previous products'
        >
          <BiSkipPreviousCircle className='text-lg' aria-hidden='true' />{" "}
          Previous
        </button>
      </nav>

      <div
        className='carousel-items flex transition-transform duration-500'
        style={{
          transform: `translateX(-${currentSlide * (100 / visibleItems)}%)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseEnter={handleInteractionStart}
        onMouseLeave={handleMouseUp}
        role='list'
        aria-label='Featured medical products'
      >
        {products.map((p, i) => (
          <motion.div
            key={p._id}
            className='carousel-item px-3 lg:px-0'
            variants={fadeInUp}
            custom={i}
            role='listitem'
          >
            <ProductItem product={p} />
          </motion.div>
        ))}
      </div>

      <nav
        className='flex justify-center mt-4'
        role='navigation'
        aria-label='Product carousel navigation'
      >
        <button
          onClick={nextSlide}
          disabled={currentSlide >= totalSlides - 1}
          className='w-full mt-3 flex items-center justify-center text-[#0e355e] rounded disabled:opacity-50'
          aria-label={`Go to next page of products (currently showing page ${
            currentSlide + 1
          } of ${totalSlides})`}
          title='Next products'
        >
          Next <BiSkipNextCircle className='text-lg' aria-hidden='true' />
        </button>
      </nav>
    </motion.section>
  );
}

export default function Home({ products, news = [] }) {
  return (
    <>
      <Layout
        title='Premium Surgical Supplies & Medical Equipment | STAT Surgical Supply'
        description='Discover premium surgical supplies and medical equipment trusted by 150+ healthcare facilities. Save up to 50% on surgical disposables with same-day shipping nationwide. Stay updated with the latest healthcare news and industry insights.'
      >
        <div>
          <div className='my-5 -mt-2'>
            <ShippingCutoffTimer />
          </div>
          <motion.div
            initial='hidden'
            whileInView='show'
            viewport={{ once: true }}
          >
            <Banner />
          </motion.div>

          <motion.div
            initial='hidden'
            whileInView='show'
            viewport={{ once: true }}
          >
            <StaticBanner />
          </motion.div>

          <motion.div
            initial='hidden'
            whileInView='show'
            viewport={{ once: true }}
          >
            <Benefits className='mt-2' />
          </motion.div>

          {news && news.length > 0 && (
            <motion.div
              initial='hidden'
              whileInView='show'
              viewport={{ once: true }}
            >
              <NewsSection news={news} />
            </motion.div>
          )}

          <section
            aria-labelledby='featured-products-heading'
            className='mt-10'
          >
            <motion.header
              className='text-center mb-8'
              variants={fadeInUp}
              initial='hidden'
              whileInView='show'
              viewport={{ once: true }}
            >
              <h2
                id='featured-products-heading'
                className='section__title text-center text-3xl font-bold text-[#0e355e]'
              >
                Featured Premium Surgical Supplies & Medical Equipment
              </h2>
              <p className='text-[#414b53de] text-base font-normal mt-4 max-w-3xl mx-auto'>
                Explore our most trusted surgical disposables and medical
                instruments, carefully selected for their quality and
                reliability by healthcare professionals nationwide.
              </p>
            </motion.header>

            {products.length > 0 ? (
              <Carousel products={products} />
            ) : (
              <div className='text-center mt-10 p-8 bg-gray-50 rounded-lg'>
                <p className='text-gray-600 text-lg'>
                  No featured products are currently available.
                </p>
                <p className='text-gray-500 text-sm mt-2'>
                  Please check back later or browse our full catalog.
                </p>
              </div>
            )}
          </section>

          <motion.div
            className='min-h-[534px] w-full'
            initial='hidden'
            whileInView='show'
            viewport={{ once: true }}
          >
            <Contact className='mt-2' />
          </motion.div>
        </div>
      </Layout>
    </>
  );
}
