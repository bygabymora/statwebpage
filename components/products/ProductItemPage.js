import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useModalContext } from "../context/ModalContext";
import handleSendEmails from "../../utils/alertSystem/documentRelatedEmail";
import { messageManagement } from "../../utils/alertSystem/customers/messageManagement";

export const ProductItemPage = ({ product }) => {
  const [isOutOfStock, setIsOutOfStock] = useState();
  const [isOutOfStockBox, setIsOutOfStockBox] = useState();
  const [isOutOfStockClearance, setIsOutOfStockClearance] = useState();
  const form = useRef();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const { showStatusMessage, fetchUserData, setUser, user } = useModalContext();
  const [emailName, setEmailName] = useState("");
  const [emailManufacturer, setEmailManufacturer] = useState("");
  const [qty, setQty] = useState(1);
  const [typeOfPurchase, setTypeOfPurchase] = useState(() => {
    if ((product.box?.quickBooksQuantityOnHandProduction ?? 0) > 0) {
      return "Box";
    } else if ((product.each?.quickBooksQuantityOnHandProduction ?? 0) > 0) {
      return "Each";
    } else if (
      product.each?.clearanceCountInStock > 0 ||
      product.box?.clearanceCountInStock > 0
    ) {
      return "Clearance";
    }
    return "Each";
  });
  const { data: session, status } = useSession();
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

  const active =
    session?.user?.active &&
    session?.user?.approved &&
    status === "authenticated";

  useEffect(() => {
    if (product.countInStock || 0) {
      setTypeOfPurchase("Box");
      setCurrentPrice(product.box?.wpPrice || 0);
      setCurrentDescription(product.box?.description || "");
      setCurrentCountInStock(
        product.box?.quickBooksQuantityOnHandProduction ?? null
      );
    }
  }, [typeOfPurchase, product.box, product.countInStock]);

  useEffect(() => {
    const eachStock = product.each?.quickBooksQuantityOnHandProduction ?? 0;
    const boxStock = product.box?.quickBooksQuantityOnHandProduction ?? 0;
    const clearanceStock = product.each?.clearanceCountInStock ?? 0;

    if (eachStock === 0 && boxStock === 0 && clearanceStock > 0) {
      setTypeOfPurchase("Clearance");
      setCurrentPrice(
        product.clearance?.price
          ? `$${product.clearance?.price}`
          : "Contact us for price"
      );
      setCurrentDescription(product.each?.description || "No description");
      setCurrentCountInStock(clearanceStock);
    }
  }, [product]);

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
    if (typeOfPurchase === "Each") {
      setCurrentPrice(product.each?.wpPrice ?? null);
      setCurrentDescription(product.each?.description || "");
      setCurrentCountInStock(
        product.each?.quickBooksQuantityOnHandProduction ?? 0
      );
    } else if (typeOfPurchase === "Box") {
      setCurrentPrice(product.box?.wpPrice ?? null);
      setCurrentDescription(product.box?.description || "");
      setCurrentCountInStock(
        product.box?.quickBooksQuantityOnHandProduction ?? 0
      );
    }
  }, [typeOfPurchase, product]);

  const addToCartHandler = async () => {
    const exisItem = user.cart?.find(
      (x) => x._id === product._id && x.typeOfPurchase === typeOfPurchase
    );
    const quantity = exisItem ? exisItem.quantity + qty : qty;

    const { data } = await axios.get(`/api/products/${product._id}`);

    if (
      typeOfPurchase === "Each" &&
      (data.each?.quickBooksQuantityOnHandProduction ?? 0) < quantity
    ) {
      setIsOutOfStock(true);
      return;
    } else if (
      typeOfPurchase === "Box" &&
      (data.box?.quickBooksQuantityOnHandProduction ?? 0) < quantity
    ) {
      setIsOutOfStockBox(true);
      return;
    } else if (
      typeOfPurchase === "Clearance" &&
      (data.each?.clearanceCountInStock ?? 0) < quantity
    ) {
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

  // Prefill product data when available
  useEffect(() => {
    if (product) {
      setEmailName(product.name || "");
      setEmailManufacturer(product.manufacturer || "");
    }
  }, [product]);

  const sendEmail = (e) => {
    e.preventDefault();
    const contactToEmail = { name, email, emailName, emailManufacturer };

    if (!name || !email || !emailName || !emailManufacturer) {
      showStatusMessage("error", "Please fill all the fields");
      return;
    }

    const emailMessage = messageManagement(contactToEmail, "Product Wait List");
    handleSendEmails(emailMessage, contactToEmail);

    // Clear form fields after submission
    setName("");
    setEmail("");
    setEmailName("");
    setEmailManufacturer("");
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

  return (
    <div
      className='block justify-center card items-center text-center my-3 text-xs lg:text-lg pb-3 border
     border-gray-200 shadow-lg rounded-lg p-1.5 hover:shadow-xl transition-shadow duration-300 ease-in-out'
    >
      <h2 className='font-bold my-2'>
        {product.name}
        {" - "}
        {product.manufacturer}{" "}
      </h2>
      <div className='flex flex-row justify-between'>
        {typeof product._id === "string" && product._id.trim() !== "" && (
          <Link
            href={`/products/${product.manufacturer}-${product.name}?pId=${product._id}`}
            className='justify-center items-center text-center flex-1'
          >
            <div className='p-2'>
              <Image
                src={product.image}
                alt={currentDescription}
                className='rounded-lg shadow-lg'
                width={800}
                height={1000}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                quality={5}
              />
            </div>
          </Link>
        )}
        <div className='flex flex-col justify-center items-center px-2 flex-1'>
          {typeof product._id === "string" && product._id.trim() !== "" && (
            <Link
              href={`/products/${product.manufacturer}-${product.name}?pId=${product._id}`}
              prefetch={false}
              className='justify-center items-center text-center'
            >
              <div className='max-w-full'>
                <div className='h-[3em] overflow-hidden relative flex '>
                  <span className='flex-1'>{currentDescription}</span>
                </div>
              </div>
            </Link>
          )}
          <div>
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
                  <h2 className='font-bold'>🚫 Out of Stock 🚫</h2>
                  <p className='text-[#788b9b]'>
                    Sorry, we do not have any additional units of{" "}
                    <span className='font-bold text-[#144e8b]'>
                      {product.manufacturer} - {product.name}
                    </span>{" "}
                    At this moment. Please contact us for more information.
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
          </div>
          {(isOutOfStock ||
            isOutOfStockBox ||
            isOutOfStockClearance ||
            currentCountInStock <= 0) &&
            active && (
              <div className='mb-2 justify-center gap-10 text-center items-center mt-2'>
                <div className='font-bold'>Status</div>
                <div className=''>Out of Stock</div>
              </div>
            )}
        </div>
      </div>
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

            <input
              autoComplete='off'
              type='text'
              name='emailManufacturer'
              className='contact__form-input'
              value={emailManufacturer}
              disabled
              hidden
            />
            <button className='primary-button mt-3' type='submit'>
              Submit
            </button>
          </form>
        )}
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
                            } else if (
                              e.target.value === "Clearance" &&
                              product.clearance
                            ) {
                              setCurrentPrice(product.clearance?.price || 0);
                              setCurrentDescription(
                                product.clearance?.description || ""
                              );
                              setCurrentCountInStock(
                                product.each?.clearanceCountInStock > 0 ||
                                  product.box?.clearanceCountInStock > 0
                              );
                            }
                          }}
                        >
                          {product.each?.quickBooksQuantityOnHandProduction >
                            0 && <option value='Each'>Each</option>}
                          {product.box?.quickBooksQuantityOnHandProduction >
                            0 && <option value='Box'>Box</option>}
                          {product.each?.clearanceCountInStock > 0 ||
                            (product.box?.clearanceCountInStock > 0 && (
                              <option value='Clearance'>Clearance</option>
                            ))}
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
          ) : (
            // If you only have Clearance, show it once without an "Add to Cart" button
            product.each?.clearanceCountInStock > 0 ||
            (product.box?.clearanceCountInStock > 0 && (
              <div className='my-5 text-center'>
                <h1 className='text-red-500 font-bold text-lg'>Clearance</h1>
                {active === "loading" ? (
                  "Loading"
                ) : active ? (
                  <div className='mb-2 flex justify-center'>
                    <div className='font-bold'>Price:</div>
                    <div className='ml-2 text-[#788b9b]'>
                      $ {product.clearance?.price || "Call for Price"}
                    </div>
                  </div>
                ) : null}
                <div className='text-[#414b53]'>{product.notes}</div>
              </div>
            ))
          )}
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
          {session?.user && !active ? (
            <div className='mb-2 flex justify-center gap-5 m-2 text-center items-center'>
              <div className='font-semibold'>
                You will be able to see this product info soon.
              </div>
            </div>
          ) : !session?.user ? (
            <div className='mb-2 flex flex-col justify-center gap-5 m-2 text-center items-center'>
              <div className=''>
                Sign in to see availability and purchase this product.
              </div>
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
      )}
    </div>
  );
};
ProductItemPage.displayName = "ProductItemPage";
