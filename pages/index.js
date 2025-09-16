import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { BiSkipNextCircle, BiSkipPreviousCircle } from "react-icons/bi";
import Layout from "../components/main/Layout";
import { ProductItem } from "../components/products/ProductItem";
import { generateMainPageJSONLD } from "../utils/seo";

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

// ----- Server-side (ISR) -----
import db from "../utils/db";
import Product from "../models/Product";
import { enrichAndSortForPublic } from "../utils/productSort";

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
      "each.quickBooksQuantityOnHandProduction": 1,
      "box.quickBooksQuantityOnHandProduction": 1,
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
    (p) =>
      (p.each?.wpPrice ?? 0) > 0 &&
      (p.each?.quickBooksQuantityOnHandProduction ?? 0) > 0
  );

  // Limit how many cards we send initially for mobile perf
  const HOME_COUNT = 9;
  const products = featured.slice(0, HOME_COUNT);

  return {
    props: { products: JSON.parse(JSON.stringify(products)) },
    revalidate: 300, // ISR every 5 minutes
  };
}

// ----- Client-only carousel (your original, kept intact) -----
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
    <div className='carousel-container' lang='en-US'>
      <button
        onClick={prevSlide}
        disabled={currentSlide === 0}
        className='w-full mt-3 flex items-center justify-center text-[#0e355e]'
      >
        <BiSkipPreviousCircle className='text-lg' /> Prev
      </button>

      <div
        className='carousel-items flex transition-transform duration-300'
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
      >
        {products.map((p) => (
          <div className='carousel-item px-3 lg:px-0' key={p._id}>
            <ProductItem product={p} />
          </div>
        ))}
      </div>

      <button
        onClick={nextSlide}
        disabled={currentSlide >= totalSlides - 1}
        className='w-full mt-3 flex items-center justify-center text-[#0e355e]'
      >
        Next <BiSkipNextCircle className='text-lg' />
      </button>
    </div>
  );
}

export default function Home({ products }) {
  // No client fetch; products already in the initial HTML (good for LCP/TTFB)
  return (
    <Layout schema={generateMainPageJSONLD(products)} products={products}>
      {/* Make sure your Banner image uses next/image with priority if it's your LCP */}
      <Banner />
      <StaticBanner />
      <Benefits className='mt-2' />

      <h2 className='section__title' id='products'>
        Featured Products
      </h2>

      {products.length > 0 ? (
        <Carousel products={products} />
      ) : (
        <p className='text-center mt-10'>No products available.</p>
      )}
      <div className='min-h-[534px] w-full'>
        <Contact className='mt-2' />
      </div>
    </Layout>
  );
}
