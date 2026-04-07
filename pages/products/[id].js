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
import { generateProductJSONLD } from "../../utils/seo";
import {
  findManufacturerProfile,
  manufacturerProfiles,
} from "../../utils/manufacturerProfiles";
import RelatedProducts from "../../components/products/RelatedProducts";

// Native timezone helpers — replaces moment-timezone (~500 KB parsed)
function getNYSecondsSinceMidnight() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type) =>
    parseInt(parts.find((p) => p.type === type)?.value || "0", 10);
  return get("hour") * 3600 + get("minute") * 60 + get("second");
}

function formatDateShort(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

const CUTOFF_SECONDS = 15 * 3600 + 30 * 60; // 3:30 PM ET

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
  const [nySec, setNySec] = useState(() => getNYSecondsSinceMidnight());
  const [currentCountInStock, setCurrentCountInStock] = useState(
    product.each?.countInStock || null,
  );
  const [inventoryLastUpdated, setInventoryLastUpdated] = useState(
    product?.updatedAt || product?.createdAt || new Date().toISOString(),
  );
  const [inventoryJustUpdated, setInventoryJustUpdated] = useState(false);
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

  React.useEffect(() => {
    console.warn("Product updatedAt:", product?.updatedAt);
    console.warn("Product createdAt:", product?.createdAt);
    console.warn("inventoryLastUpdated state:", inventoryLastUpdated);
  }, [product, inventoryLastUpdated]);

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
    const checkInventoryUpdates = async () => {
      try {
        const response = await fetch(`/api/products/${product._id}`);
        if (response.ok) {
          const updatedProduct = await response.json();
          console.warn(
            "Fetched updated product updatedAt:",
            updatedProduct.updatedAt,
          );

          // Ensure we have a valid updatedAt field
          const updatedAtValue =
            updatedProduct.updatedAt ||
            updatedProduct.createdAt ||
            new Date().toISOString();
          const lastUpdated = new Date(updatedAtValue).getTime();
          const currentLastUpdated = new Date(inventoryLastUpdated).getTime();

          if (lastUpdated > currentLastUpdated) {
            // Inventory has been updated, refresh the product data
            setInventoryLastUpdated(updatedAtValue);
            setInventoryJustUpdated(true);

            // Update current stock count and price based on typeOfPurchase
            if (typeOfPurchase === "Each") {
              setCurrentCountInStock(updatedProduct.each?.countInStock || 0);
              setCurrentPrice(
                updatedProduct.each?.wpPrice ||
                  updatedProduct.each?.customerPrice ||
                  0,
              );
              setCurrentDescription(updatedProduct.each?.description || "");
            } else if (typeOfPurchase === "Box") {
              setCurrentCountInStock(updatedProduct.box?.countInStock || 0);
              setCurrentPrice(
                updatedProduct.box?.wpPrice ||
                  updatedProduct.box?.customerPrice ||
                  0,
              );
              setCurrentDescription(updatedProduct.box?.description || "");
            }

            // Update stock status
            setIsOutOfStock((updatedProduct.each?.countInStock || 0) <= 0);
            setIsOutOfStockBox((updatedProduct.box?.countInStock || 0) <= 0);
            setIsOutOfStockClearance(
              (updatedProduct.each?.clearanceCountInStock || 0) <= 0 &&
                (updatedProduct.box?.clearanceCountInStock || 0) <= 0,
            );

            // Show notification for 3 seconds
            setTimeout(() => setInventoryJustUpdated(false), 3000);
          }
        }
      } catch (error) {
        console.error("Error checking inventory updates:", error);
      }
    };

    // Only check for updates if user is active
    if (active) {
      const inventoryTimer = setInterval(checkInventoryUpdates, 30000); // Check every 30 seconds
      return () => clearInterval(inventoryTimer);
    }
  }, [product._id, inventoryLastUpdated, typeOfPurchase, active]);

  // Whether we're before the 3:30 PM ET shipping cutoff
  const isBeforeCutoff = nySec < CUTOFF_SECONDS;

  if (!product) {
    // in case getServerSideProps returned no product
    return <div>Product not found</div>;
  }

  const getProductTitle = (product) => {
    const base = `${product.name} - ${product.manufacturer}`;
    return `${base} | ${product.each?.description ? product.each.description.slice(0, 39) : ""}...`;
  };

  // Tab content components
  const RelatedItemsTab = () => (
    <RelatedProducts currentProduct={product} limit={4} />
  );

  const AdditionalDetailsTab = () => (
    <div className='bg-gray-50 p-6 rounded-lg'>
      <h3 className='text-lg font-semibold text-[#0e355e] mb-4'>
        Product Specifications
      </h3>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <h4 className='font-semibold text-gray-800 mb-3'>
            Product Information
          </h4>
          <div className='space-y-3'>
            <div className='bg-white rounded-lg p-3 border border-gray-100'>
              <p className='text-xs text-[#788b9b] uppercase tracking-wide mb-1'>
                Product Name
              </p>
              <p className='text-sm font-semibold text-[#0e355e]'>
                {product.name}
              </p>
            </div>
            <div className='bg-white rounded-lg p-3 border border-gray-100'>
              <p className='text-xs text-[#788b9b] uppercase tracking-wide mb-1'>
                Manufacturer
              </p>
              <p className='text-sm font-semibold text-[#0e355e]'>
                {product.manufacturer}
              </p>
            </div>
            <div className='bg-white rounded-lg p-3 border border-gray-100'>
              <p className='text-xs text-[#788b9b] uppercase tracking-wide mb-1'>
                Description
              </p>
              <p className='text-sm text-gray-700'>{currentDescription}</p>
            </div>
            {product.information && (
              <div className='bg-white rounded-lg p-3 border border-gray-100'>
                <p className='text-xs text-[#788b9b] uppercase tracking-wide mb-1'>
                  Additional Info
                </p>
                <p className='text-sm text-gray-600'>{product.information}</p>
              </div>
            )}
            {product.each?.description && (
              <div className='bg-white rounded-lg p-3 border border-gray-100'>
                <p className='text-xs text-[#788b9b] uppercase tracking-wide mb-1'>
                  Each Description
                </p>
                <p className='text-sm text-gray-600'>
                  {product.each.description}
                </p>
              </div>
            )}
            {product.box?.description && (
              <div className='bg-white rounded-lg p-3 border border-gray-100'>
                <p className='text-xs text-[#788b9b] uppercase tracking-wide mb-1'>
                  Box Description
                </p>
                <p className='text-sm text-gray-600'>
                  {product.box.description}
                </p>
              </div>
            )}
          </div>
        </div>
        <div>
          <h4 className='font-semibold text-gray-800 mb-3'>
            Shipping & Handling
          </h4>
          <div className='space-y-3'>
            {product.sentOverNight && (
              <div className='bg-orange-50 rounded-lg p-3 border border-orange-200'>
                <p className='text-xs font-semibold text-orange-700 mb-1'>
                  Special Shipping
                </p>
                <p className='text-sm text-orange-600'>
                  Overnight recommended due to temperature sensitivity
                </p>
              </div>
            )}
            <div className='bg-white rounded-lg p-3 border border-gray-100'>
              <p className='text-xs text-[#788b9b] uppercase tracking-wide mb-1'>
                Stock Status
              </p>
              {currentCountInStock > 0 ?
                <span className='inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full'>
                  <span className='w-1.5 h-1.5 bg-green-500 rounded-full'></span>
                  In Stock
                </span>
              : <span className='inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded-full'>
                  <span className='w-1.5 h-1.5 bg-red-500 rounded-full'></span>
                  Out of Stock
                </span>
              }
            </div>
            <div className='bg-white rounded-lg p-3 border border-gray-100'>
              <div
                className={`text-sm flex items-center gap-2 transition-all duration-300 ${
                  inventoryJustUpdated ?
                    "text-green-600 font-semibold animate-pulse"
                  : "text-[#788b9b]"
                }`}
              >
                {inventoryJustUpdated ?
                  <svg
                    className='w-4 h-4 text-green-600'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                : <svg
                    className='w-4 h-4'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
                      clipRule='evenodd'
                    />
                  </svg>
                }
                {inventoryJustUpdated ?
                  <span>Inventory just updated!</span>
                : inventoryLastUpdated ?
                  <span>Updated: {formatDateShort(inventoryLastUpdated)}</span>
                : <span>Loading...</span>}
              </div>
            </div>
            <div className='bg-white rounded-lg p-3 border border-gray-100'>
              <p className='text-xs text-[#788b9b] uppercase tracking-wide mb-2'>
                Shipping Cutoff
              </p>
              {isBeforeCutoff ?
                (() => {
                  const diffSec = CUTOFF_SECONDS - nySec;
                  const hours = Math.floor(diffSec / 3600);
                  const minutes = Math.floor((diffSec % 3600) / 60);
                  return (
                    <p className='text-sm text-gray-600'>
                      Want it by tomorrow? Place your order within{" "}
                      <span className='font-semibold text-[#03793d]'>
                        {hours}h {minutes}m
                      </span>{" "}
                      and select overnight shipping at checkout.
                    </p>
                  );
                })()
              : <p className='text-sm text-gray-600'>
                  The cutoff for next-day shipping has passed. Orders placed now
                  will arrive in two days.
                </p>
              }
            </div>
          </div>
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
                    className='inline-flex items-center px-4 py-2 bg-[#0e355e] text-white text-sm rounded-lg hover:bg-[#144e8b] transition-colors duration-200'
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
                  <span className='w-2 h-2 bg-[#07783e] rounded-full mr-2'></span>
                  FDA Registered Facility
                </li>
                <li className='flex items-center'>
                  <span className='w-2 h-2 bg-[#07783e] rounded-full mr-2'></span>
                  ISO 13485 Certified
                </li>
                <li className='flex items-center'>
                  <span className='w-2 h-2 bg-[#07783e] rounded-full mr-2'></span>
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
                className='text-[#144e8b] hover:text-[#0e355e] underline'
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
      product={product}
      schema={generateProductJSONLD(product)}
      image={product.image}
      keywords={`${product.manufacturer}, ${product.name}, surgical supplies, healthcare equipment`}
    >
      {/* Breadcrumb Navigation */}
      <nav className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6'>
        <ol className='flex items-center space-x-2 text-sm'>
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={index} className='flex items-center'>
              {breadcrumb.href ?
                <Link
                  href={breadcrumb.href}
                  className='text-[#788b9b] hover:text-[#144e8b] transition-colors duration-200'
                >
                  {breadcrumb.name}
                </Link>
              : <span className='text-[#0e355e] font-medium'>
                  {breadcrumb.name}
                </span>
              }
              {index < breadcrumbs.length - 1 && (
                <BsChevronRight className='mx-2 text-gray-400 w-3 h-3' />
              )}
            </li>
          ))}
        </ol>
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
                  alt={`${product.manufacturer} ${product.name} - Professional Surgical supplies product for healthcare facilities`}
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
          <div className='space-y-5'>
            <div>
              <span className='inline-block text-xs font-semibold tracking-wider uppercase text-[#03793d] bg-green-50 px-3 py-1 rounded-full mb-3'>
                {product.manufacturer}
              </span>
              <h1 className='text-2xl sm:text-3xl font-bold text-[#0e355e] mb-3 leading-tight'>
                {product.name}
              </h1>
              <p className='text-base text-gray-600 leading-relaxed'>
                {currentDescription}
              </p>
            </div>
            {product.information && (
              <p className='text-sm text-[#788b9b] leading-relaxed'>
                {product.name} {product.information}
              </p>
            )}
            {product.sentOverNight && (
              <div className='flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-lg p-4'>
                <svg
                  className='w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                    clipRule='evenodd'
                  />
                </svg>
                <div>
                  <p className='text-sm font-semibold text-orange-800'>
                    Shipping Recommendation
                  </p>
                  <p className='text-sm text-orange-700 mt-1'>
                    This product should ship overnight due to temperature
                    sensitivity. Stat Surgical Supply is not responsible for
                    product damage if another shipping method is selected.
                  </p>
                </div>
              </div>
            )}
            <div className='w-full'>
              <div className='bg-white border border-gray-200 shadow-md rounded-xl p-5 w-full'>
                {!isOutOfStock &&
                  !isOutOfStockBox &&
                  !isOutOfStockClearance &&
                  active &&
                  currentCountInStock > 0 &&
                  hasPrice && (
                    <div className='flex items-center justify-between mb-4'>
                      <span className='text-sm font-semibold text-gray-700'>
                        Quantity
                      </span>
                      <div className='flex items-center border border-gray-300 rounded-lg overflow-hidden'>
                        <button
                          className='px-3 py-2 text-[#0e355e] hover:bg-gray-100 transition-colors disabled:opacity-40'
                          onClick={() => setQty(Math.max(1, qty - 1))}
                          disabled={qty <= 1}
                        >
                          -
                        </button>
                        <span className='px-4 py-2 text-sm font-semibold border-x border-gray-300 min-w-[40px] text-center'>
                          {qty}
                        </span>
                        <button
                          className='px-3 py-2 text-[#0e355e] hover:bg-gray-100 transition-colors'
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
                    <div className='flex items-center justify-center gap-2 py-3 mb-3 bg-red-50 rounded-lg'>
                      <svg
                        className='w-4 h-4 text-red-500'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                          clipRule='evenodd'
                        />
                      </svg>
                      <span className='text-sm font-semibold text-red-700'>
                        Currently Out of Stock
                      </span>
                    </div>
                  )}
                {showModal && (
                  <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]'>
                    <div className='bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4 text-center'>
                      <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <svg
                          className='w-6 h-6 text-red-500'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                            clipRule='evenodd'
                          />
                        </svg>
                      </div>
                      <h2 className='text-lg font-bold text-[#0e355e] mb-1'>
                        Out of Stock
                      </h2>
                      <p className='text-sm font-medium text-gray-700 mb-2'>
                        {product.manufacturer} — {product.name} (
                        {typeOfPurchase})
                      </p>
                      {user?.cart?.length > 0 &&
                        handleMatchProduct(product._id) > 0 && (
                          <p className='text-sm text-green-700 bg-green-50 rounded-lg p-2 mb-2'>
                            You have{" "}
                            {handleMatchProduct(product._id) > 1 ?
                              handleMatchProduct(product._id) +
                              " units of this item in your cart, available for purchase"
                            : "1 unit of this item in your cart, available for purchase"
                            }
                            .
                          </p>
                        )}
                      <p className='text-sm text-[#788b9b] mb-4'>
                        No additional units are available at this time. Please
                        contact us for more information.
                      </p>
                      <button
                        className='w-full px-4 py-2.5 bg-[#0e355e] text-white text-sm font-medium rounded-lg hover:bg-[#144e8b] transition-colors duration-200'
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
                        {
                          (
                            product.each?.countInStock > 0 ||
                            product.box?.countInStock > 0
                          ) ?
                            (
                              typeOfPurchase === "Each" ||
                              typeOfPurchase === "Box"
                            ) ?
                              <div>
                                {active === "loading" ?
                                  "Loading"
                                : active && (
                                    <div className='flex items-center justify-between mb-4'>
                                      <span className='text-sm font-semibold text-gray-700'>
                                        Unit of Measure
                                      </span>
                                      <Listbox
                                        value={typeOfPurchase}
                                        onChange={(value) => {
                                          setTypeOfPurchase(value);
                                          if (
                                            value === "Each" &&
                                            product.each
                                          ) {
                                            setCurrentPrice(
                                              product.each?.wpPrice || 0,
                                            );
                                            setCurrentDescription(
                                              product.each?.description || "",
                                            );
                                            setCurrentCountInStock(
                                              product.each?.countInStock || 0,
                                            );
                                          } else if (
                                            value === "Box" &&
                                            product.box
                                          ) {
                                            setCurrentPrice(
                                              product.box?.wpPrice || 0,
                                            );
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
                                              product.clearance?.description ||
                                                "",
                                            );
                                            setCurrentCountInStock(
                                              product.each
                                                ?.clearanceCountInStock > 0 ||
                                                product.box
                                                  ?.clearanceCountInStock > 0,
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
                                                    active ?
                                                      "bg-blue-100 text-[#0e355e]"
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
                                  )
                                }
                                {active === "loading" ?
                                  "Loading"
                                : active && (
                                    <div className='flex items-center justify-between mb-4 pt-3 border-t border-gray-100'>
                                      <span className='text-sm font-semibold text-gray-700'>
                                        Price
                                      </span>
                                      <span className='text-lg font-bold text-[#0e355e]'>
                                        {hasPrice ?
                                          `$${currentPrice}`
                                        : "Call for Price"}
                                      </span>
                                    </div>
                                  )
                                }
                              </div>
                            : null
                            // If you only have Clearance, show it once without an "Add to Cart" button
                          : product.each?.clearanceCountInStock > 0 && (
                              <div className='my-4 text-center bg-red-50 border border-red-200 rounded-lg p-4'>
                                <span className='inline-block text-xs font-semibold tracking-wider uppercase text-red-600 bg-red-100 px-3 py-1 rounded-full mb-2'>
                                  Clearance
                                </span>
                                {active === "loading" ?
                                  "Loading"
                                : active ?
                                  <div className='flex items-center justify-between mb-2'>
                                    <span className='text-sm font-semibold text-gray-700'>
                                      Price
                                    </span>
                                    <span className='text-lg font-bold text-[#0e355e]'>
                                      ${" "}
                                      {product.clearance?.price ||
                                        "Call for Price"}
                                    </span>
                                  </div>
                                : null}
                                {product.notes && (
                                  <p className='text-sm text-gray-600'>
                                    {product.notes}
                                  </p>
                                )}
                              </div>
                            )

                        }
                        {(product.each?.countInStock > 0 ||
                          product.box?.countInStock > 0) &&
                          active && (
                            <div>
                              <div className='flex items-center justify-between mb-4 pt-3 border-t border-gray-100'>
                                <span className='text-sm font-semibold text-gray-700'>
                                  Status
                                </span>
                                {(
                                  (typeOfPurchase === "Each" && isOutOfStock) ||
                                  (typeOfPurchase === "Box" &&
                                    isOutOfStockBox) ||
                                  (typeOfPurchase === "Clearance" &&
                                    isOutOfStockClearance)
                                ) ?
                                  <span className='inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded-full'>
                                    <span className='w-1.5 h-1.5 bg-red-500 rounded-full'></span>
                                    Out of Stock
                                  </span>
                                : <span className='inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full'>
                                    <span className='w-1.5 h-1.5 bg-green-500 rounded-full'></span>
                                    In Stock
                                  </span>
                                }
                              </div>

                              {active === "loading" ?
                                "Loading"
                              : active && (
                                  <div className='pt-2'>
                                    {!hasPrice || currentPrice === 0 ?
                                      <Link href='/support'>
                                        <button className='w-full py-3 bg-[#0e355e] text-white text-sm font-semibold rounded-lg hover:bg-[#144e8b] transition-colors duration-200'>
                                          Call for Price
                                        </button>
                                      </Link>
                                    : <button
                                        className='w-full py-3 bg-[#03793d] text-white text-sm font-semibold rounded-lg hover:bg-[#025f2f] transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed'
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
                                        {(
                                          (typeOfPurchase === "Each" &&
                                            isOutOfStock) ||
                                          (typeOfPurchase === "Box" &&
                                            isOutOfStockBox) ||
                                          (typeOfPurchase === "Clearance" &&
                                            isOutOfStockClearance)
                                        ) ?
                                          "Out of Stock"
                                        : "Add to Cart"}
                                      </button>
                                    }
                                  </div>
                                )
                              }
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
                        className='mt-4 pt-4 border-t border-gray-100'
                        ref={form}
                        onSubmit={sendEmail}
                      >
                        <p className='text-sm font-semibold text-[#0e355e] mb-3 text-center'>
                          Join Our Wait List
                        </p>
                        <div className='space-y-2'>
                          <input
                            type='text'
                            name='user_name'
                            className='w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#144e8b] focus:border-transparent'
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                            placeholder='Your name'
                            required
                          />
                          <input
                            type='email'
                            name='user_email'
                            className='w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#144e8b] focus:border-transparent'
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            placeholder='Email address'
                            required
                          />
                          <input
                            type='text'
                            name='emailManufacturer'
                            className='contact__form-input'
                            onChange={(e) =>
                              setEmailManufacturer(e.target.value)
                            }
                            value={emailManufacturer}
                            hidden
                            required
                          />
                          <button
                            className='w-full py-2.5 bg-[#0e355e] text-white text-sm font-semibold rounded-lg hover:bg-[#144e8b] transition-colors duration-200'
                            type='submit'
                            onClick={sendEmail}
                          >
                            Notify Me When Available
                          </button>
                        </div>
                      </form>
                    )}
                  {session?.user && !active ?
                    <div className='text-center py-4'>
                      <div className='w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3'>
                        <svg
                          className='w-5 h-5 text-[#144e8b]'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
                            clipRule='evenodd'
                          />
                        </svg>
                      </div>
                      <p className='text-sm font-medium text-gray-700'>
                        Your account is being reviewed.
                      </p>
                      <p className='text-xs text-[#788b9b] mt-1'>
                        Product details will be available shortly.
                      </p>
                    </div>
                  : !session?.user ?
                    <div className='text-center py-4'>
                      {(
                        (product.each?.wpPrice &&
                          product.each?.wpPrice !== "Call for price") ||
                        (product.box?.wpPrice &&
                          product.box?.wpPrice !== "Call for price")
                      ) ?
                        <div className='mb-4'>
                          <p className='text-xl font-bold text-[#0e355e] mb-1'>
                            ${product.each?.wpPrice || product.box?.wpPrice}
                            <span className='text-sm font-normal text-gray-500'>
                              {" "}
                              per {product.each?.wpPrice ? "Unit" : "Box"}
                            </span>
                          </p>
                          <p className='text-xs text-[#788b9b]'>
                            Sign in or register for custom pricing.
                          </p>
                        </div>
                      : <div className='mb-4'>
                          <p className='text-sm text-gray-600'>
                            Sign in to see availability and purchase at a custom
                            price.
                          </p>
                        </div>
                      }
                      <div className='flex gap-3 justify-center'>
                        <Link href='/Login'>
                          <button className='px-6 py-2.5 bg-[#0e355e] text-white text-sm font-semibold rounded-lg hover:bg-[#144e8b] transition-colors duration-200'>
                            Login
                          </button>
                        </Link>
                        <Link href='/Register'>
                          <button className='px-6 py-2.5 border-2 border-[#0e355e] text-[#0e355e] text-sm font-semibold rounded-lg hover:bg-[#0e355e] hover:text-white transition-colors duration-200'>
                            Register
                          </button>
                        </Link>
                      </div>
                    </div>
                  : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Interface Section */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8'>
        <div className='bg-white shadow-md rounded-xl overflow-hidden border border-gray-100'>
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
