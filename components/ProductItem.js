import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Store } from '../utils/Store';
import { useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const ProductItem = ({ product }) => {
  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const [isOutOfStock, setIsOutOfStock] = useState(false);
  const [isOutOfStockBulk, setIsOutOfStockBulk] = useState(false);
  const [qty, setQty] = useState(1);
  const [purchaseType, setPurchaseType] = useState('Each');
  const [currentPrice, setCurrentPrice] = useState(product.price);
  const [currentDescription, setCurrentDescription] = useState(
    product.description
  );
  const [currentCountInStock, setCurrentCountInStock] = useState(
    product.countInStock
  );

  useEffect(() => {
    if (product.countInStock === 0) {
      setPurchaseType('Bulk');
      setCurrentPrice(product.priceBulk);
      setCurrentDescription(product.descriptionBulk);
      setCurrentCountInStock(product.countInStockBulk);
    } else {
      setPurchaseType('Each');
    }
  }, [
    product.countInStock,
    product.countInStockBulk,
    product.descriptionBulk,
    product.priceBulk,
  ]);

  const addToCartHandler = async () => {
    const exisItem = cart.cartItems.find(
      (x) => x.slug === product.slug && x.purchaseType === purchaseType
    );
    const quantity = exisItem ? exisItem.quantity + qty : qty;
    const { data } = await axios.get(`/api/products/${product._id}`);

    if (purchaseType === 'Each' && data.countInStock < quantity) {
      setIsOutOfStock(true);
      return;
    } else if (purchaseType === 'Bulk' && data.countInStockBulk < quantity) {
      setIsOutOfStockBulk(true);
      return;
    }
    dispatch({
      type: 'CART_ADD_ITEM',
      payload: {
        ...product,
        quantity,
        purchaseType,
        sentOverNight: product.sentOverNight,
        price: purchaseType === 'Each' ? product.price : product.priceBulk,
        description:
          purchaseType === 'Each'
            ? product.description
            : product.descriptionBulk,
        countInStock:
          purchaseType === 'Each' ? data.countInStock : data.countInStockBulk,
      },
    });
    setQty(1);
    toast.success('Item added to cart');

    if (purchaseType === 'Each' && data.countInStock < quantity) {
      alert("Sorry, we don't have enough of that item in stock.");
    } else if (purchaseType === 'Bulk' && data.countInStockBulk < quantity) {
      alert("Sorry, we don't have enough of that item in stock.");
    }
  };

  return (
    <div className="card justify-center items-center text-center mb-3">
      <Link
        href={{ pathname: `products/${product.slug}` }}
        className="justify-center items-center text-center"
      >
        <Image
          src={`${product.image}`}
          alt={currentDescription}
          className="product-image"
          width={800}
          height={1000}
        />
      </Link>
      <div className="flex flex-col justify-center items-center p-5">
        <Link
          href={{ pathname: `products/${product.slug}` }}
          className="justify-center items-center text-center"
        >
          <h2 className="font-bold">
            {product.slug}
            <br />
            {product.manufacturer}{' '}
          </h2>

          <br />
          <div className="max-w-full">
            <div className="h-[3em] overflow-hidden relative flex ">
              <span className="flex-1 ">{currentDescription}</span>
            </div>
          </div>
        </Link>

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
            <span className="px-1 mt-4">
              {(purchaseType === 'Each' && isOutOfStock) ||
              (purchaseType === 'Bulk' && isOutOfStockBulk)
                ? 0
                : qty}
            </span>
            <button
              className="border px-2 py-1 card"
              onClick={() => {
                if (qty < currentCountInStock) {
                  setQty(qty + 1);
                } else {
                  alert(
                    `Sorry, we only have ${
                      purchaseType === 'Each'
                        ? product.countInStock
                        : product.countInStockBulk
                    } of ${product.manufacturer} ${product.slug} at this moment`
                  );
                }
              }}
              disabled={
                (purchaseType === 'Each' && isOutOfStock) ||
                (purchaseType === 'Bulk' && isOutOfStockBulk)
              }
            >
              +
            </button>
          </div>
        </div>

        <div className="mb-2 flex justify-between">
          <div className="font-bold">U o M &nbsp;</div>
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
            {product.countInStock > 0 && <option value="Each">Each</option>}
            {product.countInStockBulk > 0 && <option value="Bulk">Box</option>}
          </select>
        </div>
        <div className="mb-2 flex justify-between">
          <div className="font-bold">Price</div>
          <div className="">&nbsp; ${currentPrice}</div>
        </div>
        <div className="mb-2 flex justify-between">
          <div className="font-bold">Status</div>
          &nbsp;
          <div className="">
            {(purchaseType === 'Each' && isOutOfStock) ||
            (purchaseType === 'Bulk' && isOutOfStockBulk)
              ? 'Out of Stock'
              : 'In Stock'}
          </div>
        </div>
        <button
          className="primary-button align-middle mt-2 mb-2"
          type="button"
          onClick={addToCartHandler}
          disabled={
            (purchaseType === 'Each' && isOutOfStock) ||
            (purchaseType === 'Bulk' && isOutOfStockBulk)
          }
        >
          {(purchaseType === 'Each' && isOutOfStock) ||
          (purchaseType === 'Bulk' && isOutOfStockBulk)
            ? 'Out of Stock'
            : 'Add to Cart'}
        </button>

        {purchaseType === 'Bulk' && isOutOfStockBulk && (
          <form className="text-center ">
            <label className="mt-3 font-bold ">Join our wait List</label>
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
        {purchaseType === 'Each' && isOutOfStock && (
          <form className="text-center ">
            <label className="mt-3 font-bold ">Join our wait List</label>
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
