import Layout from '../components/Layout.js';
import { ProductItem } from '../components/ProductItem.js';
import React from 'react';
import Banner from '../components/Banner';
import Contact from '../components/contact/Contact';
import StaticBanner from '../components/StaticBanner';
import Product from '../models/Product.js';
import db from '../utils/db.js';
import { BiSkipNextCircle, BiSkipPreviousCircle } from 'react-icons/bi';

function Carousel({ products }) {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [visibleItems, setVisibleItems] = React.useState(3);
  const [totalSlides, setTotalSlides] = React.useState(7); // default to a larger screen size
  const [touchStartX, setTouchStartX] = React.useState(0);
  const [touchEndX, setTouchEndX] = React.useState(0);

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX - touchEndX > 75) {
      // if swipe left for over 75px
      nextSlide();
    }

    if (touchEndX - touchStartX > 75) {
      // if swipe right for over 75px
      prevSlide();
    }
  };

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) {
        setTotalSlides(9);
      } else {
        setTotalSlides(7);
      }
    }
  }, []);

  const prevSlide = () => {
    setCurrentSlide((oldSlide) => Math.max(oldSlide - 1, 0));
  };

  const nextSlide = React.useCallback(() => {
    setCurrentSlide((oldSlide) => {
      if (oldSlide + 1 < totalSlides) {
        return oldSlide + 1;
      } else {
        return 0; // Return to the first slide when you reach the end
      }
    });
  }, [totalSlides]);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setVisibleItems(1);
      } else {
        setVisibleItems(3);
      }
    };

    handleResize(); // Call on initial render
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Auto-play
  React.useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 3000); // 3 seconds interval

    return () => clearInterval(interval); // Clear the interval when the component unmounts
  }, [nextSlide]);

  return (
    <div className="carousel-container ">
      <button
        onClick={prevSlide}
        disabled={currentSlide === 0}
        className="w-full mt-3 flex flex-row items-center justify-center"
      >
        <BiSkipPreviousCircle className="text-lg" />
        &nbsp;Prev
      </button>
      <div
        className="carousel-items"
        style={{
          transform: `translateX(-${currentSlide * (100 / visibleItems)}%)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {products.map((product) => (
          <div className="carousel-item px-3 lg:px-0" key={product.slug}>
            <ProductItem product={product} />
          </div>
        ))}
      </div>

      <button
        onClick={nextSlide}
        disabled={currentSlide >= totalSlides - 1}
        className="w-full mt-3 flex flex-row items-center justify-center card"
      >
        Next &nbsp; <BiSkipNextCircle className="text-lg" />
      </button>
    </div>
  );
}

export default function Home({ products }) {
  const filteredProducts = products
    .filter(
      (product) =>
        product.countInStock > 0 ||
        product.countInStockBulk > 0 ||
        product.countInStockClearance > 0
    )
    .slice(0, 9);

  return (
    <Layout title="STAT Surgical Supply">
      <StaticBanner />
      <Banner />
      <h2 className="section__title" id="products">
        Featured Products
      </h2>
      <Carousel products={filteredProducts} />
      <Contact className="mt-2" />
    </Layout>
  );
}

export async function getServerSideProps() {
  await db.connect();
  const products = await Product.find().lean();
  return {
    props: {
      products: products.map(db.convertDocToObj),
    },
  };
}
