import Layout from '../../components/Layout';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { BsBackspace, BsCart2 } from 'react-icons/bs';
import Image from 'next/image';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Store } from '../../utils/Store';
import db from '../../utils/db';
import Product from '../../models/Product';
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
  const [purchaseType, setPurchaseType] = useState('Each'); // defaulting to 'Each'
  const [currentPrice, setCurrentPrice] = useState(product.price);
  const [currentDescription, setCurrentDescription] = useState(
    product.description
  );
  const [currentCountInStock, setCurrentCountInStock] = useState(
    product.countInStock
  );
  const form = useRef();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailSlug, setEmailSlug] = useState('');
  const [emailManufacturer, setEmailManufacturer] = useState('');
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

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
    } else if (
      product.countInStockBulk === 0 &&
      product.countInStockClearance > 0
    ) {
      setPurchaseType('Clearance');
      setCurrentPrice(product.priceClearance);
      setCurrentDescription(product.descriptionClearance);
      setCurrentCountInStock(product.countInStockClearance);
    } else {
      setPurchaseType('Each');
    }
  }, [
    product.countInStock,
    product.countInStockBulk,
    product.countInStockClearance,
    product.descriptionBulk,
    product.priceBulk,
    product.descriptionClearance,
    product.priceClearance,
  ]);

  useEffect(() => {
    if (
      product.countInStock === 0 &&
      product.countInStockBulk === 0 &&
      product.countInStockClearance === 0
    ) {
      setPurchaseType('Each');
      setCurrentPrice(product.price);
      setCurrentDescription(product.description);
      setIsOutOfStock(true);
    }
  }, [
    product.countInStock,
    product.countInStockBulk,
    product.countInStockClearance,
    product.descriptionBulk,
    product.priceBulk,
    product.descriptionClearance,
    product.priceClearance,
    product.price,
    product.description,
  ]);

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
    <Layout title={product.slug}>
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
              src={`${product.image}`}
              alt={product.slug}
              width={640}
              height={640}
              className="rounded-lg hover:cursor-zoom-in"
            />
            {isHovered && (
              <div
                className="hidden md:block"
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: cursorPos.y - 50, // center it around the cursor
                  left: cursorPos.x - 50,
                  backgroundImage: `url(${product.image})`,
                  backgroundPosition: `-${(cursorPos.x - 50) * 2}px -${
                    (cursorPos.y - 80) * 2
                  }px`,
                  backgroundSize: '1280px 1280px', // this should be 2x the original image dimensions
                  border: '2px solid gray',
                  transform: 'scale(2)', // magnifying effect
                  pointerEvents: 'none', // to prevent mouse events on this element
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

        <div className="">
          <ul>
            <li>
              <h1 className="text-xl font-bold">{product.slug}</h1>
            </li>
            <li>
              <h1 className="text-xl font-bold">{product.manufacturer}</h1>
            </li>

            <li>
              <h1 className="text-xl">{currentDescription}</h1>
            </li>
            {product.sentOverNight && (
              <li>
                <br />
                <br />
                <br />
                <br />
                <h1 className="text-xl">Shipping recomendations:</h1>
                <p>
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
          <div className="card p-5">
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
                        `Sorry,  we do not have any additional units of ${product.manufacturer} ${product.slug} at this moment`
                      );
                    }
                  }}
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
                {product.countInStockBulk > 0 && (
                  <option value="Bulk">Box</option>
                )}
              </select>
            </div>
            <div className="mb-2 flex justify-between">
              <div className="font-bold">Price</div>
              <div className="text-2xl">${currentPrice}</div>
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
            {purchaseType === 'Each' && isOutOfStock && (
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
