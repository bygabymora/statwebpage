import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Store } from '../utils/Store';
import { useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import emailjs from '@emailjs/browser';

export const ProductItem = ({ product }) => {
  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const [isOutOfStock, setIsOutOfStock] = useState(false);
  const [isOutOfStockBulk, setIsOutOfStockBulk] = useState(false);
  const [isOutOfStockClearance, setIsOutOfStockClearance] = useState(false);
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
    if (
      product.countInStockClearance === 0 &&
      product.countInStockBulk === 0 &&
      product.countInStock === 0
    ) {
      setPurchaseType('Each');
      setCurrentPrice(product.price);
      setCurrentDescription(product.description);
      setCurrentCountInStock(product.countInStock);
      setIsOutOfStock(true);
    }
  }, [
    product.countInStockClearance,
    product.countInStockBulk,
    product.countInStock,
    product.price,
    product.description,
  ]);

  console.log(currentDescription);
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
            : purchaseType === 'Bulk'
            ? product.descriptionBulk
            : purchaseType === 'Clearance'
            ? product.descriptionClearance
            : product.description,
        countInStock:
          purchaseType === 'Each'
            ? data.countInStock
            : purchaseType === 'Bulk'
            ? data.countInStockBulk
            : purchaseType === 'Clearance'
            ? data.countInStockClearance
            : data.countInStock,
      },
    });
    setQty(1);
    toast.success('Item added to cart');

    if (purchaseType === 'Each' && data.countInStock < quantity) {
      alert("Sorry, we don't have enough of that item in stock.");
    } else if (purchaseType === 'Bulk' && data.countInStockBulk < quantity) {
      alert("Sorry, we don't have enough of that item in stock.");
    } else if (
      purchaseType === 'Clearance' &&
      data.countInStockClearance < quantity
    ) {
      alert("Sorry, we don't have enough of that item in stock.");
    }
  };
  //-----------------EmailJS-----------------//

  const form = useRef();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailSlug, setEmailSlug] = useState('');
  const [emailManufacturer, setEmailManufacturer] = useState('');

  useEffect(() => {
    setEmailSlug(product.slug);
    setEmailManufacturer(product.manufacturer);
  }, [product.slug, product.manufacturer]);

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
    <div className="card justify-center items-center text-center mb-3 text-xs lg:text-lg">
      <Link
        href={{ pathname: `products/${product.slug}` }}
        className="justify-center items-center text-center"
      >
        <div className="">
          <Image
            src={`${product.image}`}
            alt={currentDescription}
            className="product-image no-drag"
            width={800}
            height={1000}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          />
        </div>
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

        <div
          className="mb-2 flex items-center justify-center 
         lg:block"
        >
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
              disabled={
                (purchaseType === 'Each' && isOutOfStock) ||
                (purchaseType === 'Bulk' && isOutOfStockBulk) ||
                (purchaseType === 'Clearance' && isOutOfStockClearance)
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
              } else if (e.target.value === 'Clearance') {
                // Handle Clearance option
                setCurrentPrice(product.priceClearance);
                setCurrentDescription(product.descriptionClearance);
                setCurrentCountInStock(product.countInStockClearance);
              }
            }}
          >
            {product.countInStock > 0 && <option value="Each">Each</option>}
            {product.countInStockBulk > 0 && <option value="Bulk">Box</option>}
            {product.countInStockClearance > 0 && (
              <option value="Clearance">Clearance</option>
            )}
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
            (purchaseType === 'Bulk' && isOutOfStockBulk) ||
            (purchaseType === 'Clearance' && isOutOfStockClearance)
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
  );
};
