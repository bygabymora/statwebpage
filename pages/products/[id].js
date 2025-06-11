import Layout from "../../components/main/Layout";
import { useRouter } from "next/router";
import Link from "next/link";
import { BsCart2, BsChevronRight } from "react-icons/bs";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useModalContext } from "../../components/context/ModalContext";
import handleSendEmails from "../../utils/alertSystem/documentRelatedEmail";
import { messageManagement } from "../../utils/alertSystem/customers/messageManagement";
import moment from "moment-timezone";
import { generateProductJSONLD } from "../../utils/seo";

export default function ProductScreen() {
  const router = useRouter();
  const { pId: pId } = router.query;
  const [product, setProduct] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [isOutOfStock, setIsOutOfStock] = useState();
  const [isOutOfStockBox, setIsOutOfStockBox] = useState();
  const [isOutOfStockClearance, setIsOutOfStockClearance] = useState();
  const [qty, setQty] = useState(1);
  const { status, data: session } = useSession();
  const [currentPrice, setCurrentPrice] = useState();
  const [currentDescription, setCurrentDescription] = useState(
    product.each?.description || ""
  );
  const [nowLocal, setNowLocal] = useState(moment());
  const [nowTampa, setNowTampa] = useState(moment.tz("America/New_York"));
  const [currentCountInStock, setCurrentCountInStock] = useState(
    product.each?.countInStock || null
  );
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const form = useRef();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const { showStatusMessage, setUser, fetchUserData, user } = useModalContext();
  const [emailName, setEmailName] = useState("");
  const [emailManufacturer, setEmailManufacturer] = useState("");
  const hasPrice = currentPrice !== null && currentPrice !== 0;
  const active =
    session?.user?.active &&
    session?.user?.approved &&
    status === "authenticated";
  const [typeOfPurchase, setTypeOfPurchase] = useState(() => {
    if ((product.box?.quickBooksQuantityOnHandProduction ?? 0) > 0) {
      return "Box";
    } else if ((product.each?.quickBooksQuantityOnHandProduction ?? 0) > 0) {
      return "Each";
    }
    return "Each";
  });

  const fetchData = async () => {
    try {
      const data = await axios.get(`/api/products/${pId}`);
      if (!data) {
        showStatusMessage("error", "Product not found");
        return;
      }

      setProduct(data.data);
    } catch (error) {
      console.error("Error fetching product data:", error);
      showStatusMessage("error", "Failed to fetch product data");
    }
  };

  useEffect(() => {
    if (pId) {
      fetchData();
    }
  }, [pId]);

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

    if (eachStock === 0 && boxStock === 0) {
      setCurrentDescription(product.each?.description || "No description");
      setCurrentCountInStock(0);
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
    } else if (typeOfPurchase === "Clearance") {
      setCurrentPrice(product.clearance?.price ?? null);
      setCurrentDescription(product.each?.description || "No description");
      setCurrentCountInStock(product.each?.clearanceCountInStock ?? 0);
    }
  }, [typeOfPurchase, product]);

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

  const continueShoppingHandler = () => {
    setShowPopup(false);
    router.push("/");
  };

  const goToCartHandler = () => {
    setShowPopup(false);
    router.push("/cart");
  };

  //-----------------EmailJS-----------------//

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
    { href: "/", name: "Home" },
    { href: "/products", name: "Products" },
    { name: product.name },
  ];

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

  useEffect(() => {
    const timer = setInterval(() => {
      setNowLocal(moment()); // your browser’s clock
      setNowTampa(moment.tz("America/New_York")); // Tampa/Eastern
    }, 60_000); // tick every minute

    return () => clearInterval(timer);
  }, []);

  // compute Tampa cutoff (today at 15:30 Tampa time)
  const cutoff = nowTampa.clone().hour(15).minute(30).second(0);
  // compute your local midnight (start of next day)
  const midnight = nowLocal.clone().add(1, "day").startOf("day");

  if (!product) {
    // in case getServerSideProps returned no product
    return <div>Product not found</div>;
  }

  return (
    <Layout
      title={product.name}
      product={product}
      schema={generateProductJSONLD(product)}
    >
      <nav className='text-sm text-gray-700'>
        <ul className='flex ml-0 lg:ml-20 items-center space-x-2'>
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={index} className='flex items-center'>
              {breadcrumb.href ? (
                <Link
                  href={breadcrumb.href}
                  className='hover:underline text-[#144e8b]'
                >
                  {breadcrumb.name}
                </Link>
              ) : (
                <span>{breadcrumb.name}</span>
              )}
              {index < breadcrumbs.length - 1 && (
                <BsChevronRight className='mx-2 text-gray-500' />
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className='flex flex-col lg:flex-row items-center justify-center gap-5 p-6'>
        <div className='flex flex-col lg:flex-row items-center justify-center gap-5 p-6 bg-white shadow-lg rounded-xl'>
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
            className='relative '
          >
            <Image
              alt={product.name || ""}
              src={product.image}
              width={350}
              height={350}
              className='rounded-lg hover:cursor-zoom-in no-drag shadow-md hover:scale-105 transition-transform duration-300' // <-- Added no-drag class here
              onContextMenu={(e) => e.preventDefault()} // <-- Prevent right-click
              onDragStart={(e) => e.preventDefault()} // <-- Prevent dragging
            />
            {isHovered && (
              <div
                className='absolute hidden md:block rounded-full border border-gray-400 bg-cover transform scale-125'
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  position: "absolute",
                  top: cursorPos.y - 40,
                  left: cursorPos.x - 40,
                  backgroundImage: `url(${product.image})`,
                  backgroundPosition: `-${(cursorPos.x - 40) * 2}px -${
                    (cursorPos.y - 40) * 2
                  }px`,
                  backgroundSize: "600px 600px",
                  border: "2px solid gray",
                  transform: "scale(1.5)",
                  pointerEvents: "none",
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
        <div className='w-full max-w-lg flex flex-col items-center lg:items-start'>
          <ul className='space-y-2'>
            <li>
              <h1 className='text-xl font-bold text-[#144e8b]'>
                {product.name}
              </h1>
            </li>
            <li>
              <h1 className='text-xl font-bold text-[#144e8b]'>
                {product.manufacturer}
              </h1>
            </li>
            <li>
              <h1 className='text-xl font-bold text-[#144e8bee]'>
                {currentDescription}
              </h1>
            </li>
            <li className='text-sm text-[#788b9b]'>
              <h1 className='text-[#2c3339]'>{product.information}</h1>
            </li>
            {product.sentOverNight && (
              <li className='space-y-2'>
                <br />
                <br />
                <br />
                <br />
                <div className='text-lg font-semibold text-[#144e8bee]'>
                  Shipping recomendations:
                </div>
                <p className='text-sm text-[#788b9b]'>
                  It is recommended that this product ships overnight due to
                  temperature sensitivity. Stat Surgical Supply is not
                  responsible for product damage or failure if the customer
                  chooses another shipping method.
                </p>
              </li>
            )}
          </ul>
        </div>
        <div className='flex flex-col items-center justify-center'>
          <div className='card p-5 mb-4 bg-white shadow-lg rounded-lg w-full max-w-full lg:max-w-md'>
            {!isOutOfStock &&
              !isOutOfStockBox &&
              !isOutOfStockClearance &&
              active &&
              currentCountInStock > 0 &&
              hasPrice && (
                <div className='mb-2 flex items-center justify-center'>
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
            <div>
              {!isOutOfStock && !isOutOfStockBox && !isOutOfStockClearance && (
                <div>
                  {product.each?.quickBooksQuantityOnHandProduction > 0 ||
                  product.box?.quickBooksQuantityOnHandProduction > 0 ? (
                    typeOfPurchase === "Each" || typeOfPurchase === "Box" ? (
                      <div>
                        {active === "loading"
                          ? "Loading"
                          : active && (
                              <div className='mb-2 flex justify-between'>
                                <div className='font-bold'>U o M &nbsp;</div>
                                <select
                                  value={typeOfPurchase}
                                  onChange={(e) => {
                                    setTypeOfPurchase(e.target.value);
                                    if (
                                      e.target.value === "Each" &&
                                      product.each
                                    ) {
                                      setCurrentPrice(
                                        product.each?.wpPrice || 0
                                      );
                                      setCurrentDescription(
                                        product.each?.description || ""
                                      );
                                      setCurrentCountInStock(
                                        product.each
                                          ?.quickBooksQuantityOnHandProduction ||
                                          0
                                      );
                                    } else if (
                                      e.target.value === "Box" &&
                                      product.box
                                    ) {
                                      setCurrentPrice(
                                        product.box?.wpPrice || 0
                                      );
                                      setCurrentDescription(
                                        product.box?.description || ""
                                      );
                                      setCurrentCountInStock(
                                        product.box
                                          ?.quickBooksQuantityOnHandProduction ||
                                          0
                                      );
                                    }
                                  }}
                                >
                                  {product.each
                                    ?.quickBooksQuantityOnHandProduction >
                                    0 && <option value='Each'>Each</option>}
                                  {product.box
                                    ?.quickBooksQuantityOnHandProduction >
                                    0 && <option value='Box'>Box</option>}
                                  {product.clearance?.countInStock > 0 && (
                                    <option value='Clearance'>Clearance</option>
                                  )}
                                </select>
                              </div>
                            )}
                        {active === "loading"
                          ? "Loading"
                          : active && (
                              <div className='mb-2 flex justify-between'>
                                <div className='font-bold'>Price</div>
                                {hasPrice
                                  ? `$${currentPrice}`
                                  : "Call for Price"}
                              </div>
                            )}
                      </div>
                    ) : null
                  ) : (
                    // If you only have Clearance, show it once without an "Add to Cart" button
                    product.each?.clearanceCountInStock > 0 && (
                      <div className='my-5 text-center'>
                        <div className='text-red-500 font-bold text-lg'>
                          Clearance
                        </div>
                        {active === "loading" ? (
                          "Loading"
                        ) : active ? (
                          <div className='mb-2 flex justify-between'>
                            <div className='font-bold'>Price:</div>
                            <div className='ml-2 text-[#788b9b]'>
                              $ {product.clearance?.price || "Call for Price"}
                            </div>
                          </div>
                        ) : null}
                        <div className='text-[#414b53]'>{product.notes}</div>
                      </div>
                    )
                  )}
                  {(product.each?.quickBooksQuantityOnHandProduction > 0 ||
                    product.box?.quickBooksQuantityOnHandProduction > 0) &&
                    active && (
                      <div>
                        {console.log("session", session)}
                        <div className='mb-2 flex justify-between'>
                          <div className='font-bold'>Status</div>
                          <div>
                            {(typeOfPurchase === "Each" && isOutOfStock) ||
                            (typeOfPurchase === "Box" && isOutOfStockBox) ||
                            (typeOfPurchase === "Clearance" &&
                              isOutOfStockClearance)
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
                                    <button className='primary-button cart-button text-white'>
                                      Call for Price
                                    </button>
                                  </Link>
                                ) : (
                                  <button
                                    className='primary-button cart-button my-2'
                                    type='button'
                                    onClick={addToCartHandler}
                                    disabled={
                                      (typeOfPurchase === "Each" &&
                                        isOutOfStock) ||
                                      (typeOfPurchase === "Box" &&
                                        isOutOfStockBox) ||
                                      (typeOfPurchase === "Clearance" &&
                                        isOutOfStockClearance)
                                    }
                                  >
                                    {(typeOfPurchase === "Each" &&
                                      isOutOfStock) ||
                                    (typeOfPurchase === "Box" &&
                                      isOutOfStockBox) ||
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
              {showPopup && (
                <div className='popup'>
                  <div className='popup-content'>
                    <p>Items added to cart.</p>
                    <br />
                    <div className='flex gap-1 justify-evenly'>
                      <button
                        className='primary-button w-1/2 text-xs text-left'
                        onClick={continueShoppingHandler}
                      >
                        Continue Shopping
                      </button>
                      <button
                        className=' flex primary-button w-1/2 text-xs text-left items-center'
                        onClick={goToCartHandler}
                      >
                        <p>Go to Cart</p> &nbsp;
                        <BsCart2 className='text-2xl' />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {((typeOfPurchase === "Each" &&
                (isOutOfStock || currentCountInStock <= 0)) ||
                (typeOfPurchase === "Box" &&
                  (isOutOfStockBox || currentCountInStock <= 0)) ||
                (typeOfPurchase === "Clearance" && isOutOfStockClearance)) &&
                active && (
                  <form
                    className='text-center p-2'
                    ref={form}
                    onSubmit={sendEmail}
                  >
                    <label className='mt-3 font-bold'>Join Our Wait List</label>
                    <input
                      type='text'
                      name='user_name'
                      className='contact__form-input'
                      onChange={(e) => setName(e.target.value)}
                      value={name}
                      placeholder='Name'
                      required
                    />
                    <input
                      type='email'
                      name='user_email'
                      className='contact__form-input mt-2'
                      onChange={(e) => setEmail(e.target.value)}
                      value={email}
                      placeholder='Email'
                      required
                    />
                    <input
                      type='text'
                      name='emailManufacturer'
                      className='contact__form-input'
                      onChange={(e) => setEmailManufacturer(e.target.value)}
                      value={emailManufacturer}
                      hidden
                      required
                    />
                    <button
                      className='primary-button mt-3'
                      type='submit'
                      onClick={sendEmail}
                    >
                      Submit
                    </button>
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
          </div>
        </div>
      </div>
      <div className='w-full overflow-x-auto'>
        <table className='hidden md:table min-w-full bg-white border border-gray-300 shadow-lg rounded-lg overflow-hidden mt-6 my-5'>
          <thead className='bg-gray-100 border border-collapse'>
            <tr>
              <th className='py-2 px-4 border-b'>Image</th>
              {active === "loading"
                ? "Loading"
                : active && <th className='py-2 px-4 border-b'>Price</th>}
              {active && <th className='py-2 px-4 border-b'>Stock Status</th>}
              <th className='py-2 px-4 border-b'>Reference</th>
              <th className='py-2 px-4 border-b'>Manufacturer</th>
              <th className='py-2 px-4 border-b'>Shipping Info</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className='py-2 px-4 border-b flex justify-center'>
                <Image
                  src={product.image}
                  alt={product.name}
                  width={100}
                  height={100}
                  className='rounded-md'
                />
              </td>
              {active === "loading"
                ? "Loading"
                : active && (
                    <td className='py-2 px-4 border-b font-semibold'>
                      {hasPrice ? `$${currentPrice}` : "Call for Price"}
                    </td>
                  )}
              {active && (
                <td className='py-2 px-4 border-b'>
                  {currentCountInStock > 0 ? (
                    <span className='text-[#414b53] font-semibold'>
                      In Stock
                    </span>
                  ) : (
                    <span className='text-[#414b53] font-semibold'>
                      Out of Stock
                    </span>
                  )}
                </td>
              )}
              <td className='py-2 px-4 border-b'>{product.name}</td>
              <td className='py-2 px-4 border-b'>{product.manufacturer}</td>
              {nowTampa.isBefore(cutoff) ? (
                (() => {
                  const diff = moment.duration(cutoff.diff(nowTampa));
                  const hours = Math.floor(diff.asHours());
                  const minutes = diff.minutes();
                  return (
                    <td className='py-2 px-4 border-b text-sm text-gray-600'>
                      Want it by tomorrow? Place your order within the next{" "}
                      {hours} hour{hours !== 1 && "s"} and {minutes} minute
                      {minutes !== 1 && "s"} and select overnight shipping at
                      checkout.
                    </td>
                  );
                })()
              ) : nowLocal.isBefore(midnight) ? (
                <td className='py-2 px-4 border-b text-sm text-gray-600'>
                  The cutoff for next-day shipping has passed. Orders placed now
                  will arrive in two days.
                </td>
              ) : null}
            </tr>
          </tbody>
        </table>
        <div className='md:hidden bg-gray-100 p-4 rounded-lg shadow-lg mt-6 my-6'>
          <h2 className='text-xl font-bold mb-4'>Product Information</h2>
          <div className='grid grid-cols-1 gap-4'>
            <div className='rounded-lg '>
              <h3 className='font-bold'>Image</h3>
              <Image
                src={product.image}
                alt={product.name}
                width={100}
                height={100}
                className='rounded-md'
              />
            </div>
            {active === "loading"
              ? "Loading"
              : active && (
                  <div className='rounded-lg'>
                    <h3 className='font-bold'>Price</h3>
                    {hasPrice ? `$${currentPrice}` : "Call for Price"}
                  </div>
                )}
            <div className='rounded-lg'>
              <h3 className='font-bold'>Stock Status</h3>
              {currentCountInStock > 0 ? (
                <p className='text-[#414b53] font-semibold'>In Stock</p>
              ) : (
                <p className='text-[#414b53] font-semibold'>Out of Stock</p>
              )}
            </div>
            <div className='rounded-lg'>
              <h3 className='font-bold'>Reference</h3>
              <p>{product.reference || "N/A"}</p>
            </div>
            <div className='rounded-lg'>
              <h3 className='font-bold'>Manufacturer</h3>
              <p>{product.manufacturer}</p>
            </div>
            <div className='rounded-lg'>
              <h3 className='font-bold'>Shipping Info</h3>
              {nowTampa.isBefore(cutoff) ? (
                (() => {
                  const diff = moment.duration(cutoff.diff(nowTampa));
                  const hours = Math.floor(diff.asHours());
                  const minutes = diff.minutes();
                  return (
                    <div className='py-2 px-4 border-b text-sm text-gray-600'>
                      Want it by tomorrow? Place your order within the next{" "}
                      {hours} hour{hours !== 1 && "s"} and {minutes} minute
                      {minutes !== 1 && "s"} and select overnight shipping at
                      checkout.
                    </div>
                  );
                })()
              ) : nowLocal.isBefore(midnight) ? (
                <div className='py-2 px-4 border-b text-sm text-gray-600'>
                  The cutoff for next-day shipping has passed. Orders placed now
                  will arrive in two days.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  // 1️⃣ Extract pId from the query string, not from params.id
  const { pId } = context.query;
  if (!pId) {
    return { notFound: true };
  }

  // 2️⃣ Build your absolute URL for the fetch
  const host = context.req.headers.host;
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const apiUrl = `${protocol}://${host}/api/products/${pId}`;

  // 3️⃣ Fetch the product by its Mongo ObjectId
  const res = await fetch(apiUrl);
  if (!res.ok) {
    return { notFound: true };
  }
  const product = await res.json();

  // 4️⃣ Return it as a prop so it's inlined into the initial HTML
  return {
    props: { product },
  };
}
