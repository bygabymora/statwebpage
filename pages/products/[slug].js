import Layout from '../../components/main/Layout';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { BsBackspace, BsCart2 } from 'react-icons/bs';
import Image from 'next/image';
import { fetchDataWithRetry } from '../../utils/dbUtils';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Store } from '../../utils/Store';
import db from '../../utils/db';
import Product from '../../models/Product';
import { useSession } from "next-auth/react";
import axios from 'axios';
import { toast } from 'react-toastify';
import emailjs from '@emailjs/browser';

export default function ProductScreen(props) {
  const { product } = props;
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const [showPopup, setShowPopup] = useState(false);
  const [isOutOfStock, setIsOutOfStock] = useState(false);
  const [isOutOfStockBulk, setIsOutOfStockBulk] = useState(false);
  const [isOutOfStockClearance, setIsOutOfStockClearance] = useState(false); // Add Clearance state
  const [qty, setQty] = useState(1);
  const { status, data: session } = useSession();
  const [purchaseType, setPurchaseType] = useState('Each'); // defaulting to 'Each'
  const [currentPrice, setCurrentPrice] = useState(product.each?.price || 0);
  const [currentDescription, setCurrentDescription] = useState(
    product.each?.description || ''
  );
  const [currentCountInStock, setCurrentCountInStock] = useState(
    product.each?.countInStock || 0
  );
  const form = useRef();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailSlug, setEmailSlug] = useState('');
  const [emailManufacturer, setEmailManufacturer] = useState('');
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const active = session?.user?.active || status === "authenticated";

  useEffect(() => {
    setEmailSlug(product.slug);
    setEmailManufacturer(product.manufacturer);
  }, [product.slug, product.manufacturer]);

  useEffect(() => {
    if (product.countInStock === 0) {
      setPurchaseType('Bulk');
      setCurrentPrice(product.priceBulk);
      setCurrentDescription(product.descriptionBulk);
      setCurrentCountInStock(product.countInStockBulk);
    }
  }, [
    product.countInStock,
    product.priceBulk,
    product.descriptionBulk,
    product.countInStockBulk,
  ]);

  useEffect(() => {
    if (product.countInStockBulk === 0 && product.countInStock === 0) {
      setPurchaseType('Clearance');
      setCurrentPrice(product.priceClearance);
      setCurrentDescription(product.descriptionClearance);
      setCurrentCountInStock(product.countInStockClearance);
    }
  }, [
    product.countInStockBulk,
    product.countInStock,
    product.priceClearance,
    product.descriptionClearance,
    product.countInStockClearance,
  ]);

    useEffect(() => {
      if (purchaseType === 'Each') {
        setCurrentPrice(product.each?.price || 0);
        setCurrentDescription(product.each?.description || '');
        setCurrentCountInStock(product.each?.countInStock || 0);
      }
    }, [purchaseType, product.each]);

  const addToCartHandler = async () => {
    const exisItem = state.cart.cartItems.find((x) => x.slug === product.slug);
    const quantity = exisItem ? exisItem.quantity + qty : qty;
    const { data } = await axios.get(`/api/products/${product._id}`);

    if (purchaseType === 'Each' && data.countInStock < quantity) {
      setIsOutOfStock(true);
      return;
    } else if (purchaseType === 'Bulk' && data.countInStockBulk < quantity) {
      setIsOutOfStockBulk(true);
      return;
    } else if (
      purchaseType === 'Clearance' &&
      data.countInStockClearance < quantity
    ) {
      setIsOutOfStockClearance(true);
      return;
    }
    dispatch({
      type: 'CART_ADD_ITEM',
      payload: {
        ...product,
        quantity,
        purchaseType,
        price:
          purchaseType === 'Each'
            ? product.each?.price
            : purchaseType === 'Bulk'
            ? product.box?.price
            : purchaseType === 'Clearance'
            ? product.clearance?.price
            : product.price,
        description:
          purchaseType === 'Each'
            ? product.each?.description
            : purchaseType === 'Bulk'
            ? product.box?.description
            : purchaseType === 'Clearance'
            ? product.clearance?.description
            : product.description,
        countInStock:
          purchaseType === 'Each'
            ? product.each?.countInStock
            : purchaseType === 'Bulk'
            ? product.box?.countInStock
            : purchaseType === 'Clearance'
            ? product.clearance?.countInStock
            : product.countInStock,
      },
    });
    setQty(1);
    toast.success('Item added to cart');

    if (purchaseType === 'Each' && data.countInStockEach < quantity) {
      alert("Sorry, we don't have enough of that item in stock.");
    } else if (purchaseType === 'Bulk' && data.countInStockBulk < quantity) {
      alert("Sorry, we don't have enough of that item in stock.");
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

  //-----------------EmailJS-----------------//

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        'service_ej3pm1k',
        'template_5bjn7js',
        form.current,
        'cKdr3QndIv27-P67m'
      )
      .then(
        (result) => {
          alert('Thank you for joining the wait list!');
          console.log(result.text);
        },
        (error) => {
          console.log(error.text);
        }
      );
    setName('');
    setEmail('');
    setEmailSlug('');
    setEmailManufacturer('');
  };
  //-----------//

  return (
    <Layout title={product.name} product={product}>
      <div className="py-2">
        <Link href={'/products'} className="flex gap-4 items-center">
          <BsBackspace />
          Back to products.
        </Link>
      </div>
      <div className="product-grid">
        <div className="product-image">
          <div
            onMouseMove={(e) => {
              const rect = e.target.getBoundingClientRect();
              setCursorPos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
              });
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative"
          >
            <Image
              src={product.image}
              alt={product.name}
              width={640}
              height={640}
              className="rounded-lg hover:cursor-zoom-in no-drag" // <-- Added no-drag class here
              onContextMenu={(e) => e.preventDefault()} // <-- Prevent right-click
              onDragStart={(e) => e.preventDefault()} // <-- Prevent dragging
            />
            {isHovered && (
              <div
                className="hidden md:block"
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: cursorPos.y - 50,
                  left: cursorPos.x - 50,
                  backgroundImage: `url(${product.image})`,
                  backgroundPosition: `-${(cursorPos.x - 50) * 2}px -${
                    (cursorPos.y - 80) * 2
                  }px`,
                  backgroundSize: '1280px 1280px',
                  border: '2px solid gray',
                  transform: 'scale(2)',
                  pointerEvents: 'none',
                }}
              ></div>
            )}
          </div>

          <style jsx global>{`
            .no-drag {
              -webkit-user-drag: none;
              user-drag: none;
              -webkit-user-select: none;
              user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
            }
          `}</style>
        </div>

        <div className="space-y-4">
          <ul className="space-y-2">
            <li>
              <h1 className="text-xl font-bold">{product.name}</h1>
            </li>
            <li>
              <h1 className="text-xl font-bold">{product.manufacturer}</h1>
            </li>
            <li>
              <h1 className="text-xl">{currentDescription}</h1>
            </li>
            {purchaseType === 'Clearance' && (
              <li>
                <h1 className="text-xl text-red-400">Product on Clearance!</h1>
                <p>{product.notes}</p>
              </li>
            )}
            {product.sentOverNight && (
              <li className="space-y-2">
                <br />
                <br />
                <br />
                <br />
                <h1 className="text-lg font-semibold">Shipping recomendations:</h1>
                <p className="text-sm text-[#788b9b]">
                  It is recommended that this product ships overnight due to
                  temperature sensitivity. Stat Surgical Supply is not
                  responsible for product damage or failure if the customer
                  chooses another shipping method.
                </p>
              </li>
            )}
          </ul>
        </div>
        <div>
        {active === "loading" ? (
            "Loading"
          ) : (
            active && (
          <div className="card p-5 mb-4">
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
                  (purchaseType === 'Bulk' && isOutOfStockBulk) ||
                  (purchaseType === 'Clearance' && isOutOfStockClearance)
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
                        `Sorry,  we do not have any additional units of ${product.manufacturer} ${product.name} at this moment`
                      );
                    }
                  }}
                >
                  +
                </button>
              </div>
            </div>

            <div>

            <div className="mb-2 flex justify-between">
              <div className="font-bold">U o M &nbsp;</div>
              <select
                value={purchaseType}
                onChange={(e) => {
                  setPurchaseType(e.target.value);
                  if (e.target.value === 'Each') {
                    setCurrentPrice(product.each?.price || 0);
                    setCurrentDescription(product.each?.description || '');
                    setCurrentCountInStock(product.each?.countInStock || 0);
                  } else if (e.target.value === 'Bulk') {
                    setCurrentPrice(product.box?.price || 0);
                    setCurrentDescription(product.box?.description || '');
                    setCurrentCountInStock(product.box?.countInStock || 0);
                  } else if (e.target.value === 'Clearance') {
                    // Handle Clearance option
                    setCurrentPrice(product.clearance?.price || 0);
                    setCurrentDescription(product.clearance?.description || '');
                    setCurrentCountInStock(product.clearance?.countInStock || 0);
                  }
                }}
              >
               {product.each?.countInStock > 0 && <option value="Each">Each</option>}
                  {product.box?.countInStock > 0 && <option value="Bulk">Box</option>}
                  {product.clearance?.countInStock > 0 && (
                    <option value="Clearance">Clearance</option>
                  )}
              </select>
            </div>

            {active === "loading" ? (
                   "Loading"
                  ) : (
                  active && (
            <div className="mb-2 flex justify-between">
              <div className="font-bold">Price</div>
              <div className="text-2xl">${currentPrice}</div>
            </div>
             )
            )}
            </div>

            
            <div className="mb-2 flex justify-between">
              <div className="font-bold">Status</div>
              &nbsp;
              <div className="">
                {(purchaseType === 'Each' && isOutOfStock) ||
                (purchaseType === 'Bulk' && isOutOfStockBulk) ||
                (purchaseType === 'Clearance' && isOutOfStockClearance)
                  ? 'Out of Stock'
                  : 'In Stock'}
              </div>
            </div>
            <button
              className="primary-button cart-button my-2"
              type="button"
              onClick={addToCartHandler}
              disabled={
                (purchaseType === 'Each' && isOutOfStock) ||
                (purchaseType === 'Bulk' && isOutOfStockBulk) ||
                (purchaseType === 'Clearance' && isOutOfStockClearance)
              }
              >
              {(purchaseType === 'Each' && isOutOfStock) ||
              (purchaseType === 'Bulk' && isOutOfStockBulk) ||
              (purchaseType === 'Clearance' && isOutOfStockClearance)
                ? 'Out of Stock'
                : 'Add to Cart'}
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
            {purchaseType === 'Bulk' && isOutOfStockBulk && (
              <form className="text-center " ref={form} onSubmit={sendEmail}>
                <label className="mt-3 font-bold ">Join Our Wait List</label>
                <input
                  type="text"
                  name="user_name"
                  className="contact__form-input"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  placeholder="Name"
                  required
                />
                <input
                  type="email"
                  name="user_email"
                  className="contact__form-input mt-2"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  placeholder="Email"
                  required
                />
                <input
                  type="text"
                  name="emailSlug"
                  className="contact__form-input"
                  onChange={(e) => setEmailSlug(e.target.value)}
                  value={emailSlug}
                  hidden
                  required
                />
                <input
                  type="text"
                  name="emailManufacturer"
                  className="contact__form-input"
                  onChange={(e) => setEmailManufacturer(e.target.value)}
                  value={emailManufacturer}
                  hidden
                  required
                />
                <button
                  className="primary-button mt-3"
                  type="submit"
                  onClick={sendEmail}
                >
                  Submit
                </button>
              </form>
            )}
            {purchaseType === 'Each' && isOutOfStock && (
              <form className="text-center" ref={form} onSubmit={sendEmail}>
                <label className="mt-3 font-bold ">Join Our Wait List</label>
                <input
                  type="text"
                  name="user_name"
                  className="contact__form-input "
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  placeholder="Name"
                  required
                />
                <input
                  type="email"
                  name="user_email"
                  className="contact__form-input mt-2"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  placeholder="Email"
                  required
                />
                <input
                  type="text"
                  name="emailSlug"
                  className="contact__form-input"
                  onChange={(e) => setEmailSlug(e.target.value)}
                  value={emailSlug}
                  hidden
                  required
                />
                <input
                  type="text"
                  name="emailManufacturer"
                  className="contact__form-input"
                  onChange={(e) => setEmailManufacturer(e.target.value)}
                  value={emailManufacturer}
                  hidden
                  required
                />
                <button
                  className="primary-button mt-3"
                  type="submit"
                  onClick={sendEmail}
                >
                  Submit
                </button>
              </form>
            )}
            {purchaseType === 'Clearance' && isOutOfStockClearance && (
              <form className="text-center " ref={form} onSubmit={sendEmail}>
                <label className="mt-3 font-bold ">Join Our Wait List</label>
                <input
                  type="text"
                  name="user_name"
                  className="contact__form-input"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  placeholder="Name"
                  required
                />
                <input
                  type="email"
                  name="user_email"
                  className="contact__form-input"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  placeholder="Email"
                  required
                />
                <input
                  type="text"
                  name="emailSlug"
                  className="contact__form-input"
                  onChange={(e) => setEmailSlug(e.target.value)}
                  value={emailSlug}
                  hidden
                  required
                />
                <input
                  type="text"
                  name="emailManufacturer"
                  className="contact__form-input"
                  onChange={(e) => setEmailManufacturer(e.target.value)}
                  value={emailManufacturer}
                  hidden
                  required
                />
                <button
                  className="primary-button mt-3"
                  type="submit"
                  onClick={sendEmail}
                >
                  Submit
                </button>
              </form>
            )}
          </div>
             )
            )}
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticPaths() {
  await db.connect();

  const products = await fetchDataWithRetry(async () => {
    return await Product.find({},'slug').lean();
  });
  console.log("Productos generados en getStaticPaths:", products); // Debugging

  return {
    paths: products.map((product) => ({
      params: { slug: String(product.slug) }, // Ensure it's a string
    })),
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  await db.connect();

  const product = await fetchDataWithRetry(async () => {
    return await Product.findOne({ slug: String(params.slug) }).lean();
  });

  if (!product) {
    return { notFound: true };
  }

  return {
    props: {
      product: JSON.parse(JSON.stringify(product)),
    },
    revalidate: 60, // Optional: Regenerate the page every 60 seconds if there are changes
  };
}
