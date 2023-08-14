import Layout from '../../components/Layout';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { BsBackspace, BsCart2 } from 'react-icons/bs';
import Image from 'next/image';
import React, { useContext, useState } from 'react';
import { Store } from '../../utils/Store';
import db from '../../utils/db';
import Product from '../../models/Product';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function ProductScreen(props) {
  const { product } = props;
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const [showPopup, setShowPopup] = useState(false);
  const [isOutOfStock, setIsOutOfStock] = useState(false);
  const [qty, setQty] = useState(1);
  const [purchaseType, setPurchaseType] = useState('Each'); // defaulting to 'Each'
  const [currentPrice, setCurrentPrice] = useState(product.price);
  const [currentDescription, setCurrentDescription] = useState(
    product.descriptionEach
  );
  const [currentCountInStock, setCurrentCountInStock] = useState(
    product.countInStockEach
  );

  if (!product) {
    return (
      <Layout title="Product Not found">
        <div>Product Not Found</div>
      </Layout>
    );
  }

  const addToCartHandler = async () => {
    const exisItem = state.cart.cartItems.find((x) => x.slug === product.slug);
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

    if (product.countInStock < quantity) {
      toast.error("Sorry, we don't have enough of that item in stock.");

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
        <Link href={'/products'} className="flex gap-4 items-center">
          <BsBackspace />
          Back to products.
        </Link>
      </div>
      <div className="product-grid">
        <div className="product-image">
          <Image
            src={`${product.image}`}
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
              <h1 className="text-xl">{currentDescription}</h1>
            </li>
            {product.sentOverNight && (
              <li>
                <h1 className="text-xl font-extrabold">
                  This product must be sent over night.
                </h1>
              </li>
            )}
          </ul>
        </div>
        <div>
          <div className="card p-5">
            <div className="mb-2 flex justify-between">
              <div className="font-bold">Quantity</div>
              <div className="flex flex-row">
                <button
                  className="border px-2 py-1"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  disabled={qty <= 1}
                >
                  -
                </button>
                <span className="px-3">{qty}</span>
                <button
                  className="border px-2 py-1"
                  onClick={() => setQty(qty + 1)}
                  disabled={currentCountInStock <= qty}
                >
                  +
                </button>
              </div>
            </div>
            <div className="mb-2 flex justify-between">
              <div className="font-bold">Purchase Type</div>
              <select
                value={purchaseType}
                onChange={(e) => {
                  setPurchaseType(e.target.value);
                  if (e.target.value === 'Bulk') {
                    setCurrentPrice(product.priceBulk);
                    setCurrentDescription(product.descriptionBulk);
                    setCurrentCountInStock(product.countInStockBulk);
                  } else {
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
              <div className="text-2xl">${currentPrice}</div>
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
                  <p>Items added to cart.</p>
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
            {isOutOfStock && (
              <form className="text-center mt-3 ">
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
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { params } = context;
  const { slug } = params;

  await db.connect();

  const product = await Product.findOne({ slug }).lean();
  await db.disconnect();

  return {
    props: {
      product: product ? db.convertDocToObj(product) : null,
    },
  };
}
