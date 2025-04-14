import Layout from '../../components/main/Layout';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { BsCart2, BsChevronRight } from 'react-icons/bs';
import Image from 'next/image';
import { fetchDataWithRetry } from '../../utils/dbUtils';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Store } from '../../utils/Store';
import db from "../../utils/db";
import Product from '../../models/Product';
import { useSession } from "next-auth/react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { useModalContext } from '../../components/context/ModalContext';
import handleSendEmails from '../../utils/alertSystem/documentRelatedEmail';
import { messageManagement } from '../../utils/alertSystem/customers/messageManagement';

export async function getServerSideProps({ params }) {
  const { id: fullId } = params;
  const id = fullId.split('-').pop();

  await db.connect();
  const product = await fetchDataWithRetry(async () => {
    return await Product.findById(id).lean();
  });

  if (!product) {
    return { notFound: true };
  }

  return {
    props: {
      product: JSON.parse(JSON.stringify(product)),
    },
  };
}

export default function ProductScreen(props) {
  const { product } = props;
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const [showPopup, setShowPopup] = useState(false);
  const [isOutOfStock, setIsOutOfStock] = useState();
  const [isOutOfStockBox, setIsOutOfStockBox] = useState(); 
  const [isOutOfStockClearance, setIsOutOfStockClearance] = useState(); 
  const [qty, setQty] = useState(1);
  const { status, data: session } = useSession();
  const [currentPrice, setCurrentPrice] = useState(product.each?.wpPrice || null);
  const [currentDescription, setCurrentDescription] = useState(product.each?.description || '');
  const [currentCountInStock, setCurrentCountInStock] = useState(product.each?.countInStock || null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const hasPrice =  currentPrice !== null && currentPrice !== 0;
  const active = session?.user?.active && session?.user?.approved && status === "authenticated";
    const [purchaseType, setPurchaseType] = useState(() => {
    if ((product.box?.quickBooksQuantityOnHandProduction ?? 0) > 0) {
      return 'Box';
    } else if ((product.each?.quickBooksQuantityOnHandProduction ?? 0) > 0) {
      return 'Each';
    } else if ((product.each?.clearanceCountInStock ?? 0) > 0) {
      return 'Clearance';
    }
    return 'Each';
  });

  useEffect(() => {
    if (product.countInStock || 0 ) {
      setPurchaseType('Box');
      setCurrentPrice(product.box?.wpPrice || 0 );
      setCurrentDescription(product.box?.description || '');
      setCurrentCountInStock(product.box?.quickBooksQuantityOnHandProduction ?? null);
    }
  }, [purchaseType, product.box]);

  useEffect(() => {
    const eachStock = product.each?.quickBooksQuantityOnHandProduction ?? 0;
    const boxStock = product.box?.quickBooksQuantityOnHandProduction ?? 0;
    const clearanceStock = product.each?.clearanceCountInStock ?? 0 <= 0;
    
    if (eachStock === 0 && boxStock === 0 && clearanceStock > 0) {
      setPurchaseType('Clearance');
      setCurrentPrice(product.clearance?.price ? `$${product.clearance?.price}` : "Contact us for price");
      setCurrentDescription(product.each?.description || "No description");
      setCurrentCountInStock(clearanceStock);
    }
  }, [product]);
  
  useEffect(() => {
    if (purchaseType === 'Each') {
      setCurrentPrice(product.each?.wpPrice ?? null);
      setCurrentDescription(product.each?.description || '');
      setCurrentCountInStock(product.each?.quickBooksQuantityOnHandProduction ?? null);
    }
  }, [purchaseType, product.each]);
  
  useEffect(() => {
    if (purchaseType === 'Each') {
      setCurrentPrice(product.each?.wpPrice ?? null);
      setCurrentDescription(product.each?.description || '');
      setCurrentCountInStock(product.each?.quickBooksQuantityOnHandProduction ?? 0);
    } else if (purchaseType === 'Box') {
      setCurrentPrice(product.box?.wpPrice ?? null);
      setCurrentDescription(product.box?.description || '');
      setCurrentCountInStock(product.box?.quickBooksQuantityOnHandProduction ?? 0);
    } else if (purchaseType === 'Clearance') {
      setCurrentPrice(product.clearance?.price ?? null);
      setCurrentDescription(product.each?.description || 'No description');
      setCurrentCountInStock(product.each?.clearanceCountInStock ?? 0);
    }
  }, [purchaseType, product]);

  const addToCartHandler = async () => {
    const exisItem = state.cart.cartItems.find((x) => x._id === product._id);
    const quantity = exisItem ? exisItem.quantity + qty : qty;
    const { data } = await axios.get(`/api/products/${product._id}`);

    if (purchaseType === 'Each' && (data.each?.quickBooksQuantityOnHandProduction ?? 0) < quantity) {
      setIsOutOfStock(true);
      return;
    } else if (purchaseType === 'Box' && (data.box?.quickBooksQuantityOnHandProduction ?? 0) < quantity) {
      setIsOutOfStockBox(true);
      return;
    } else if (
      purchaseType === 'Clearance' &&
      (product.each?.clearanceCountInStock ?? 0) < quantity
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
            ? product.each?.wpPrice
            : purchaseType === 'Box'
            ? product.box?.wpPrice
            : purchaseType === 'Clearance'
            ? product.clearance?.Price
            : product.Price,
        description:
          purchaseType === 'Each'
            ? product.each?.description
            : purchaseType === 'Box'
            ? product.box?.description
            : purchaseType === 'Clearance'
            ? product.clearance?.description
            : product.description,
        countInStock:
          purchaseType === 'Each'
            ? product.each?.quickBooksQuantityOnHandProduction
            : purchaseType === 'Box'
            ? product.box?.quickBooksQuantityOnHandProduction
            : purchaseType === 'Clearance'
            ? product.each?.clearanceCountInStock
            : product.clearanceCountInStock,
      },
    });
    setQty(1);
    toast.success('Item added to cart');
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

  const form = useRef();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const {showStatusMessage } = useModalContext();
  const [emailName, setEmailName] = useState("");
  const [emailManufacturer, setEmailManufacturer] = useState("");

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

    setName("");
    setEmail("");
    setEmailName("");
    setEmailManufacturer("");
  };

  const breadcrumbs = [
    { href: '/', name: 'Home' },
    { href: '/products', name: 'Products' },
    { name: product.name },
  ];

  return (
    <Layout title={product.name} product={product}>
      <nav className="text-sm text-gray-700">
        <ul className="flex ml-0 lg:ml-20 items-center space-x-2">
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={index} className="flex items-center">
              {breadcrumb.href ? (
                <Link href={breadcrumb.href} className="hover:underline text-[#144e8b]">
                  {breadcrumb.name}
                </Link>
              ) : (
                <span>{breadcrumb.name}</span>
              )}
              {index < breadcrumbs.length - 1 && (
                <BsChevronRight className="mx-2 text-gray-500" />
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex flex-col lg:flex-row items-center justify-center gap-5 p-6"> 
        <div className="flex flex-col lg:flex-row items-center justify-center gap-5 p-6 bg-white shadow-lg rounded-xl">
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
            className="relative "
          >
            <Image
              src={product.image}
              alt={product.name}
              width={350}
              height={350}
              className="rounded-lg hover:cursor-zoom-in no-drag shadow-md hover:scale-105 transition-transform duration-300" // <-- Added no-drag class here
              onContextMenu={(e) => e.preventDefault()} // <-- Prevent right-click
              onDragStart={(e) => e.preventDefault()} // <-- Prevent dragging
              priority
            />
            {isHovered && (
              <div
                className="absolute hidden md:block rounded-full border border-gray-400 bg-cover transform scale-125"
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: cursorPos.y - 40,
                  left: cursorPos.x - 40,
                  backgroundImage: `url(${product.image})`,
                  backgroundPosition: `-${(cursorPos.x - 40) * 2}px -${
                    (cursorPos.y - 40) * 2
                  }px`,
                  backgroundSize: '600px 600px',
                  border: '2px solid gray',
                  transform: 'scale(1.5)',
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
        <div className="w-full max-w-lg flex flex-col items-center lg:items-start">
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
              <h1 className="text-xl text-red-500">Product on Clearance!</h1>
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
        <div className="flex flex-col items-center justify-center">
          <div className="card p-5 mb-4 bg-white shadow-lg rounded-lg w-full max-w-full lg:max-w-md">
            {!isOutOfStock && !isOutOfStockBox && !isOutOfStockClearance && active && currentCountInStock > 0 && (
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
                    {qty}
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
            )}
            {(isOutOfStock || isOutOfStockBox || isOutOfStockClearance || currentCountInStock <= 0) && (
            <div className="mb-2 justify-center gap-10 text-center items-center mt-2">
              <div className="font-bold">Status</div>
              <div className="">Out of Stock</div>
            </div>
          )}
            {showModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
                  <h2 className="font-bold">🚫 Out of Stock 🚫</h2>
                  <p className="text-[#788b9b]">
                  Sorry, we do not have any additional units of{" "}
                  <span className="font-bold text-[#144e8b]">{product.manufacturer} - {product.name}</span>{" "}
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
            {!isOutOfStock && !isOutOfStockBox && !isOutOfStockClearance && (
              <div>
                {product.each?.quickBooksQuantityOnHandProduction > 0 || product.box?.quickBooksQuantityOnHandProduction > 0 ? (
                  purchaseType === 'Each' || purchaseType === 'Box' ? (
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
                                setCurrentPrice(product.each?.wpPrice || 0);
                                setCurrentDescription(product.each?.description || '');
                                setCurrentCountInStock(product.each?.quickBooksQuantityOnHandProduction || 0);
                              } else if (e.target.value === 'Box' && product.box) {
                                setCurrentPrice(product.box?.wpPrice || 0);
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
                              <option value="Box">Box</option>
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
                          {hasPrice ? `$${currentPrice}` : "Call for Price"}
                        </div>
                      )
                    )}
                  </div>
                ) : null
              ) : (
             // If you only have Clearance, show it once without an "Add to Cart" button
              product.each?.clearanceCountInStock > 0 && (
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
              )
            )}
            {(product.each?.quickBooksQuantityOnHandProduction > 0 ||
              product.box?.quickBooksQuantityOnHandProduction > 0) && (
              <div>
                <div className="mb-2 flex justify-between">
                  <div className="font-bold">Status</div>
                <div>
                  {(purchaseType === 'Each' && isOutOfStock) ||
                  (purchaseType === 'Box' && isOutOfStockBox) ||
                  (purchaseType === 'Clearance' && isOutOfStockClearance)
                    ? 'Out of Stock'
                    : 'In Stock'
                  }
                </div>
              </div>
              {!session?.user?.active || !session?.user?.approved || status !== 'authenticated' ? (
                <>
                  <div className="border-t border-gray-300 my-2" />
                  <div className="text-sm text-gray-500 mt-1">
                    {!session?.user?.active || status !== 'authenticated'
                      ? 'Sign in to purchase this product.'
                      : 'You will be able to purchase this product when your account is Approved.'
                    }
                  </div>
                </>
              ) : null}
              {active === "loading" ? (
                "Loading"
              ) : (
                active && (
                  <>
                    {(!hasPrice || currentPrice === 0) ? (
                      <Link href="/support">
                        <button className="primary-button cart-button text-white">
                          Call for Price
                        </button>
                      </Link>
                    ) : (
                      <button
                        className="primary-button cart-button my-2"
                        type="button"
                        onClick={addToCartHandler}
                        disabled={
                          (purchaseType === 'Each' && isOutOfStock) ||
                          (purchaseType === 'Box' && isOutOfStockBox) ||
                          (purchaseType === 'Clearance' && isOutOfStockClearance)
                        }
                      >
                        {(purchaseType === 'Each' && isOutOfStock) ||
                        (purchaseType === 'Box' && isOutOfStockBox) ||
                        (purchaseType === 'Clearance' && isOutOfStockClearance)
                          ? 'Out of Stock'
                          : 'Add to Cart'}
                      </button>
                    )}
                  </>
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
        {( 
            (purchaseType === 'Each' && (isOutOfStock || currentCountInStock <= 0)) ||
            (purchaseType === 'Box' && (isOutOfStockBox || currentCountInStock <= 0)) ||
            (purchaseType === 'Clearance' && isOutOfStockClearance)
          ) && (
          <form className="text-center p-2" ref={form} onSubmit={sendEmail}>
            <label className="mt-3 font-bold">Join Our Wait List</label>
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
              name="emailManufacturer"
              className="contact__form-input"
              onChange={(e) => setEmailManufacturer(e.target.value)}
              value={emailManufacturer}
              hidden
              required
            />
            <button className="primary-button mt-3" type="submit" onClick={sendEmail}>
              Submit
            </button>
          </form>
        )}
          </div>
          </div>
        </div>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="hidden md:table min-w-full bg-white border border-gray-300 shadow-lg rounded-lg overflow-hidden mt-6 my-5">
          <thead className="bg-gray-100 border border-collapse">
            <tr>
              <th className="py-2 px-4 border-b">Image</th>
                {active === "loading" ? (
                 "Loading"
                  ) : (
                  active && (
                    <th className="py-2 px-4 border-b">Price</th>
                  )
                )}
              <th className="py-2 px-4 border-b">Stock Status</th>
              <th className="py-2 px-4 border-b">Reference</th>
              <th className="py-2 px-4 border-b">Manufacturer</th>
              <th className="py-2 px-4 border-b">Shipping Info</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-4 border-b flex justify-center">
                <Image src={product.image} alt={product.name} width={100} height={100} className="rounded-md" />
              </td>
                {active === "loading" ? (
                "Loading"
                 ) : (
                  active && (
                    <td className="py-2 px-4 border-b font-semibold">
                      {hasPrice ? `$${currentPrice}` : "Call for Price"}
                    </td>
                  )
                )}
              <td className="py-2 px-4 border-b">
                {currentCountInStock > 0 ? (
                  <span className="text-[#414b53] font-semibold">In Stock</span>
                ) : (
                  <span className="text-[#414b53] font-semibold">Out of Stock</span>
               )}
              </td>
              <td className="py-2 px-4 border-b">{product.name}</td>
              <td className="py-2 px-4 border-b">{product.manufacturer}</td>
              <td className="py-2 px-4 border-b text-sm text-gray-600">
                Want it by tomorrow? Place your order within the next 1 hour and 22 minutes and select overnight shipping at checkout.
              </td>
            </tr>
          </tbody>
        </table>
        <div className="md:hidden bg-gray-100 p-4 rounded-lg shadow-lg mt-6 my-6">
          <h2 className="text-xl font-bold mb-4">Product Information</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="rounded-lg ">
              <h3 className="font-bold">Image</h3>
              <Image src={product.image} alt={product.name} width={100} height={100} className="rounded-md" />
            </div>
            {active === "loading" ? (
              "Loading"
            ) : (
              active && (
                <div className="rounded-lg">
                  <h3 className="font-bold">Price</h3>
                  {hasPrice ? `$${currentPrice}` : "Call for Price"}
                </div>
               )
              )}
            <div className="rounded-lg">
              <h3 className="font-bold">Stock Status</h3>
              {currentCountInStock > 0 ? (
              <p className="text-[#414b53] font-semibold">In Stock</p>
              ) : (
                <p className="text-[#414b53] font-semibold">Out of Stock</p>
              )}
            </div>
            <div className="rounded-lg">
              <h3 className="font-bold">Reference</h3>
              <p>{product.reference || 'N/A'}</p>
            </div>
            <div className="rounded-lg">
              <h3 className="font-bold">Manufacturer</h3>
              <p>{product.manufacturer}</p>
            </div>
            <div className="rounded-lg">
              <h3 className="font-bold">Shipping Info</h3>
              <p className="text-sm text-gray-600">
                Want it by tomorrow? Place your order within the next 1 hour and 22 minutes and select overnight shipping at checkout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

