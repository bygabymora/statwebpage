// pages/index.js
import React, { useState, useEffect } from "react";
import Layout from "../components/main/Layout";
import { ProductItem } from "../components/products/ProductItem";
import Banner from "../components/Banner";
import StaticBanner from "../components/StaticBanner";
import Contact from "../components/contact/Contact";
import { BiSkipNextCircle, BiSkipPreviousCircle } from "react-icons/bi";
import Benefits from "./slider";

function Carousel({ products }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [visibleItems, setVisibleItems] = useState(3);
  const [totalSlides, setTotalSlides] = useState(7);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [mouseStartX, setMouseStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // adapt slide count by width
  useEffect(() => {
    const updateTotals = () => {
      if (window.innerWidth < 768) {
        setVisibleItems(1);
        setTotalSlides(9);
      } else {
        setVisibleItems(3);
        setTotalSlides(7);
      }
    };
    updateTotals();
    window.addEventListener("resize", updateTotals);
    return () => window.removeEventListener("resize", updateTotals);
  }, []);

  // auto-advance
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

  const prevSlide = () => {
    setCurrentSlide((s) => Math.max(s - 1, 0));
  };
  const nextSlide = () => {
    setCurrentSlide((s) => (s + 1 < totalSlides ? s + 1 : 0));
  };

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
        className='w-full mt-3 flex items-center justify-center text-[#144e8b]'
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
        className='w-full mt-3 flex items-center justify-center text-[#144e8b]'
      >
        Next <BiSkipNextCircle className='text-lg' />
      </button>
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filtered = products
    .filter(
      (p) =>
        p.each?.wpPrice > 0 && p.each?.quickBooksQuantityOnHandProduction > 0
    )
    .slice(0, 9);

  return (
    <Layout>
      <Banner />
      <StaticBanner />
      <Benefits className='mt-2' />

      <h2 className='section__title' id='products'>
        Featured Products
      </h2>

      {loading ? (
        <p className='text-center mt-10'>Loading products…</p>
      ) : filtered.length > 0 ? (
        <Carousel products={filtered} />
      ) : (
        <p className='text-center mt-10'>No products available.</p>
      )}

      <Contact className='mt-2' />
    </Layout>
  );
}
