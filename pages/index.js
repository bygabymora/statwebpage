import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { BiSkipNextCircle, BiSkipPreviousCircle } from "react-icons/bi";
import Layout from "../components/main/Layout"; // we keep it SSR
import { ProductItem } from "../components/products/ProductItem";

// We dynamically load “large” components
const Banner = dynamic(() => import("../components/Banner"), { ssr: false });
const StaticBanner = dynamic(() => import("../components/StaticBanner"), {
  ssr: false,
});
const Benefits = dynamic(() => import("./slider"), { ssr: false });
const Contact = dynamic(() => import("../components/contact/Contact"), {
  ssr: true,
});

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

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxItems, setMaxItems] = useState(9);

  // fetch data
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

  useEffect(() => {
    const onResize = () => {
      setMaxItems(window.innerWidth < 768 ? 9 : 9);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const filtered = products
    .filter(
      (p) =>
        p.each?.wpPrice > 0 && p.each?.quickBooksQuantityOnHandProduction > 0
    )
    .slice(0, maxItems);
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
      <div className='min-h-[534px] w-full'>
        <Contact className='mt-2' />
      </div>
    </Layout>
  );
}
