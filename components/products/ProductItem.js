import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useSession } from "next-auth/react";
import { Store } from '../../utils/Store';
import { useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import emailjs from '@emailjs/browser';

export const ProductItem = ({ product, clearancePurchaseType }) => {
  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const [isOutOfStock, setIsOutOfStock] = useState(product.each?.quickBooksQuantityOnHandProduction ?? null);
  const [isOutOfStockBulk, setIsOutOfStockBulk] = useState(product.box?.quickBooksQuantityOnHandProduction ?? null);
  const [isOutOfStockClearance, setIsOutOfStockClearance] = useState(product.clareance?.countInStock ?? null);
  const [qty, setQty] = useState(1);
  const { status, data: session } = useSession();
  const [purchaseType, setPurchaseType] = useState('Each');
 const [currentPrice, setCurrentPrice] = useState(product.each?.minSalePrice ?? null);
  const [currentDescription, setCurrentDescription] = useState(
    product.each?.description || ''
  );
  const [currentCountInStock, setCurrentCountInStock] = useState(
    product.each?.quickBooksQuantityOnHandProduction ?? null
  );
  const selectId = `uomSelect-${product.id}`;
  const labelFor = selectId;
  const active = session?.user?.active || status === "authenticated";

  useEffect(() => {
    if (product.countInStock === 0) {
      setPurchaseType('Box');
      setCurrentPrice(product.box?.minSalePrice ?? null);
      setCurrentDescription(product.box?.description || '');
      setCurrentCountInStock(product.each?.quickBooksQuantityOnHandProduction ?? null);
    }
  }, [purchaseType, product.box]);

  useEffect(() => {
    if (product.each?.quickBooksQuantityOnHandProduction === 0 && product.box?.quickBooksQuantityOnHandProduction === 0 && product.clearance?.countInStock === 0) {
      setPurchaseType('Clearance');
      setCurrentPrice(product.clearance?.price ?? null);
      setCurrentDescription(product.clearance?.description|| "No description");
      setCurrentCountInStock(product.clearance?.countInStock ?? null);
    }
  }, [product.each?.quickBooksQuantityOnHandProduction, product.box?.quickBooksQuantityOnHandProduction, product.clearance]);

  useEffect(() => {
    if (purchaseType === 'Each') {
      setCurrentPrice(product.each?.minSalePrice ?? null);
      setCurrentDescription(product.each?.description || '');
      setCurrentCountInStock(product.each?.quickBooksQuantityOnHandProduction?? null);
    }
  }, [purchaseType, product.each]);

  useEffect(() => {
    if (clearancePurchaseType) {
      setPurchaseType('Clearance');
      setCurrentPrice(product.clareance?.price ?? null);
      setCurrentDescription(product.clareance?.description || "No description");
      setCurrentCountInStock(product.clareance?.countInStock ?? null);
    }
  }, [clearancePurchaseType, product.clearance]);

  const addToCartHandler = async () => {
    const exisItem = cart.cartItems.find(
      (x) => x.name === product.name && x.purchaseType === purchaseType
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
        price:
          purchaseType === 'Each'
            ? product.each?.minSalePrice
            : purchaseType === 'Bulk'
            ? product.box?.minSalePrice
            : purchaseType === 'Clearance'
            ? product.clearance?.Price
            : product.Price,
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
            ? product.clearance?.quickBooksQuantityOnHandProduction
            : product.quickBooksQuantityOnHandProduction,
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
    <div className="block justify-center card items-center text-center my-3 text-xs lg:text-lg pb-3 border
     border-gray-200 shadow-lg rounded-lg p-1.5 hover:shadow-xl transition-shadow duration-300 ease-in-out"
    >
      <h2 className="font-bold my-2">
        {product.name}
        {'-'}
        {product.manufacturer}{' '}
      </h2>

      <div className="flex flex-row justify-between ">
        <Link
          href={`/products/${product.slug}`}
          className="justify-center items-center text-center flex-1"
        >
          <div className="p-2">
            <Image
              src={`${product.image}`}
              alt={currentDescription}
              className="product-image no-drag rounded-lg"
              width={800}
              height={1000}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
              quality={5}
            />
          </div>
        </Link>

        <div className="flex flex-col justify-center items-center px-2 mb-3 flex-1">
          <Link
            href={`/products/${product.slug}`}
            className="justify-center items-center text-center"
          >
            <div className="max-w-full">
              <div className="h-[3em] overflow-hidden relative flex ">
                <span className="flex-1 ">{currentDescription}</span>
              </div>
            </div>
            {purchaseType === 'Clearance' && (
              <div className="border border-gray-200 mt-2">
                <h1 className="text-red-500">Clearance</h1>
                <p className="text-gray-500">{product.notes}</p>
              </div>
            )}
          </Link>

          { !isOutOfStock && !isOutOfStockBulk && !isOutOfStockClearance && active &&  (
            <div
              className="mb-2 flex items-center justify-center lg:block">
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
          )}

          {purchaseType === 'Each' && isOutOfStock && (
            <div className="mb-1 justify-center gap-10 text-center items-center mt-2">
              <div className="font-bold">Status</div>
              <div className="">Out of Stock</div>
            </div>
          )}
          {purchaseType === 'Bulk' && isOutOfStockBulk && (
            <div className="mb-1 justify-center gap-10 text-center items-center mt-2">
              <div className="font-bold">Status</div>
              <div className="">Out of Stock</div>
            </div>
          )}
          {purchaseType === 'Clearance' && isOutOfStockClearance && (
            <div className="mb-1 justify-center gap-10 text-center items-center mt-2">
              <div className="font-bold">Status</div>
              <div className="">Out of Stock</div>
            </div>
          )}

<>
      {!isOutOfStock && !isOutOfStockBulk && !isOutOfStockClearance && (
        <div>
          {purchaseType === "Each" || purchaseType === "Bulk" ? (
            <div className="justify-between items-center gap-2 mt-2">
              {active === "loading" ? (
                "Loading..."
              ) : (
                active && (
                  <>
                    <div className="mb-2 flex flex-row">
                      <label className="font-bold" htmlFor={labelFor}>
                        U o M &nbsp;
                      </label>
                      <select
                        value={purchaseType}
                         onChange={(e) => {
                           setPurchaseType(e.target.value);
                           if (e.target.value === 'Each') {
                             setCurrentPrice(product.each?.minSalePrice ?? null);
                             setCurrentDescription(product.each?.description || '');
                             setCurrentCountInStock(product.each?.quickBooksQuantityOnHandProduction ?? null);
                           } else if (e.target.value === 'Bulk') {
                             setCurrentPrice(product.box?.minSalePrice ?? null);
                             setCurrentDescription(product.box?.description || '');
                             setCurrentCountInStock(product.box?.quickBooksQuantityOnHandProduction ?? null);
                           } else if (e.target.value === 'Clearance') {
                             setCurrentPrice(product.clearance?.Price ?? null);
                             setCurrentDescription(product.clearance?.description || '');
                             setCurrentCountInStock(product.clearance?.countInStock ?? null);
                           }
                         }}
                        >
                         {product.each?.quickBooksQuantityOnHandProduction > 0 && <option value="Each">Each</option>}
                         {product.box?.quickBooksQuantityOnHandProduction > 0 && <option value="Bulk">Box</option>}
                         {product.clearance?.countInStock > 0 && (
                           <option value="Clearance">Clearance</option>
                        )}
                      </select>
                    </div>

                    <div className="flex flex-row mb-2 justify-between">
                      <div className="font-bold">Price</div>
                      <div className="">&nbsp; ${currentPrice}</div>
                    </div>
                  </>
                )
              )}
            </div>
          ) : null}
        </div>
      )}
    </>
          {purchaseType === 'Bulk' && isOutOfStockBulk && (
            <form className="text-center mb-3 " ref={form} onSubmit={sendEmail}>
              <label className="font-bold ">Join Our Wait List</label>
              <input
                type="text"
                name="user_name"
                className="contact__form-inputs"
                onChange={(e) => setName(e.target.value)}
                value={name}
                placeholder="Name"
                required
              />
              <input
                type="email"
                name="user_email"
                className="contact__form-inputs mt-2"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                placeholder="Email"
                required
              />
              <input
                type="text"
                name="emailSlug"
                className="contact__form-inputs"
                onChange={(e) => setEmailSlug(e.target.value)}
                value={emailSlug}
                hidden
                required
              />
              <input
                type="text"
                name="emailManufacturer"
                className="contact__form-inputs"
                onChange={(e) => setEmailManufacturer(e.target.value)}
                value={emailManufacturer}
                hidden
                required
              />
              <button
                className="primary-button "
                type="submit"
                onClick={sendEmail}
              >
                Submit
              </button>
            </form>
          )}
          {purchaseType === 'Each' && isOutOfStock && (
            <form className="text-center my-2 " ref={form} onSubmit={sendEmail}>
              <label className="mt-3 font-bold ">Join Our Wait List</label>
              <input
                type="text"
                name="user_name"
                className="contact__form-inputs"
                onChange={(e) => setName(e.target.value)}
                value={name}
                placeholder="Name"
                required
              />
              <input
                type="email"
                name="user_email"
                className="contact__form-inputs mt-2"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                placeholder="Email"
                required
              />
              <input
                type="text"
                name="emailSlug"
                className="contact__form-inputs"
                onChange={(e) => setEmailSlug(e.target.value)}
                value={emailSlug}
                hidden
                required
              />
              <input
                type="text"
                name="emailManufacturer"
                className="contact__form-inputs"
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
            <form className="text-center my-2 " ref={form} onSubmit={sendEmail}>
              <label className="mt-3 font-bold ">Join Our Wait List</label>
              <input
                type="text"
                name="user_name"
                className="contact__form-inputs"
                onChange={(e) => setName(e.target.value)}
                value={name}
                placeholder="Name"
                required
              />
              <input
                type="email"
                name="user_email"
                className="contact__form-inputs"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                placeholder="Email"
                required
              />
              <input
                type="text"
                name="emailSlug"
                className="contact__form-inputs"
                onChange={(e) => setEmailSlug(e.target.value)}
                value={emailSlug}
                hidden
                required
              />
              <input
                type="text"
                name="emailManufacturer"
                className="contact__form-inputs"
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

      <div>
  {!isOutOfStock && !isOutOfStockBulk && !isOutOfStockClearance && (
    <div className="mb-2 flex justify-center gap-5 m-2 text-center items-center">
      {purchaseType === 'Each' || purchaseType === 'Bulk' ? (
        <div className="flex gap-20 m-2 justify-between items-center">
          <div className="flex-column">
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
                className="primary-button align-middle"
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
      ) : (
        <div>
          <div className="border border-gray-200 my-5">
            <div className="flex justify-center gap-8 mx-2">
              <h1 className="text-red-500">Clearance</h1>
              {active === "loading" ? (
                "Loading"
              ) : (
                active && (
                  <div className="mb-2 justify-between flex">
                    <div className="font-bold">Price</div>
                    <div className="">&nbsp; ${currentPrice}</div>
                  </div>
                )
              )}
            </div>

            <div className="text-gray-500 mb-1">{product.notes}</div>
          </div>
          {active === "loading" ? (
            "Loading"
          ) : (
            session?.user?.active && (
              <button
                className="primary-button align-middle"
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
</div>
    </div>
  );
};
