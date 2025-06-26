import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useModalContext } from "../context/ModalContext";
import handleSendEmails from "../../utils/alertSystem/documentRelatedEmail";
import { messageManagement } from "../../utils/alertSystem/customers/messageManagement";

export const ProductItem = ({ product, clearanceTypeOfPurchase, index }) => {
  const [isOutOfStock, setIsOutOfStock] = useState();
  const [isOutOfStockBox, setIsOutOfStockBox] = useState();
  const [isOutOfStockClearance, setIsOutOfStockClearance] = useState();
  const [qty, setQty] = useState(1);
  const [typeOfPurchase, setTypeOfPurchase] = useState(() => {
    if (product.box?.quickBooksQuantityOnHandProduction > 0) {
      return "Box";
    } else if (product.each?.quickBooksQuantityOnHandProduction > 0) {
      return "Each";
    } else if (
      product.each?.clearanceCountInStock > 0 ||
      product.box?.clearanceCountInStock > 0
    ) {
      return "Clearance";
    }
    return "Each";
  });
  const { status, data: session } = useSession();
  const [currentPrice, setCurrentPrice] = useState(
    product.each?.wpPrice ?? null
  );
  const [currentDescription, setCurrentDescription] = useState(
    product.each?.description || ""
  );
  const [currentCountInStock, setCurrentCountInStock] = useState(
    product.each?.quickBooksQuantityOnHandProduction ?? null
  );
  const [showModal, setShowModal] = useState(false);
  const hasPrice = currentPrice !== null && currentPrice !== 0;
  const form = useRef();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const { showStatusMessage, fetchUserData, setUser, user } = useModalContext();

  const active =
    session?.user?.active &&
    session?.user?.approved &&
    status === "authenticated";

  useEffect(() => {
    if (typeOfPurchase === "Each") {
      setCurrentPrice(product.each?.wpPrice ?? null);
      setCurrentDescription(product.each?.description || "");
      setCurrentCountInStock(
        product.each?.quickBooksQuantityOnHandProduction ?? null
      );
    } else if (typeOfPurchase === "Box") {
      setCurrentPrice(product.box?.wpPrice ?? null);
      setCurrentDescription(product.box?.description || "");
      setCurrentCountInStock(
        product.box?.quickBooksQuantityOnHandProduction ?? null
      );
    } else if (typeOfPurchase === "Clearance") {
      setCurrentPrice(product.clearance?.price ?? null);
      setCurrentDescription(product.each?.description || "No description");
      setCurrentCountInStock(
        product.each?.clearanceCountInStock > 0 ||
          product.box?.clearanceCountInStock > 0
      );
    }
  }, [typeOfPurchase, product]);

  useEffect(() => {
    if (product.countInStock === 0) {
      setTypeOfPurchase("Box");
      setCurrentPrice(product.box?.wpPrice ?? null);
      setCurrentDescription(product.box?.description || "");
      setCurrentCountInStock(
        product.each?.quickBooksQuantityOnHandProduction ?? null
      );
    }
  }, [
    product.countInStock,
    product.box,
    product.each?.quickBooksQuantityOnHandProduction,
  ]);

  useEffect(() => {
    const eachStock = product.each?.quickBooksQuantityOnHandProduction ?? 0;
    const boxStock = product.box?.quickBooksQuantityOnHandProduction ?? 0;
    const clearanceStockEach = product.each?.clearanceCountInStock ?? 0;
    const clearanceStockBox = product.box?.clearanceCountInStock ?? 0;

    if (
      eachStock === 0 &&
      boxStock === 0 &&
      (clearanceStockEach > 0 || clearanceStockBox > 0)
    ) {
      setTypeOfPurchase("Clearance");

      setCurrentPrice(
        product.each?.clearanceCountInStock > 0
          ? `$${product.each?.wpPrice || "Call for Price"}`
          : `$${product.box?.wpPrice || "Call for Price"}`
      );

      setCurrentDescription(
        product.each?.clearanceCountInStock > 0
          ? product.each?.description || "No description"
          : product.box?.description || "No description"
      );

      setCurrentCountInStock(
        product.each?.clearanceCountInStock > 0
          ? product.each?.clearanceCountInStock
          : product.box?.clearanceCountInStock
      );
    }
  }, [
    product,
    product.box?.clearanceCountInStock,
    product.each?.clearanceCountInStock,
  ]);

  useEffect(() => {
    if (typeOfPurchase === "Each") {
      setCurrentPrice(product.each?.wpPrice ?? null);
      setCurrentDescription(product.each?.description || "");
      setCurrentCountInStock(
        product.each?.quickBooksQuantityOnHandProduction ?? null
      );
    }
  }, [typeOfPurchase, product.each]);

  useEffect(() => {
    if (clearanceTypeOfPurchase) {
      setTypeOfPurchase("Clearance");
      setCurrentPrice(product.clearance?.price ?? null);
      setCurrentDescription(product.clearance?.description || "No description");
      setCurrentCountInStock(
        product.each?.clearanceCountInStock > 0 ||
          product.box?.clearanceCountInStock > 0
      );
    }
  }, [
    clearanceTypeOfPurchase,
    product.clearance,
    product.box?.clearanceCountInStock,
    product.each?.clearanceCountInStock,
  ]);

  const addToCartHandler = async () => {
    const exisItem = user.cart?.find(
      (x) => x.productId === product._id && x.typeOfPurchase === typeOfPurchase
    );
    const quantity = exisItem ? exisItem.quantity + qty : qty;

    const { data } = await axios.get(`/api/products/${product._id}`);

    if (
      typeOfPurchase === "Each" &&
      (data.each?.quickBooksQuantityOnHandProduction ?? 0) < quantity
    ) {
      setShowModal(true);
      setIsOutOfStock(true);
      return;
    } else if (
      typeOfPurchase === "Box" &&
      (data.box?.quickBooksQuantityOnHandProduction ?? 0) < quantity
    ) {
      setShowModal(true);
      setIsOutOfStockBox(true);
      return;
    } else if (
      typeOfPurchase === "Clearance" &&
      (data.each?.clearanceCountInStock ?? 0) < quantity
    ) {
      setShowModal(true);
      setIsOutOfStockClearance(true);
      return;
    }

    await axios.post(`/api/users/${session.user._id}/cart`, {
      productId: product._id,
      quantity,
      typeOfPurchase,
      unitPrice:
        typeOfPurchase === "Each"
          ? product.each?.wpPrice
          : typeOfPurchase === "Box"
          ? product.box?.wpPrice
          : typeOfPurchase === "Clearance"
          ? product.clearance?.price
          : product.price,
      wpPrice:
        typeOfPurchase === "Each"
          ? product.each?.wpPrice
          : typeOfPurchase === "Box"
          ? product.box?.wpPrice
          : typeOfPurchase === "Clearance"
          ? product.clearance?.price
          : product.price,
      price:
        typeOfPurchase === "Each"
          ? product.each?.wpPrice
          : typeOfPurchase === "Box"
          ? product.box?.wpPrice
          : typeOfPurchase === "Clearance"
          ? product.clearance?.price
          : product.price,
    });

    setQty(1);
    const updatedUser = await fetchUserData();
    console.log("Updated cart:", updatedUser);
    setUser((prev) => ({
      ...prev,
      cart: updatedUser.userData?.cart,
    }));
    showStatusMessage("success", "Item added to cart");
  };
  //-----------------Email-----------------//

  const sendEmail = (e) => {
    e.preventDefault();
    const contactToEmail = { name, email };

    if (!name || !email) {
      showStatusMessage("error", "Please fill all the fields");
      return;
    }

    const emailMessage = messageManagement(
      contactToEmail,
      "Product Wait List",
      null,
      null,
      product
    );
    handleSendEmails(emailMessage, contactToEmail);

    // Clear form fields after submission
    setName("");
    setEmail("");
  };

  useEffect(() => {
    if (!active) {
      if (product.each?.description) {
        setCurrentDescription(product.each.description);
      } else if (product.box?.description) {
        setCurrentDescription(product.box.description);
      }
    }
  }, [active, product]);

  const handleMatchProduct = (productId) => {
    const matchProduct = user?.cart?.find((x) => x.productId === productId);
    if (matchProduct) {
      return matchProduct.quantity;
    }
    return 0;
  };

  return (
    <div
      className='block justify-center card items-center text-center my-3 text-xs lg:text-lg pb-3 border
     border-gray-200 shadow-lg rounded-lg p-1.5 hover:shadow-xl transition-shadow duration-300 ease-in-out'
    >
      <h2 className='font-bold my-2'>
        {product.name}
        {"-"}
        {product.manufacturer}{" "}
      </h2>

      <div className='flex flex-row justify-between'>
        <Link
          href={`/products/${product.manufacturer}-${product.name}?pId=${product._id}`}
          className='justify-center items-center text-center flex-1'
        >
          <div className='p-2'>
            <Image
              src={product.image}
              alt={product.name}
              className='rounded-lg shadow-lg'
              width={800}
              height={1000}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
              quality={5}
              loading='lazy'
              priority={
                index === 0 &&
                typeof window !== "undefined" &&
                window.innerWidth >= 768
              }
            />
          </div>
        </Link>

        <div className='flex flex-col justify-center items-center px-2 flex-1'>
          <Link
            href={`/products/${product.manufacturer}-${product.name}?pId=${product._id}`}
            className='justify-center items-center text-center'
          >
            <div className='max-w-full'>
              <div className='h-[3em] overflow-hidden relative flex '>
                <span className='flex-1'>{currentDescription}</span>
              </div>
            </div>
          </Link>
          {!isOutOfStock &&
            !isOutOfStockBox &&
            !isOutOfStockClearance &&
            active &&
            currentCountInStock > 0 &&
            hasPrice && (
              <div className='mb-2 flex items-center justify-center lg:block'>
                <div className='font-bold mt-4'>Quantity &nbsp;</div>
                <div className='flex items-center flex-row'>
                  <button
                    className='border px-2 py-1 card'
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    disabled={qty <= 1}
                  >
                    -
                  </button>
                  <span className='px-1 mt-4'>{qty}</span>
                  <button
                    className='border px-2 py-1 card'
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
            )}
          {showModal && (
            <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]'>
              <div className='bg-white p-6 rounded-lg shadow-lg max-w-sm text-center'>
                <h2 className='font-bold'>🚫 Sorry, Out of Stock 🚫</h2>
                <span className='font-bold text-[#144e8b]'>
                  {product.manufacturer} - {product.name} - {typeOfPurchase}
                </span>{" "}
                {user?.cart?.length > 0 &&
                  handleMatchProduct(product._id) > 0 && (
                    <p className='mt-2 font-semibold'>
                      You have{" "}
                      {handleMatchProduct(product._id) > 1
                        ? handleMatchProduct(product._id) +
                          "units of this item in your cart, that are available for purchase"
                        : "1 unit of this item in your cart, that is available for purchase"}
                      .
                    </p>
                  )}
                <p className='text-[#788b9b]'>
                  We do not have any additional units at this moment. Please
                  contact us for more information.
                </p>
                <button
                  className='mt-4 px-4 py-2 bg-[#144e8b] text-white rounded-lg hover:bg-[#788b9b] transition'
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
          {(isOutOfStock ||
            isOutOfStockBox ||
            isOutOfStockClearance ||
            currentCountInStock <= 0) && (
            <div className='mb-2 justify-center gap-10 text-center items-center mt-2'>
              <div className='font-bold'>Status</div>
              <div className=''>Out of Stock</div>
            </div>
          )}
        </div>
      </div>
      {!isOutOfStock && !isOutOfStockBox && !isOutOfStockClearance && (
        <div>
          {product.each?.quickBooksQuantityOnHandProduction > 0 ||
          product.box?.quickBooksQuantityOnHandProduction > 0 ? (
            typeOfPurchase === "Each" || typeOfPurchase === "Box" ? (
              <div className='flex justify-between items-center gap-2 mx-10 mt-5'>
                {active === "loading"
                  ? "Loading"
                  : active && (
                      <div className='mb-2 justify-between'>
                        <div className='font-bold'>U o M &nbsp;</div>
                        <select
                          value={typeOfPurchase}
                          onChange={(e) => {
                            setTypeOfPurchase(e.target.value);
                            if (e.target.value === "Each" && product.each) {
                              setCurrentPrice(product.each?.wpPrice || 0);
                              setCurrentDescription(
                                product.each?.description || ""
                              );
                              setCurrentCountInStock(
                                product.each
                                  ?.quickBooksQuantityOnHandProduction || 0
                              );
                            } else if (
                              e.target.value === "Box" &&
                              product.box
                            ) {
                              setCurrentPrice(product.box?.wpPrice || 0);
                              setCurrentDescription(
                                product.box?.description || ""
                              );
                              setCurrentCountInStock(
                                product.box
                                  ?.quickBooksQuantityOnHandProduction || 0
                              );
                            }
                          }}
                        >
                          {product.each?.quickBooksQuantityOnHandProduction >
                            0 && <option value='Each'>Each</option>}
                          {product.box?.quickBooksQuantityOnHandProduction >
                            0 && <option value='Box'>Box</option>}
                          {(product.each?.clearanceCountInStock > 0 ||
                            product.box?.clearanceCountInStock > 0) && (
                            <option value='Clearance'>Clearance</option>
                          )}
                        </select>
                      </div>
                    )}
                {active === "loading"
                  ? "Loading"
                  : active && (
                      <div className='mb-2 justify-between'>
                        <div className='font-bold'>Price</div>
                        {hasPrice ? `$${currentPrice}` : "Call for Price"}
                      </div>
                    )}
              </div>
            ) : null
          ) : null}
          {(product.each?.quickBooksQuantityOnHandProduction > 0 ||
            product.box?.quickBooksQuantityOnHandProduction > 0) && (
            <div className='mb-2 flex justify-center gap-5 m-2 text-center items-center'>
              <div className='flex-column'>
                <div className='font-bold'>Status</div>
                <div className=''>
                  {(typeOfPurchase === "Each" && isOutOfStock) ||
                  (typeOfPurchase === "Box" && isOutOfStockBox) ||
                  (typeOfPurchase === "Clearance" && isOutOfStockClearance)
                    ? "Out of Stock"
                    : "In Stock"}
                </div>
              </div>
              {active === "loading"
                ? "Loading"
                : active && (
                    <>
                      {!hasPrice || currentPrice === 0 ? (
                        <Link href='/support'>
                          <button className='primary-button align-middle text-white'>
                            Call for Price
                          </button>
                        </Link>
                      ) : (
                        <button
                          className='primary-button align-middle'
                          type='button'
                          onClick={addToCartHandler}
                          disabled={
                            (typeOfPurchase === "Each" && isOutOfStock) ||
                            (typeOfPurchase === "Box" && isOutOfStockBox) ||
                            (typeOfPurchase === "Clearance" &&
                              isOutOfStockClearance)
                          }
                        >
                          {(typeOfPurchase === "Each" && isOutOfStock) ||
                          (typeOfPurchase === "Box" && isOutOfStockBox) ||
                          (typeOfPurchase === "Clearance" &&
                            isOutOfStockClearance)
                            ? "Out of Stock"
                            : "Add to Cart"}
                        </button>
                      )}
                    </>
                  )}
            </div>
          )}
        </div>
      )}
      {((typeOfPurchase === "Each" &&
        (isOutOfStock || currentCountInStock <= 0)) ||
        (typeOfPurchase === "Box" &&
          (isOutOfStockBox || currentCountInStock <= 0))) &&
        active && (
          <form className='text-center p-2' ref={form} onSubmit={sendEmail}>
            <label className='mt-3 font-bold'>Join Our Wait List</label>
            <input
              autoComplete='off'
              type='text'
              name='user_name'
              className='contact__form-input'
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder='Name'
              required
            />
            <input
              autoComplete='off'
              type='email'
              name='user_email'
              className='contact__form-input mt-2'
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              placeholder='Email'
              required
            />
          </form>
        )}
      {session?.user && !active ? (
        <div className='mb-2 flex justify-center gap-5 m-2 text-center items-center'>
          <div className='font-semibold'>
            You will be able to see this product info soon.
          </div>
        </div>
      ) : !session?.user ? (
        <div className='mb-2 flex flex-col justify-center gap-5 m-2 text-center items-center'>
          {(product.each?.wpPrice &&
            product.each?.wpPrice !== "Call for price") ||
          (product.box?.wpPrice &&
            product.box?.wpPrice !== "Call for price") ? (
            <div className=''>
              <span className='font-semibold'>
                Web price: ${product.each?.wpPrice || product.box?.wpPrice} per{" "}
                {product.each?.wpPrice ? "Unit" : "Box"}.
              </span>{" "}
              <br />
              Contact us or register for custom pricing.
            </div>
          ) : (
            <div className=''>
              Sign in to see availability and purchase this product at a custom
              price.
            </div>
          )}
          <div className='flex gap-5'>
            <Link href='/Login'>
              <button className='primary-button align-middle text-white'>
                Login
              </button>
            </Link>
            <Link href='/Register'>
              <button className='primary-button align-middle text-white'>
                Register
              </button>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
};
