import Layout from '../../components/Layout';
import { useRouter } from 'next/router';
import data from '../../utils/data';
import Link from 'next/link';
import { BsBackspace, BsCart2 } from 'react-icons/bs';
import Image from 'next/image';
import React, { useContext, useState } from 'react';
import { Store } from '../../utils/Store';

export default function ProductScreen() {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const [showPopup, setShowPopup] = useState(false);
  const [isOutOfStock, setIsOutOfStock] = useState(false);

  const { query } = useRouter();
  const { slug } = query;
  const product = data.products.find((x) => x.slug === slug);

  if (!product) {
    return <div>Product Not Found</div>;
  }

  const addToCartHandler = () => {
    const exisItem = state.cart.cartItems.find((x) => x.slug === product.slug);
    let quantity = exisItem ? exisItem.quantity + 1 : 1;
    if (product.countInStock < quantity) {
      setIsOutOfStock(true);
      return;
    }
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });

    if (product.countInStock < quantity) {
      alert("Sorry, we don't have enough of that item in stock.");

      return quantity;
    }
    setShowPopup(true);
  };

  const continueShoppingHandler = () => {
    setShowPopup(false);
    router.push('/');
  };

  const goToCartHandler = () => {
    setShowPopup(false);
    router.push('/cart');
  };

  return (
    <Layout title={product.manufacturer}>
      <div className="py-2">
        <Link href={{ pathname: '/index' }} className="flex gap-4 items-center">
          <BsBackspace />
          Back to products...
        </Link>
      </div>
      <div className="product-grid gap-4">
        <div className="product-image">
          <Image
            src={product.image}
            alt={product.reference}
            width={640}
            height={640}
          />
        </div>
        <div className="">
          <ul>
            <li>
              <h1 className="text-xl font-bold">{product.manufacturer}</h1>
            </li>
            <li>
              <h1 className="text-xl font-bold">{product.reference}</h1>
            </li>
            <li>
              <h1 className="text-xl">{product.description}</h1>
            </li>
          </ul>
        </div>
        <div>
          <div className="card p-5">
            <div className="mb-2 flex justify-between">
              <div className="font-bold">Price</div>
              <div className="text-2xl">${product.price}</div>
            </div>
            <div className="mb-2 flex justify-between">
              <div className="font-bold">Status</div>
              &nbsp;
              <div className="text-lg ">
                {isOutOfStock || product.countInStock === 0
                  ? 'Out of Stock'
                  : 'In Stock'}
              </div>
            </div>
            <button
              className="primary-button cart-button"
              type="button"
              onClick={addToCartHandler}
              disabled={product.countInStock === 0 || isOutOfStock}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
            {showPopup && (
              <div className="popup">
                <div className="popup-content">
                  <p>Item added to cart.</p>
                  <br />
                  <div className="flex gap-1 justify-evenly">
                    <button
                      className="primary-button w-1/2 text-xs text-left"
                      onClick={continueShoppingHandler}
                    >
                      Continue Shopping
                    </button>
                    <button
                      className=" flex primary-button w-1/2 text-xs text-left items-center"
                      onClick={goToCartHandler}
                    >
                      <p>Go to Cart</p> &nbsp;
                      <BsCart2 className="text-2xl" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
