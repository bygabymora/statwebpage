import React, { useState } from 'react';
import Layout from '../components/main/Layout';
import Product from '../models/Product.js';
import db from '../utils/db';
import { ProductItemPage } from '../components/ProductItemPage';

export default function Clearance({ products }) {
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);

  const manufacturers = [
    ...new Set(
      products
        .filter((product) => product.countInStockClearance > 0)
        .map((product) => product.manufacturer)
    ),
  ];

  const filteredProducts = selectedManufacturer
    ? products.filter(
        (product) =>
          product.manufacturer === selectedManufacturer &&
          product.product.countInStockClearance > 0
      )
    : products.filter((product) => product.countInStockClearance > 0);

  const handleManufacturerClick = (manufacturer) => {
    setSelectedManufacturer(manufacturer);
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
          <ul>
            <div
              onClick={handleShowAll}
              className={`manufacturer-item cursor-pointer ${
                selectedManufacturer === null
                  ? 'bg-slate-200 cursor-pointer'
                  : ''
              }`}
            >
              ALL PRODUCTS
            </div>
            <h2 className="font-bold text-center mt-5" id="manufacturers">
              Manufacturers
            </h2>
            {manufacturers.map((manufacturer, index) => (
              <div
                key={index}
                onClick={() => handleManufacturerClick(manufacturer)}
                className={`manufacturer-item cursor-pointer ${
                  selectedManufacturer === manufacturer
                    ? 'bg-slate-200 cursor-pointer'
                    : ''
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

export async function getServerSideProps() {
  await db.connect();
  const products = await Product.find().lean();
  return {
    props: {
      products: products.map(db.convertDocToObj),
    },
  };
}
