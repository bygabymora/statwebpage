// ppages/products/[id]_new.js

import Layout from "../../components/main/Layout";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  BsCart2,
  BsChevronRight,
  BsInfoCircle,
  BsBuilding,
  BsGrid,
} from "react-icons/bs";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Listbox } from "@headlessui/react";
import { BiChevronDown, BiCheck } from "react-icons/bi";
import { useModalContext } from "../../components/context/ModalContext";
import handleSendEmails from "../../utils/alertSystem/documentRelatedEmail";
import { messageManagement } from "../../utils/alertSystem/customers/messageManagement";
import moment from "moment-timezone";
import { generateProductJSONLD } from "../../utils/seo";

export default function ProductScreen({ product }) {
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  const [isOutOfStock, setIsOutOfStock] = useState();
  const [isOutOfStockBox, setIsOutOfStockBox] = useState();
  const [isOutOfStockClearance, setIsOutOfStockClearance] = useState();
  const [qty, setQty] = useState(1);
  const { status, data: session } = useSession();
  const [currentPrice, setCurrentPrice] = useState();
  const [currentDescription, setCurrentDescription] = useState(
    product.each?.description || "",
  );
  const [nowLocal, setNowLocal] = useState(moment());
  const [nowTampa, setNowTampa] = useState(moment.tz("America/New_York"));
  const [currentCountInStock, setCurrentCountInStock] = useState(
    product.each?.countInStock || null,
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
    if ((product.box?.countInStock ?? 0) > 0) {
      return "Box";
    } else if ((product.each?.countInStock ?? 0) > 0) {
      return "Each";
    }
    return "Each";
  });

  // Tab state management
  const [activeTab, setActiveTab] = useState("related");

  const tabs = [
    { id: "related", label: "RELATED ITEMS", icon: BsGrid },
    { id: "details", label: "ADDITIONAL DETAILS", icon: BsInfoCircle },
    { id: "manufacturer", label: "MANUFACTURER", icon: BsBuilding },
  ];

  useEffect(() => {
    if (product.countInStock || 0) {
      setTypeOfPurchase("Box");
      setCurrentPrice(product.box?.wpPrice || 0);
      setCurrentDescription(product.box?.description || "");
      setCurrentCountInStock(product.box?.countInStock ?? null);
    }
  }, [typeOfPurchase, product.box, product.countInStock]);

  useEffect(() => {
    const eachStock = product.each?.countInStock ?? 0;
    const boxStock = product.box?.countInStock ?? 0;

    if (eachStock === 0 && boxStock === 0) {
      setCurrentDescription(product.each?.description || "No description");
      setCurrentCountInStock(0);
    }
  }, [product]);

  useEffect(() => {
    if (typeOfPurchase === "Each") {
      setCurrentPrice(product.each?.wpPrice ?? null);
      setCurrentDescription(product.each?.description || "");
      setCurrentCountInStock(product.each?.countInStock ?? null);
    }
  }, [typeOfPurchase, product.each]);

  const availableTypes = [
    ...(product.each?.countInStock > 0 ? ["Each"] : []),
    ...(product.box?.countInStock > 0 ? ["Box"] : []),
    ...((
      product.each?.clearanceCountInStock > 0 ||
      product.box?.clearanceCountInStock > 0
    ) ?
      ["Clearance"]
    : []),
  ];

  useEffect(() => {
    if (typeOfPurchase === "Each") {
      setCurrentPrice(product.each?.wpPrice ?? null);
      setCurrentDescription(product.each?.description || "");
      setCurrentCountInStock(product.each?.countInStock ?? 0);
    } else if (typeOfPurchase === "Box") {
      setCurrentPrice(product.box?.wpPrice ?? null);
      setCurrentDescription(product.box?.description || "");
      setCurrentCountInStock(product.box?.countInStock ?? 0);
    } else if (typeOfPurchase === "Clearance") {
      setCurrentPrice(product.clearance?.price ?? null);
      setCurrentDescription(product.each?.description || "No description");
      setCurrentCountInStock(product.each?.clearanceCountInStock ?? 0);
    }
  }, [typeOfPurchase, product]);

  const addToCartHandler = async () => {
    const exisItem = user.cart?.find(
      (x) => x.productId === product._id && x.typeOfPurchase === typeOfPurchase,
    );
    const quantity = exisItem ? exisItem.quantity + qty : qty;

    const { data } = await axios.get(`/api/products/${product._id}`);

    if (
      typeOfPurchase === "Each" &&
      (data.each?.countInStock ?? 0) < quantity
    ) {
      setShowModal(true);
      setIsOutOfStock(true);
      return;
    } else if (
      typeOfPurchase === "Box" &&
      (data.box?.countInStock ?? 0) < quantity
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
        typeOfPurchase === "Each" ? product.each?.wpPrice
        : typeOfPurchase === "Box" ? product.box?.wpPrice
        : typeOfPurchase === "Clearance" ? product.clearance?.price
        : product.price,
      wpPrice:
        typeOfPurchase === "Each" ? product.each?.wpPrice
        : typeOfPurchase === "Box" ? product.box?.wpPrice
        : typeOfPurchase === "Clearance" ? product.clearance?.price
        : product.price,
      price:
        typeOfPurchase === "Each" ? product.each?.wpPrice
        : typeOfPurchase === "Box" ? product.box?.wpPrice
        : typeOfPurchase === "Clearance" ? product.clearance?.price
        : product.price,
    });

    setQty(1);
    const updatedUser = await fetchUserData();
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

  //-----------------Email-----------------//

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
      setNowLocal(moment()); // your browser's clock
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

  const getProductTitle = (product) => {
    const base = `${product.manufacturer}: ${product.name}`;
    return `${base} | Fast Delivery & Best Price`;
  };

  const getProductDescription = (product) => {
    const description =
      product.each?.description || product.box?.description || product.name;
    return `${product.manufacturer} ${product.name} - ${description.slice(
      0,
      150,
    )}... Available for fast delivery with competitive pricing.`;
  };

  // Tab content components
  const RelatedItemsTab = () => (
    <div className='bg-gray-50 p-6 rounded-lg'>
      <h3 className='text-lg font-semibold text-[#144e8b] mb-4'>
        Related Products
      </h3>
      <p className='text-gray-600'>
        Related products will be displayed here based on category and
        manufacturer.
      </p>
      {/* TODO: Implement related products logic */}
    </div>
  );

  const AdditionalDetailsTab = () => (
    <div className='bg-gray-50 p-6 rounded-lg'>
      <h3 className='text-lg font-semibold text-[#144e8b] mb-4'>
        Product Specifications
      </h3>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <h4 className='font-medium text-gray-800 mb-2'>
            Product Information
          </h4>
          <ul className='space-y-2 text-sm text-gray-600'>
            <li>
              <span className='font-medium'>Name:</span> {product.name}
            </li>
            <li>
              <span className='font-medium'>Manufacturer:</span>{" "}
              {product.manufacturer}
            </li>
            {product.information && (
              <li>
                <span className='font-medium'>Details:</span>{" "}
                {product.information}
              </li>
            )}
            {product.each?.description && (
              <li>
                <span className='font-medium'>Each Description:</span>{" "}
                {product.each.description}
              </li>
            )}
            {product.box?.description && (
              <li>
                <span className='font-medium'>Box Description:</span>{" "}
                {product.box.description}
              </li>
            )}
          </ul>
        </div>
        <div>
          <h4 className='font-medium text-gray-800 mb-2'>
            Shipping & Handling
          </h4>
          <ul className='space-y-2 text-sm text-gray-600'>
            {product.sentOverNight && (
              <li className='text-orange-600'>
                <span className='font-medium'>Special Shipping:</span> Overnight
                recommended due to temperature sensitivity
              </li>
            )}
            <li>
              <span className='font-medium'>Stock Status:</span>{" "}
              {currentCountInStock > 0 ? "In Stock" : "Out of Stock"}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  const ManufacturerTab = () => (
    <div className='bg-gray-50 p-6 rounded-lg'>
      <h3 className='text-lg font-semibold text-[#144e8b] mb-4'>
        About {product.manufacturer}
      </h3>
      <div className='bg-white p-4 rounded border'>
        <h4 className='font-medium text-gray-800 mb-2'>
          {product.manufacturer}
        </h4>
        <p className='text-gray-600 text-sm mb-3'>
          Trusted medical supply manufacturer providing high-quality healthcare
          products.
        </p>
        <div className='text-sm text-gray-500'>
          <p>• Certified medical device manufacturer</p>
          <p>• Quality assurance and regulatory compliance</p>
          <p>• Reliable supply chain and distribution</p>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "related":
        return <RelatedItemsTab />;
      case "details":
        return <AdditionalDetailsTab />;
      case "manufacturer":
        return <ManufacturerTab />;
      default:
        return <RelatedItemsTab />;
    }
  };

  return (
    <Layout
      title={getProductTitle(product)}
      description={getProductDescription(product)}
      product={product}
      schema={generateProductJSONLD(product)}
      image={product.image}
      keywords={`${product.manufacturer}, ${product.name}, medical supplies, healthcare equipment`}
    >
      {/* Breadcrumb Navigation */}
      <nav className='text-sm text-gray-700 mb-6'>
        <ul className='flex ml-0 lg:ml-20 items-center space-x-2'>
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={index} className='flex items-center'>
              {breadcrumb.href ?
                <Link
                  href={breadcrumb.href}
                  className='hover:underline text-[#144e8b]'
                >
                  {breadcrumb.name}
                </Link>
              : <span className='text-[#144e8b] font-medium'>
                  {breadcrumb.name}
                </span>
              }
              {index < breadcrumbs.length - 1 && (
                <BsChevronRight className='mx-2 text-gray-500' />
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Product Layout */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
          {/* Product Image Section */}
          <div className='flex justify-center lg:justify-start'>
            <div className='bg-white shadow-lg rounded-xl p-6'>
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
                className='relative'
              >
                <Image
                  alt={`${product.manufacturer} ${product.name} - Professional supplies product for healthcare facilities`}
                  src={product.image}
                  title={`${product.manufacturer} ${
                    product.name
                  } - ${currentDescription.slice(0, 100)}`}
                  width={500}
                  height={500}
                  className='rounded-lg hover:cursor-zoom-in no-drag shadow-md hover:scale-105 transition-transform duration-300 w-full h-auto'
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  priority
                />
                {isHovered && (
                  <div
                    className='absolute hidden md:block rounded-full border border-gray-400 bg-cover transform scale-125'
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      position: "absolute",
                      top: cursorPos.y - 60,
                      left: cursorPos.x - 60,
                      backgroundImage: `url(${product.image})`,
                      backgroundPosition: `-${(cursorPos.x - 60) * 2}px -${
                        (cursorPos.y - 60) * 2
                      }px`,
                      backgroundSize: "1000px 1000px",
                      border: "3px solid #144e8b",
                      transform: "scale(1.5)",
                      pointerEvents: "none",
                      zIndex: 10,
                    }}
                  ></div>
                )}
              </div>
            </div>
          </div>

          {/* Product Information Section */}
          <div className='space-y-6'>
            <div>
              <h1 className='text-3xl font-bold text-[#144e8b] mb-2'>
                {product.name}
              </h1>
              <h2 className='text-xl font-semibold text-[#144e8b] mb-3'>
                {product.manufacturer}
              </h2>
              <p className='text-lg text-gray-700 leading-relaxed'>
                {currentDescription}
              </p>
              {product.information && (
                <p className='text-sm text-gray-600 mt-2'>
                  {product.information}
                </p>
              )}
            </div>

            {product.sentOverNight && (
              <div className='bg-orange-50 border-l-4 border-orange-400 p-4 rounded'>
                <div className='flex'>
                  <div className='ml-3'>
                    <h3 className='text-sm font-medium text-orange-800'>
                      Special Shipping Requirements
                    </h3>
                    <p className='mt-1 text-sm text-orange-700'>
                      It is recommended that this product ships overnight due to
                      temperature sensitivity. Stat Surgical Supply is not
                      responsible for product damage or failure if the customer
                      chooses another shipping method.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Purchase Options Card */}
            <div className='bg-white shadow-lg rounded-xl p-6'>
              {!isOutOfStock &&
                !isOutOfStockBox &&
                !isOutOfStockClearance &&
                active &&
                currentCountInStock > 0 &&
                hasPrice && (
                  <div className='mb-4 flex items-center justify-center'>
                    <div className='font-bold mr-4'>Quantity</div>
                    <div className='flex items-center'>
                      <button
                        className='border px-3 py-1 rounded-l bg-gray-100 hover:bg-gray-200'
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        disabled={qty <= 1}
                      >
                        -
                      </button>
                      <span className='px-4 py-1 border-t border-b'>{qty}</span>
                      <button
                        className='border px-3 py-1 rounded-r bg-gray-100 hover:bg-gray-200'
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
                  <div className='mb-4 text-center'>
                    <div className='font-bold text-lg text-red-600'>
                      Out of Stock
                    </div>
                  </div>
                )}

              {showModal && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]'>
                  <div className='bg-white p-6 rounded-lg shadow-lg max-w-sm text-center'>
                    <h2 className='font-bold text-lg mb-2'>
                      🚫 Sorry, Out of Stock 🚫
                    </h2>
                    <span className='font-bold text-[#144e8b]'>
                      {product.manufacturer} - {product.name} - {typeOfPurchase}
                    </span>
                    {user?.cart?.length > 0 &&
                      handleMatchProduct(product._id) > 0 && (
                        <p className='mt-2 font-semibold'>
                          You have{" "}
                          {handleMatchProduct(product._id) > 1 ?
                            handleMatchProduct(product._id) +
                            " units of this item in your cart, that are available for purchase"
                          : "1 unit of this item in your cart, that is available for purchase"
                          }
                          .
                        </p>
                      )}
                    <p className='text-gray-600 mt-2'>
                      We do not have any additional units at this moment. Please
                      contact us for more information.
                    </p>
                    <button
                      className='mt-4 px-4 py-2 bg-[#144e8b] text-white rounded-lg hover:bg-blue-700 transition'
                      onClick={() => setShowModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {!isOutOfStock && !isOutOfStockBox && !isOutOfStockClearance && (
                <div>
                  {
                    (
                      product.each?.countInStock > 0 ||
                      product.box?.countInStock > 0
                    ) ?
                      typeOfPurchase === "Each" || typeOfPurchase === "Box" ?
                        <div className='space-y-4'>
                          {active && (
                            <div className='flex justify-between items-center'>
                              <div className='font-bold'>Unit of Measure</div>
                              <Listbox
                                value={typeOfPurchase}
                                onChange={(value) => {
                                  setTypeOfPurchase(value);
                                  if (value === "Each" && product.each) {
                                    setCurrentPrice(product.each?.wpPrice || 0);
                                    setCurrentDescription(
                                      product.each?.description || "",
                                    );
                                    setCurrentCountInStock(
                                      product.each?.countInStock || 0,
                                    );
                                  } else if (value === "Box" && product.box) {
                                    setCurrentPrice(product.box?.wpPrice || 0);
                                    setCurrentDescription(
                                      product.box?.description || "",
                                    );
                                    setCurrentCountInStock(
                                      product.box?.countInStock || 0,
                                    );
                                  } else if (
                                    value === "Clearance" &&
                                    product.clearance
                                  ) {
                                    setCurrentPrice(
                                      product.clearance?.price || 0,
                                    );
                                    setCurrentDescription(
                                      product.clearance?.description || "",
                                    );
                                    setCurrentCountInStock(
                                      product.each?.clearanceCountInStock > 0 ||
                                        product.box?.clearanceCountInStock > 0,
                                    );
                                  }
                                }}
                              >
                                <div className='relative'>
                                  <Listbox.Button className='w-full rounded-md py-2 pl-3 pr-8 text-sm bg-white text-left shadow-md border-2 border-[#144e8b] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#144e8b]'>
                                    {typeOfPurchase || "Select"}
                                  </Listbox.Button>
                                  <BiChevronDown className='w-4 h-4 text-[#144e8b] absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none' />
                                  <Listbox.Options className='absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none text-sm'>
                                    {availableTypes.map((option) => (
                                      <Listbox.Option
                                        key={option}
                                        value={option}
                                        className={({ active }) =>
                                          `cursor-pointer select-none px-4 py-2 ${
                                            active ?
                                              "bg-blue-100 text-[#144e8b]"
                                            : "text-gray-900"
                                          }`
                                        }
                                      >
                                        {({ selected }) => (
                                          <span className='flex items-center justify-between'>
                                            {option}
                                            {selected && (
                                              <BiCheck className='w-4 h-4 text-[#144e8b]' />
                                            )}
                                          </span>
                                        )}
                                      </Listbox.Option>
                                    ))}
                                  </Listbox.Options>
                                </div>
                              </Listbox>
                            </div>
                          )}

                          {active && (
                            <div className='flex justify-between items-center'>
                              <div className='font-bold'>Price</div>
                              <div className='text-lg font-semibold text-[#144e8b]'>
                                {hasPrice ?
                                  `$${currentPrice}`
                                : "Call for Price"}
                              </div>
                            </div>
                          )}

                          {active && (
                            <div className='flex justify-between items-center'>
                              <div className='font-bold'>Status</div>
                              <div
                                className={`font-semibold ${
                                  currentCountInStock > 0 ? "text-green-600" : (
                                    "text-red-600"
                                  )
                                }`}
                              >
                                {currentCountInStock > 0 ?
                                  "In Stock"
                                : "Out of Stock"}
                              </div>
                            </div>
                          )}

                          {active && (
                            <>
                              {!hasPrice || currentPrice === 0 ?
                                <Link href='/support'>
                                  <button className='w-full bg-[#144e8b] text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold'>
                                    Call for Price
                                  </button>
                                </Link>
                              : <button
                                  className='w-full bg-[#144e8b] text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold disabled:bg-gray-400'
                                  type='button'
                                  onClick={addToCartHandler}
                                  disabled={
                                    (typeOfPurchase === "Each" &&
                                      isOutOfStock) ||
                                    (typeOfPurchase === "Box" &&
                                      isOutOfStockBox) ||
                                    (typeOfPurchase === "Clearance" &&
                                      isOutOfStockClearance) ||
                                    currentCountInStock <= 0
                                  }
                                >
                                  {currentCountInStock <= 0 ?
                                    "Out of Stock"
                                  : "Add to Cart"}
                                </button>
                              }
                            </>
                          )}
                        </div>
                      : null
                      // If you only have Clearance, show it once without an "Add to Cart" button
                    : product.each?.clearanceCountInStock > 0 && (
                        <div className='text-center'>
                          <div className='text-red-500 font-bold text-lg mb-2'>
                            Clearance
                          </div>
                          {active && (
                            <div className='mb-2 flex justify-between'>
                              <div className='font-bold'>Price:</div>
                              <div className='ml-2 text-[#144e8b]'>
                                $ {product.clearance?.price || "Call for Price"}
                              </div>
                            </div>
                          )}
                          <div className='text-gray-600'>{product.notes}</div>
                        </div>
                      )

                  }
                </div>
              )}

              {showPopup && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]'>
                  <div className='bg-white p-6 rounded-lg shadow-lg max-w-sm text-center'>
                    <p className='mb-4'>Items added to cart.</p>
                    <div className='flex gap-4 justify-center'>
                      <button
                        className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition'
                        onClick={continueShoppingHandler}
                      >
                        Continue Shopping
                      </button>
                      <button
                        className='bg-[#144e8b] text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center'
                        onClick={goToCartHandler}
                      >
                        Go to Cart <BsCart2 className='ml-2' />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Wait List Form */}
              {((typeOfPurchase === "Each" &&
                (isOutOfStock || currentCountInStock <= 0)) ||
                (typeOfPurchase === "Box" &&
                  (isOutOfStockBox || currentCountInStock <= 0)) ||
                (typeOfPurchase === "Clearance" && isOutOfStockClearance)) &&
                active && (
                  <form
                    className='mt-6 p-4 bg-gray-50 rounded-lg'
                    ref={form}
                    onSubmit={sendEmail}
                  >
                    <label className='block text-center font-bold text-[#144e8b] mb-4'>
                      Join Our Wait List
                    </label>
                    <div className='space-y-3'>
                      <input
                        type='text'
                        name='user_name'
                        className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#144e8b] focus:border-transparent'
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        placeholder='Name'
                        required
                      />
                      <input
                        type='email'
                        name='user_email'
                        className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#144e8b] focus:border-transparent'
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        placeholder='Email'
                        required
                      />
                      <input
                        type='text'
                        name='emailManufacturer'
                        onChange={(e) => setEmailManufacturer(e.target.value)}
                        value={emailManufacturer}
                        hidden
                        required
                      />
                      <button
                        className='w-full bg-[#144e8b] text-white py-2 px-4 rounded-md hover:bg-blue-700 transition font-semibold'
                        type='submit'
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                )}

              {/* Non-authenticated user display */}
              {session?.user && !active ?
                <div className='text-center p-4'>
                  <div className='font-semibold text-gray-700'>
                    You will be able to see this product info soon.
                  </div>
                </div>
              : !session?.user ?
                <div className='text-center p-4 space-y-4'>
                  {(
                    (product.each?.wpPrice &&
                      product.each?.wpPrice !== "Call for price") ||
                    (product.box?.wpPrice &&
                      product.box?.wpPrice !== "Call for price")
                  ) ?
                    <div>
                      <span className='font-semibold'>
                        Web price: $
                        {product.each?.wpPrice || product.box?.wpPrice} per{" "}
                        {product.each?.wpPrice ? "Unit" : "Box"}.
                      </span>
                      <br />
                      <span className='text-gray-600'>
                        Contact us or register for custom pricing.
                      </span>
                    </div>
                  : <div className='text-gray-600'>
                      Sign in to see availability and purchase this product at a
                      custom price.
                    </div>
                  }
                  <div className='flex gap-4 justify-center'>
                    <Link href='/Login'>
                      <button className='bg-[#144e8b] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold'>
                        Login
                      </button>
                    </Link>
                    <Link href='/Register'>
                      <button className='bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition font-semibold'>
                        Register
                      </button>
                    </Link>
                  </div>
                </div>
              : null}
            </div>
          </div>
        </div>

        {/* Tabbed Interface Section */}
        <div className='bg-white shadow-lg rounded-xl overflow-hidden mb-8'>
          {/* Tab Navigation */}
          <div className='border-b border-gray-200'>
            <nav className='flex flex-wrap'>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                      activeTab === tab.id ?
                        "border-[#144e8b] text-[#144e8b] bg-blue-50"
                      : "border-transparent text-gray-500 hover:text-[#144e8b] hover:border-gray-300"
                    }`}
                  >
                    <Icon className='w-4 h-4 mr-2' />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className='p-6'>{renderTabContent()}</div>
        </div>

        {/* Shipping Information Table */}
        <div className='bg-white shadow-lg rounded-xl overflow-hidden mb-8'>
          <div className='p-6'>
            <h3 className='text-xl font-bold text-[#144e8b] mb-4'>
              Product & Shipping Information
            </h3>

            {/* Desktop Table View */}
            <div className='hidden md:block overflow-x-auto'>
              <table className='min-w-full'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Image
                    </th>
                    {active && (
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Price
                      </th>
                    )}
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Stock Status
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Reference
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Manufacturer
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Shipping Info
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  <tr>
                    <td className='px-4 py-4'>
                      <Image
                        src={product.image}
                        alt={currentDescription}
                        width={80}
                        height={80}
                        className='rounded-md'
                        title={product.name}
                      />
                    </td>
                    {active && (
                      <td className='px-4 py-4 font-semibold text-[#144e8b]'>
                        {hasPrice ? `$${currentPrice}` : "Call for Price"}
                      </td>
                    )}
                    <td className='px-4 py-4'>
                      <span
                        className={`font-semibold ${
                          currentCountInStock > 0 ? "text-green-600" : (
                            "text-red-600"
                          )
                        }`}
                      >
                        {currentCountInStock > 0 ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td className='px-4 py-4'>{product.name}</td>
                    <td className='px-4 py-4'>{product.manufacturer}</td>
                    <td className='px-4 py-4 text-sm text-gray-600'>
                      {nowTampa.isBefore(cutoff) ?
                        (() => {
                          const diff = moment.duration(cutoff.diff(nowTampa));
                          const hours = Math.floor(diff.asHours());
                          const minutes = diff.minutes();
                          return (
                            <>
                              Want it by tomorrow? Place your order within the
                              next{" "}
                              <span className='font-semibold text-[#144e8b]'>
                                {hours} hour{hours !== 1 && "s"} and {minutes}{" "}
                                minute{minutes !== 1 && "s"}
                              </span>{" "}
                              and select overnight shipping at checkout.
                            </>
                          );
                        })()
                      : nowLocal.isBefore(midnight) ?
                        <>
                          The cutoff for next-day shipping has passed. Orders
                          placed now will arrive in two days.
                        </>
                      : null}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className='md:hidden space-y-4'>
              <div className='bg-gray-50 rounded-lg p-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <h4 className='font-medium text-gray-800 mb-2'>Image</h4>
                    <Image
                      src={product.image}
                      alt={currentDescription}
                      width={80}
                      height={80}
                      className='rounded-md'
                      title={product.name}
                    />
                  </div>
                  {active && (
                    <div>
                      <h4 className='font-medium text-gray-800 mb-2'>Price</h4>
                      <p className='font-semibold text-[#144e8b]'>
                        {hasPrice ? `$${currentPrice}` : "Call for Price"}
                      </p>
                    </div>
                  )}
                  <div>
                    <h4 className='font-medium text-gray-800 mb-2'>
                      Stock Status
                    </h4>
                    <span
                      className={`font-semibold ${
                        currentCountInStock > 0 ? "text-green-600" : (
                          "text-red-600"
                        )
                      }`}
                    >
                      {currentCountInStock > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                  <div>
                    <h4 className='font-medium text-gray-800 mb-2'>
                      Reference
                    </h4>
                    <p>{product.name}</p>
                  </div>
                  <div>
                    <h4 className='font-medium text-gray-800 mb-2'>
                      Manufacturer
                    </h4>
                    <p>{product.manufacturer}</p>
                  </div>
                  <div className='col-span-2'>
                    <h4 className='font-medium text-gray-800 mb-2'>
                      Shipping Info
                    </h4>
                    <p className='text-sm text-gray-600'>
                      {nowTampa.isBefore(cutoff) ?
                        (() => {
                          const diff = moment.duration(cutoff.diff(nowTampa));
                          const hours = Math.floor(diff.asHours());
                          const minutes = diff.minutes();
                          return (
                            <>
                              Want it by tomorrow? Place your order within the
                              next{" "}
                              <span className='font-semibold text-[#144e8b]'>
                                {hours} hour{hours !== 1 && "s"} and {minutes}{" "}
                                minute{minutes !== 1 && "s"}
                              </span>{" "}
                              and select overnight shipping at checkout.
                            </>
                          );
                        })()
                      : nowLocal.isBefore(midnight) ?
                        <>
                          The cutoff for next-day shipping has passed. Orders
                          placed now will arrive in two days.
                        </>
                      : null}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional CSS Styles */}
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
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { id, pId } = context.query;
  const lookup = pId || id;
  if (!lookup) {
    return { notFound: true };
  }

  const host = context.req.headers.host;
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  // forward cookies so `/api/products/[lookup]` sees your session
  const cookie = context.req.headers.cookie || "";

  const res = await fetch(
    `${protocol}://${host}/api/products/${encodeURIComponent(lookup)}`,
    {
      headers: { cookie },
    },
  );

  if (!res.ok) {
    return { notFound: true };
  }

  const product = await res.json();
  return {
    props: { product },
  };
}
