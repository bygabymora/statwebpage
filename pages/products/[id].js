// pages/products/[id].js

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
import {
  findManufacturerProfile,
  manufacturerProfiles,
} from "../../utils/manufacturerProfiles";
import RelatedProducts from "../../components/products/RelatedProducts";

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
    ...(product.each?.clearanceCountInStock > 0 ||
    product.box?.clearanceCountInStock > 0
      ? ["Clearance"]
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
      (x) => x.productId === product._id && x.typeOfPurchase === typeOfPurchase
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

  const getProductTitle = (product) => {
    const base = `${product.manufacturer}: ${product.name}`;
    return `${base} | Fast Delivery & Best Price`;
  };

  const getProductDescription = (product) => {
    const description =
      product.each?.description || product.box?.description || product.name;
    return `${product.manufacturer} ${product.name} - ${description.slice(
      0,
      150
    )}... Available for fast delivery with competitive pricing.`;
  };

  // Tab content components
  const RelatedItemsTab = () => (
    <RelatedProducts currentProduct={product} limit={4} />
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
              <h1 className='text-xl font-bold text-[#0e355e]'>
                {product.name}
              </h1>
            </li>
            <li>
              <h1 className='text-xl font-bold text-[#0e355e]'>
                {product.manufacturer}
              </h1>
            </li>
            <li>
              <h2 className='text-xl font-bold text-[#0e355e]'>
                {currentDescription}
              </h2>
            </li>
            {product.information && (
              <h3>
                <p className='text-sm text-[#788b9b]'>{product.information}</p>
              </h3>
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
          <h4 className='font-medium text-gray-800 mb-3'>
            Shipping & Handling
          </h4>
          <ul className='space-y-3 text-sm text-gray-600'>
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
            <h4 className='font-medium text-gray-800 mt-4 mb-2'>
              Shipping Cutoff
            </h4>
            <li>
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
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  const ManufacturerTab = () => {
    const profile = findManufacturerProfile(product.manufacturer);

    if (profile && profile !== manufacturerProfiles.generic) {
      return (
        <div className='bg-gray-50 p-6 rounded-lg'>
          <h3 className='text-lg font-semibold text-[#144e8b] mb-4'>
            About {profile.name}
          </h3>
          <div className='bg-white p-4 rounded border shadow-sm'>
            <div className='flex flex-col md:flex-row md:justify-between md:items-start mb-4'>
              <div className='flex-1'>
                <h4 className='font-semibold text-gray-800 text-lg mb-2'>
                  {profile.name}
                </h4>
                {profile.foundedYear && (
                  <p className='text-sm text-gray-500 mb-2'>
                    Founded: {profile.foundedYear}
                  </p>
                )}
              </div>
              {profile.website && (
                <div className='mt-2 md:mt-0'>
                  <a
                    href={profile.website}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center px-4 py-2 bg-[#144e8b] text-white text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200'
                  >
                    Visit Website
                    <svg
                      className='ml-2 w-4 h-4'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
                      />
                    </svg>
                  </a>
                </div>
              )}
            </div>

            <p className='text-gray-600 text-sm mb-4 leading-relaxed'>
              {profile.description}
            </p>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {profile.specialties && profile.specialties.length > 0 && (
                <div>
                  <p className='font-medium text-gray-700 mb-2'>Specialties</p>
                  <ul className='text-sm text-gray-600 space-y-1'>
                    {profile.specialties.map((specialty) => (
                      <li key={specialty} className='flex items-center'>
                        <span className='w-2 h-2 bg-[#144e8b] rounded-full mr-2'></span>
                        {specialty}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {profile.certifications && profile.certifications.length > 0 && (
                <div>
                  <p className='font-medium text-gray-700 mb-2'>
                    Certifications
                  </p>
                  <ul className='text-sm text-gray-600 space-y-1'>
                    {profile.certifications.map((cert) => (
                      <li key={cert} className='flex items-center'>
                        <span className='w-2 h-2 bg-green-500 rounded-full mr-2'></span>
                        {cert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {profile.supportEmail && (
              <div className='mt-4 pt-4 border-t border-gray-200'>
                <p className='font-medium text-gray-700 mb-2'>
                  Customer Support
                </p>
                <a
                  href={`mailto:${profile.supportEmail}`}
                  className='text-[#144e8b] hover:text-blue-700 text-sm underline transition-colors duration-200'
                >
                  {profile.supportEmail}
                </a>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Enhanced fallback for unknown manufacturers
    return (
      <div className='bg-gray-50 p-6 rounded-lg'>
        <h3 className='text-lg font-semibold text-[#144e8b] mb-4'>
          About {product.manufacturer}
        </h3>
        <div className='bg-white p-4 rounded border shadow-sm'>
          <h4 className='font-semibold text-gray-800 text-lg mb-3'>
            {product.manufacturer}
          </h4>
          <p className='text-gray-600 text-sm mb-4 leading-relaxed'>
            {product.manufacturer} is a trusted medical supply manufacturer
            providing high-quality healthcare products and medical devices to
            healthcare facilities worldwide.
          </p>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <p className='font-medium text-gray-700 mb-2'>
                Quality Standards
              </p>
              <ul className='text-sm text-gray-600 space-y-1'>
                <li className='flex items-center'>
                  <span className='w-2 h-2 bg-green-500 rounded-full mr-2'></span>
                  FDA Registered Facility
                </li>
                <li className='flex items-center'>
                  <span className='w-2 h-2 bg-green-500 rounded-full mr-2'></span>
                  ISO 13485 Certified
                </li>
                <li className='flex items-center'>
                  <span className='w-2 h-2 bg-green-500 rounded-full mr-2'></span>
                  Quality Assurance Verified
                </li>
              </ul>
            </div>

            <div>
              <p className='font-medium text-gray-700 mb-2'>
                Product Categories
              </p>
              <ul className='text-sm text-gray-600 space-y-1'>
                <li className='flex items-center'>
                  <span className='w-2 h-2 bg-[#144e8b] rounded-full mr-2'></span>
                  Medical Devices
                </li>
                <li className='flex items-center'>
                  <span className='w-2 h-2 bg-[#144e8b] rounded-full mr-2'></span>
                  Surgical Instruments
                </li>
                <li className='flex items-center'>
                  <span className='w-2 h-2 bg-[#144e8b] rounded-full mr-2'></span>
                  Healthcare Supplies
                </li>
              </ul>
            </div>
          </div>

          <div className='mt-4 pt-4 border-t border-gray-200'>
            <p className='text-sm text-gray-600'>
              For specific manufacturer information, certifications, or support
              details, please{" "}
              <Link
                href='/support'
                className='text-[#144e8b] hover:text-blue-700 underline'
              >
                contact our team
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    );
  };

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
      keywords={`${product.manufacturer}, ${product.name}, medical supplies, healthcare equipment, medical devices`}
    >
      {/* Breadcrumb Navigation */}
      <nav className='text-sm text-gray-700 mb-6'>
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
                <span className='text-[#144e8b] font-medium'>
                  {breadcrumb.name}
                </span>
              )}
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
                  alt={`${product.manufacturer} ${product.name} - Professional medical supply product for healthcare facilities and medical professionals`}
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
            </div>
            {product.information && (
              <h2>
                <p className='text-sm text-[#788b9b]'>
                  {product.name} {product.information}
                </p>
              </h2>
            )}
            {product.sentOverNight && (
              <li className='space-y-2'>
                <br />
                <br />
                <br />
                <br />
                <div className='text-lg font-semibold text-[#0e355e]'>
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
                      <span className='font-bold text-[#0e355e]'>
                        {product.manufacturer} - {product.name} -{" "}
                        {typeOfPurchase}
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
                        We do not have any additional units at this moment.
                        Please contact us for more information.
                      </p>
                      <button
                        className='mt-4 px-4 py-2 bg-[#0e355e] text-white rounded-lg hover:bg-[#788b9b] transition'
                        onClick={() => setShowModal(false)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
                <div>
                  {!isOutOfStock &&
                    !isOutOfStockBox &&
                    !isOutOfStockClearance && (
                      <div>
                        {product.each?.countInStock > 0 ||
                        product.box?.countInStock > 0 ? (
                          typeOfPurchase === "Each" ||
                          typeOfPurchase === "Box" ? (
                            <div>
                              {active === "loading"
                                ? "Loading"
                                : active && (
                                    <div className='mb-2 flex justify-between'>
                                      <div className='font-bold'>U o M</div>
                                      <Listbox
                                        value={typeOfPurchase}
                                        onChange={(value) => {
                                          setTypeOfPurchase(value);
                                          if (
                                            value === "Each" &&
                                            product.each
                                          ) {
                                            setCurrentPrice(
                                              product.each?.wpPrice || 0
                                            );
                                            setCurrentDescription(
                                              product.each?.description || ""
                                            );
                                            setCurrentCountInStock(
                                              product.each?.countInStock || 0
                                            );
                                          } else if (
                                            value === "Box" &&
                                            product.box
                                          ) {
                                            setCurrentPrice(
                                              product.box?.wpPrice || 0
                                            );
                                            setCurrentDescription(
                                              product.box?.description || ""
                                            );
                                            setCurrentCountInStock(
                                              product.box?.countInStock || 0
                                            );
                                          } else if (
                                            value === "Clearance" &&
                                            product.clearance
                                          ) {
                                            setCurrentPrice(
                                              product.clearance?.price || 0
                                            );
                                            setCurrentDescription(
                                              product.clearance?.description ||
                                                ""
                                            );
                                            setCurrentCountInStock(
                                              product.each
                                                ?.clearanceCountInStock > 0 ||
                                                product.box
                                                  ?.clearanceCountInStock > 0
                                            );
                                          }
                                        }}
                                      >
                                        <div className='relative'>
                                          <Listbox.Button
                                            className={`w-full rounded-md py-1.5 pl-3 pr-6 text-sm bg-white text-left shadow-md border-2 border-[#0e355e] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0e355e]`}
                                          >
                                            {typeOfPurchase || "Select"}
                                          </Listbox.Button>
                                          <BiChevronDown className='w-4 h-4 text-[#0e355e] absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none' />
                                          <Listbox.Options className='absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none text-sm'>
                                            {availableTypes.map((option) => (
                                              <Listbox.Option
                                                key={option}
                                                value={option}
                                                className={({ active }) =>
                                                  `cursor-pointer select-none px-4 py-2 ${
                                                    active
                                                      ? "bg-blue-100 text-[#0e355e]"
                                                      : "text-gray-900"
                                                  }`
                                                }
                                              >
                                                {({ selected }) => (
                                                  <span className='flex items-center justify-between'>
                                                    {option}
                                                    {selected && (
                                                      <BiCheck className='w-4 h-4 text-[#0e355e]' />
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
                                    ${" "}
                                    {product.clearance?.price ||
                                      "Call for Price"}
                                  </div>
                                </div>
                              ) : null}
                              <div className='text-[#414b53]'>
                                {product.notes}
                              </div>
                            </div>
                          )
                        )}
                        {(product.each?.countInStock > 0 ||
                          product.box?.countInStock > 0) &&
                          active && (
                            <div>
                              {console.log("session", session)}
                              <div className='mb-2 flex justify-between'>
                                <div className='font-bold'>Status</div>
                                <div>
                                  {(typeOfPurchase === "Each" &&
                                    isOutOfStock) ||
                                  (typeOfPurchase === "Box" &&
                                    isOutOfStockBox) ||
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
                    (typeOfPurchase === "Clearance" &&
                      isOutOfStockClearance)) &&
                    active && (
                      <form
                        className='text-center p-2'
                        ref={form}
                        onSubmit={sendEmail}
                      >
                        <label className='mt-3 font-bold'>
                          Join Our Wait List
                        </label>
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
                      {(product.each?.wpPrice &&
                        product.each?.wpPrice !== "Call for price") ||
                      (product.box?.wpPrice &&
                        product.box?.wpPrice !== "Call for price") ? (
                        <div className=''>
                          <span className='font-semibold'>
                            Web price: $
                            {product.each?.wpPrice || product.box?.wpPrice} per{" "}
                            {product.each?.wpPrice ? "Unit" : "Box"}.
                          </span>{" "}
                          <br />
                          Contact us or register for custom pricing.
                        </div>
                      ) : (
                        <div className=''>
                          Sign in to see availability and purchase this product
                          at a custom price.
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
              </div>
            </div>
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
                    activeTab === tab.id
                      ? "border-[#144e8b] text-[#144e8b] bg-blue-50"
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
    }
  );

  if (!res.ok) {
    return { notFound: true };
  }

  const product = await res.json();
  return {
    props: { product },
  };
}
