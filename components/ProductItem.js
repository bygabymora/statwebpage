import Link from 'next/link';
import React, { useState } from 'react';
import Image from 'next/image';
import { Store } from '../utils/Store';
import { useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const ProductItem = ({ product }) => {
  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const [isOutOfStock, setIsOutOfStock] = useState(false);

  const addToCartHandler = async () => {
    const exisItem = cart.cartItems.find((x) => x.slug === product.slug);
    let quantity = exisItem ? exisItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);

    if (data.countInStock < quantity) {
      setIsOutOfStock(true);
      return;
    }
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });

    toast.success('Item added to cart');

    if (product.countInStock < quantity) {
      alert("Sorry, we don't have enough of that item in stock.");

      return quantity;
    }
  };

  return (
    <div className="card">
      <Link href={{ pathname: `products/${product.slug}` }}>
        <Image
          src={`${product.image}`}
          alt={product.description}
          className="product-image"
          width={300}
          height={300}
        />
      </Link>
      <div className="flex flex-col justify-center items-center p-5">
        <Link href={{ pathname: `products/${product.slug}` }}>
          <h2 className="font-bold">
            {product.manufacturer}
            <br />
            {product.slug}
          </h2>
        </Link>
        <p className="text-sm text-gray-500 mb-2">{product.manufacturer}</p>
        <p className="text-sm text-gray-500">${product.price}</p>
        <button
          className="primary-button align-middle mt-2"
          type="button"
          onClick={addToCartHandler}
          disabled={product.countInStock === 0 || isOutOfStock}
        >
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
        {isOutOfStock && (
          <form className="text-center ">
            <label className="mt-3 font-bold ">Join our waiting List</label>
            <input
              type="text"
              placeholder="Name"
              className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
            />
            <button className="primary-button mt-3" type="submit">
              Submit
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
