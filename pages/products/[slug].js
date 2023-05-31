import Layout from '../../components/Layout';
import { useRouter } from 'next/router';
import data from '../../utils/data';
import Link from 'next/link';
import { BsBackspace } from 'react-icons/bs';
import Image from 'next/image';
import React, { useContext } from 'react';
import { Store } from '../../utils/Store';

export default function ProductScreen() {
  const { state, dispatch } = useContext(Store);

  const { query } = useRouter();
  const { slug } = query;
  const product = data.products.find((x) => x.slug === slug);

  if (!product) {
    return <div>Product Not Found</div>;
  }

  const addToCartHandler = () => {
    const exisItem = state.cart.cartItems.find((x) => x.slug === product.slug);
    const quantity = exisItem ? exisItem.quantity + 1 : 1;
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });

    if (product.countInStock < quantity) {
      alert("Sorry, we don't have enough of that item in stock.");
      return;
    }
  };

  return (
    <Layout title={product.manufacturer}>
      <div className="py-2">
        <Link href="/" className="flex gap-4 items-center">
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
              <div className="text-2xl ">
                {product.countInStock > 0 ? 'In Stock' : 'Unavailable'}{' '}
              </div>
            </div>
            <button
              className="primary-button cart-button"
              type="button"
              onClick={addToCartHandler}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
