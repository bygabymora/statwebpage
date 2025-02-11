import Layout from '../../components/main/Layout';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { BsBackspace, BsCart2 } from 'react-icons/bs';
import Image from 'next/image';
import { fetchDataWithRetry } from '../../utils/dbUtils';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Store } from '../../utils/Store';
import db from "../../utils/db";
import Product from '../../models/Product';
import { useSession } from "next-auth/react";
import axios from 'axios';
import { toast } from 'react-toastify';
import emailjs from '@emailjs/browser';

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
  try {
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
    revalidate: 10, // Optional: Regenerate the page every 60 seconds if there are changes
  };
} catch (error) {
  console.error("Error fetching product:", error);
  return { notFound: true };
}
}

export default function ProductScreen(props) {
  const { product } = props;
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const [showPopup, setShowPopup] = useState(false);
  const [isOutOfStock, setIsOutOfStock] = useState(product.each?.quickBooksQuantityOnHandProduction > 0
    ? product.each.quickBooksQuantityOnHandProduction
    : null);
  const [isOutOfStockBulk, setIsOutOfStockBulk] = useState(null);
  const [isOutOfStockClearance, setIsOutOfStockClearance] = useState(product.clareance?.countInStock ?? null); // Add Clearance state
  const [qty, setQty] = useState(1);
  const { status, data: session } = useSession();
  const [purchaseType, setPurchaseType] = useState('Each'); // defaulting to 'Each'
  const [currentPrice, setCurrentPrice] = useState(product.each?.minSalePrice);
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
  const [showModal, setShowModal] = useState(false);
  const active = session?.user?.active || status === "authenticated";

  useEffect(() => {
    setEmailSlug(product.slug);
    setEmailManufacturer(product.manufacturer);
  }, [product.slug, product.manufacturer]);

  useEffect(() => {
    if (product.countInStock === 0) {
      setPurchaseType('Bulk');
      setCurrentPrice(product.box?.minSalePrice);
      setCurrentDescription(product.box?.description);
      setCurrentCountInStock(product.box?.quickBooksQuantityOnHandProduction);
    }
  }, [purchaseType, product.box, product.countInStock]);

useEffect(() => {
    if (product.each?.quickBooksQuantityOnHandProduction === 0 && product.box?.quickBooksQuantityOnHandProduction === 0 && product.clearance?.countInStock === 0) {
      setPurchaseType('Clearance');
      setCurrentPrice(product.clearance?.price);
      setCurrentDescription(product.clearance?.description|| "No description");
      setCurrentCountInStock(product.clearance?.countInStock);
    }
  }, [product.each?.quickBooksQuantityOnHandProduction, product.box?.quickBooksQuantityOnHandProduction, product.clearance]);

  useEffect(() => {
    if (purchaseType === 'Each') {
      setCurrentPrice(product.each?.minSalePrice);
      setCurrentDescription(product.each?.description || '');
      setCurrentCountInStock(product.each?.quickBooksQuantityOnHandProduction);
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
    if (data.countInStock < quantity) {
      setShowModal(true);
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
            ? product.each?.minSaleprice
            : purchaseType === 'Bulk'
            ? product.box?.minSalePrice
            : purchaseType === 'Clearance'
            ? product.clearance?.price
            : product.minSalePrice,
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
            ? product.each?.quickBooksQuantityOnHandProduction
            : purchaseType === 'Bulk'
            ? product.box?.quickBooksQuantityOnHandProduction
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
                      setShowModal(true);
                    }
                  }}
                >
                  +
                </button>
              </div>
            </div>
            {showModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
                  <h2 className="font-bold">🚫 Out of Stock 🚫</h2>
                  <p className="text-[#788b9b]">
                  Sorry, we do not have any additional units of{" "}
                  <span className="font-bold text-[#144e8b]">{product.manufacturer} {product.name}</span>{" "}
                  At this moment. Please contact us for more information.
                  </p>
                  <button 
                    className="mt-4 px-4 py-2 bg-[#144e8b] text-white rounded-lg hover:bg-[#03793d] transition"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
            <div>
            {!isOutOfStock && !isOutOfStockBulk && !isOutOfStockClearance && (
          <div>
            {product.each?.quickBooksQuantityOnHandProduction > 0 || product.box?.quickBooksQuantityOnHandProduction > 0 ? (
            purchaseType === 'Each' || purchaseType === 'Bulk' ? (
            <div>
            {active === "loading" ? (
              "Loading"
            ) : (
              active && (
                <div className="mb-2 flex justify-between">
                  <div className="font-bold">U o M &nbsp;</div>
                  <select
                    value={purchaseType}
                    onChange={(e) => {
                      setPurchaseType(e.target.value);
                      if (e.target.value === 'Each' && product.each) {
                        setCurrentPrice(product.each?.minSalePrice || 0);
                        setCurrentDescription(product.each?.description || '');
                        setCurrentCountInStock(product.each?.quickBooksQuantityOnHandProduction || 0);
                      } else if (e.target.value === 'Bulk' && product.box) {
                        setCurrentPrice(product.box?.minSalePrice || 0);
                        setCurrentDescription(product.box?.description || '');
                        setCurrentCountInStock(product.box?.quickBooksQuantityOnHandProduction || 0);
                      } else if (e.target.value === 'Clearance' && product.clearance) {
                        setCurrentPrice(product.clearance?.price || 0);
                        setCurrentDescription(product.clearance?.description || '');
                        setCurrentCountInStock(product.clearance?.countInStock || 0);
                      }
                    }}
                  >
                    {product.each?.quickBooksQuantityOnHandProduction > 0 && (
                      <option value="Each">Each</option>
                    )}
                    {product.box?.quickBooksQuantityOnHandProduction > 0 && (
                      <option value="Bulk">Box</option>
                    )}
                    {product.clearance?.countInStock > 0 && (
                      <option value="Clearance">Clearance</option>
                    )}
                  </select>
                </div>
              )
            )}
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
        ) : null
      ) : (
        // If you only have Clearance, show it once without an "Add to Cart" button
        <div className="my-5 text-center">
          <h1 className="text-red-500 font-bold text-lg">Clearance</h1>
          {active === "loading" ? (
          "Loading"
          ) : active ? (
              <div className="mb-2 flex justify-between">
                <div className="font-bold">Price:</div>
                <div className="ml-2 text-[#788b9b]">
                  $ {product.clearance?.price || 'Call for Price'}
                </div>
              </div>
            ) : null}
              <div className="text-[#414b53]">{product.notes}</div>
        </div>
          )}
          {(product.each?.quickBooksQuantityOnHandProduction > 0 ||
            product.box?.quickBooksQuantityOnHandProduction > 0) && (
            <div>
              <div className="mb-2 flex justify-between">
                <div className="font-bold">Status</div>
                <div>
                  {(purchaseType === 'Each' && isOutOfStock) ||
                  (purchaseType === 'Bulk' && isOutOfStockBulk) ||
                  (purchaseType === 'Clearance' && isOutOfStockClearance)
                    ? 'Out of Stock'
                    : 'In Stock'}
                </div>
              </div>
              {active === "loading" ? (
              "Loading"
              ) : (
                active && (
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
                )
              )}
            </div>
          )}
        </div>
        )}
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
          </div>
        </div>
      </div>
    </Layout>
  );
}

