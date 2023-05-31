import Link from 'next/link';
import React from 'react';
import Image from 'next/image';

export const ProductItem = ({ product }) => {
  return (
    <div className="card">
      <Link href={`/products/${product.slug}`}>
        <Image
          src={product.image}
          alt={product.description}
          className="rounded shadow product-image"
          width={300}
          height={300}
        />
      </Link>
      <div className="flex flex-col justify-center items-center p-5">
        <Link href={`/products/${product.slug}`}>
          <h2 className="text-lg font-bold">
            {product.manufacturer}
            <br />
            {product.reference}
          </h2>
        </Link>
        <p className="text-sm text-gray-500 mb-2">{product.manufacturer}</p>
        <p className="text-sm text-gray-500">${product.price}</p>
        <button className="primary-button" type="button">
          Add to Cart
        </button>
      </div>
    </div>
  );
};
