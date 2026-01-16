// components/products/RelatedProducts.js

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ProductItemPage } from "./ProductItemPage";

const RelatedProducts = ({ currentProduct, limit = 4 }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!currentProduct || !currentProduct._id) {
        setLoading(false);
        return;
      }

      // Clear any existing timeout
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }

      // Debounce the API call by 300ms
      fetchTimeoutRef.current = setTimeout(async () => {
        try {
          setLoading(true);
          setError(null);

          const response = await axios.get(
            `/api/products/related/${currentProduct._id}`,
            {
              timeout: 10000, // 10 second timeout
              headers: {
                "Cache-Control": "no-cache",
              },
            }
          );

          // Filter out the current product from the related products
          const filteredProducts = response.data.filter(
            (product) => product._id !== currentProduct._id
          );

          // Limit the results to the specified number
          const limitedProducts = filteredProducts.slice(0, limit);
          setRelatedProducts(limitedProducts);
        } catch (err) {
          console.error("Error fetching related products:", err);
          const errorMessage =
            err.response?.data?.message ||
            err.message ||
            "Failed to load related products";
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      }, 300);
    };

    fetchRelatedProducts();

    // Cleanup timeout on unmount
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [currentProduct, limit]);

  if (loading) {
    return (
      <div className='bg-gray-50 p-6 rounded-lg'>
        <h3 className='text-lg font-semibold text-[#144e8b] mb-4'>
          Related Products from {currentProduct?.manufacturer}
        </h3>
        <div className='flex items-center justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#144e8b]'></div>
          <span className='ml-3 text-gray-600'>
            Loading related products...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-gray-50 p-6 rounded-lg'>
        <h3 className='text-lg font-semibold text-[#144e8b] mb-4'>
          Related Products from {currentProduct?.manufacturer}
        </h3>
        <div className='text-center py-8'>
          <p className='text-gray-600'>{error}</p>
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return (
      <div className='bg-gray-50 p-6 rounded-lg'>
        <h3 className='text-lg font-semibold text-[#144e8b] mb-4'>
          Related Products from {currentProduct?.manufacturer}
        </h3>
        <div className='text-center py-8'>
          <p className='text-gray-600'>
            No other products found from {currentProduct?.manufacturer} at this
            time.
          </p>
          <p className='text-sm text-gray-500 mt-2'>
            Check back later or browse our complete product catalog.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-gray-50 p-6 rounded-lg'>
      <h3 className='text-lg font-semibold text-[#144e8b] mb-4'>
        Related Products from {currentProduct?.manufacturer}
      </h3>

      {/* Desktop Grid Layout */}
      <div className='hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {relatedProducts.map((product, index) => (
          <div key={product._id} className='bg-white rounded-lg shadow-sm'>
            <ProductItemPage product={product} index={index} />
          </div>
        ))}
      </div>

      {/* Mobile Horizontal Scroll Layout */}
      <div className='md:hidden'>
        <div className='flex overflow-x-auto space-x-4 pb-4 -mx-2 px-2 custom-scrollbar'>
          {relatedProducts.map((product, index) => (
            <div
              key={product._id}
              className='flex-shrink-0 w-64 bg-white rounded-lg shadow-sm'
            >
              <ProductItemPage product={product} index={index} />
            </div>
          ))}
        </div>

        {/* Scroll indicator for mobile */}
        <div className='flex justify-center mt-2'>
          <p className='text-xs text-gray-500'>Swipe to see more products →</p>
        </div>
      </div>

      {/* Show total count */}
      <div className='mt-4 text-center'>
        <p className='text-sm text-gray-600'>
          Showing {relatedProducts.length} of {relatedProducts.length} related
          products
          {relatedProducts.length === limit && " (limited view)"}
        </p>
      </div>
    </div>
  );
};

export default RelatedProducts;
