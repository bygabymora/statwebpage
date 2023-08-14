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
  const [qty, setQty] = useState(1);
  const [purchaseType, setPurchaseType] = useState('Each'); // defaulting to 'Each'
  const [currentPrice, setCurrentPrice] = useState(product.price);
  const [currentDescription, setCurrentDescription] = useState(
    product.description
  );
  const [currentCountInStock, setCurrentCountInStock] = useState(
    product.countInStock
  );

  const addToCartHandler = async () => {
    const exisItem = cart.cartItems.find((x) => x.slug === product.slug);
    const quantity = exisItem ? exisItem.quantity + qty : qty;
    const { data } = await axios.get(`/api/products/${product._id}`);

    if (data.countInStock < quantity) {
      setIsOutOfStock(true);
      return;
    }
    dispatch({
      type: 'CART_ADD_ITEM',
      payload: {
        ...product,
        quantity,
        purchaseType,
        sentOverNight: product.sentOverNight,
        price: currentPrice,
        description: currentDescription,
        countInStock: currentCountInStock,
      },
    });

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
          width={400}
          height={500}
        />
      </Link>
      <div className="flex flex-col justify-center items-center p-5">
        <Link href={{ pathname: `products/${product.slug}` }}>
          <h2 className="font-bold">
            {product.reference}
            <br />
            {product.slug}
          </h2>
        </Link>
        <br />
        <div className="mb-2 flex items-center justify-center">
          <div className="font-bold mt-4">Quantity &nbsp;</div>
          <div className="flex items-center flex-row">
            <button
              className="border px-2 py-1 card"
              onClick={() => setQty(Math.max(1, qty - 1))}
              disabled={qty <= 1}
            >
              -
            </button>
            <span className="px-1 mt-4">{qty}</span>
            <button
              className="border px-2 py-1 card"
              onClick={() => setQty(qty + 1)}
              disabled={currentCountInStock <= qty}
            >
              +
            </button>
          </div>
        </div>

        <div className="mb-2 flex justify-between">
          <div className="font-bold">Purchase Type &nbsp;</div>
          <select
            value={purchaseType}
            onChange={(e) => {
              setPurchaseType(e.target.value);
              if (e.target.value === 'Bulk') {
                setCurrentPrice(product.priceBulk);
                setCurrentDescription(product.descriptionBulk);
                setCurrentCountInStock(product.countInStockBulk);
              } else if (e.target.value === 'Each') {
                setCurrentPrice(product.price);
                setCurrentDescription(product.description);
                setCurrentCountInStock(product.countInStock);
              }
            }}
          >
            <option value="Each">Each</option>
            <option value="Bulk">Bulk</option>
          </select>
        </div>
        <div className="mb-2 flex justify-between">
          <div className="font-bold">Price</div>
          <div className="">&nbsp; ${currentPrice}</div>
        </div>
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
