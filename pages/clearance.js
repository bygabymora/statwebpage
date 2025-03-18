import React, { useState } from "react";
import Layout from "../components/main/Layout";
import { ProductItemPage } from "../components/products/ProductItemPage";
import { AiOutlineMenuFold } from "react-icons/ai";

export default function Clearance({ products }) {
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const [showManufacturers, setShowManufacturers] = useState(false);

  const manufacturers = [
    ...new Set(
      (products || [])
        .filter((product) => (product.each?.clearanceCountInStock > 0) || (product.box?.clearanceCountInStock > 0))
        .map((product) => product.manufacturer)
    ),
  ];

  const filteredProducts = selectedManufacturer
  ? (products || []).filter(
      (product) =>
        product.manufacturer === selectedManufacturer &&
      (
        product.each?.clearanceCountInStock > 0 || product.box?.clearanceCountInStock > 0
      )
    )
  : (products || []).filter(
      (product) =>
      product.each?.clearanceCountInStock > 0 || product.box?.clearanceCountInStock > 0);

  const handleManufacturerClick = (manufacturer) => {
    setSelectedManufacturer(manufacturer)
  };

  const handleShowAll = () => {
    if (manufacturers.includes(selectedManufacturer)) {
      setSelectedManufacturer(null);
    }
  };

  return (
    <Layout title="Clearance Products" products={products}>
      <div className="grid grid-cols-1 md:grid-cols-4">
        {/* Left Sidebar */}
        <div className="md:col-span-1 p-4">
          <div className="block md:hidden mb-4">
            <button
              className="bg-[#144e8b] px-4 py-2 rounded"
              onClick={() => setShowManufacturers(!showManufacturers)}
            >
              <AiOutlineMenuFold color="white" />
            </button>
          </div>
          <ul
            className={`${
              showManufacturers ? "block" : "hidden"
            } md:block md:sticky md:top-[8rem]`}
          >
            <div
              onClick={handleShowAll}
              className={`manufacturer-item cursor-pointer ${
                selectedManufacturer === null
                  ? "bg-slate-200 cursor-pointer"
                  : ""
              }`}
            >
              ALL PRODUCTS
            </div>
            <h2
              className="block justify-center card items-center text-center my-3 text-xs lg:text-lg pb-3"
              id="manufacturers"
            >
              Manufacturers
            </h2>
            {manufacturers.map((manufacturer, index) => (
              <div
                key={index}
                onClick={() => handleManufacturerClick(manufacturer)}
                className={`manufacturer-item cursor-pointer block justify-center card items-center text-center my-3 text-xs lg:text-lg pb-3 ${
                  selectedManufacturer === manufacturer
                    ? "bg-slate-200 cursor-pointer"
                    : ""
                }`}
              >
                {manufacturer}
              </div>
            ))}
          </ul>
        </div>
        {/* Right Product Display */}
        <div className="md:col-span-3">
          <h2 className="section__title" id="products">
            Clearance Products
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mb-3">
            {filteredProducts.map((product) => (
              <ProductItemPage
                product={product}
                key={product.slug}
                clearancePurchaseType={true}
              ></ProductItemPage>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
