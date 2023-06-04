import Link from 'next/link';
import React, { useState } from 'react';
import Image from 'next/image';
import { Store } from '../utils/Store';
import { useContext } from 'react';

export const ProductItem = ({ product }) => {
  const { state, dispatch } = useContext(Store);
  const [isOutOfStock, setIsOutOfStock] = useState(false);

  const addToCartHandler = () => {
    const exisItem = state.cart.cartItems.find((x) => x.slug === product.slug);
    let quantity = exisItem ? exisItem.quantity + 1 : 1;
    if (product.countInStock < quantity) {
      setIsOutOfStock(true);
      return;
    }
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });

    if (product.countInStock < quantity) {
      alert("Sorry, we don't have enough of this item in stock.");

      return quantity;
    }
  };

  return (
    <div className="card">
      <Link href={{ pathname: `products/${product.slug}` }}>
        <Image
          src={`${product.image}`}
          alt={product.description}
          className="rounded shadow product-image"
          width={300}
          height={300}
        />
      </Link>
      <div className="flex flex-col justify-center items-center p-5">
        <Link href={{ pathname: `products/${product.slug}` }}>
          <h2 className="text-lg font-bold">
            {product.manufacturer}
            <br />
            {product.reference}
          </h2>
        </Link>
        <p className="text-sm text-gray-500 mb-2">{product.manufacturer}</p>
        <p className="text-sm text-gray-500">${product.price}</p>
        <button
          className="primary-button"
          type="button"
          onClick={addToCartHandler}
          disabled={product.countInStock === 0 || isOutOfStock}
        >
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};
