import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { ProductItem } from '../../components/ProductItem';
import Product from '../../models/Product.js';
import db from '../../utils/db';

export default function Products({ products }) {
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);

  const manufacturers = [
    ...new Set(products.map((product) => product.manufacturer)),
  ];

  const filteredProducts = selectedManufacturer
    ? products.filter(
        (product) => product.manufacturer === selectedManufacturer
      )
    : products;

  const handleManufacturerClick = (manufacturer) => {
    setSelectedManufacturer(manufacturer);
  };

  const handleShowAll = () => {
    setSelectedManufacturer(null);
  };

  return (
    <Layout title="Products">
      <div className="grid grid-cols-1 md:grid-cols-4">
        <div className="md:col-span-1 p-4">
          <ul>
            <div
              onClick={handleShowAll}
              className={`manufacturer-item  ${
                selectedManufacturer === null ? 'bg-slate-200' : ''
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
                className={`manufacturer-item ${
                  selectedManufacturer === manufacturer ? 'bg-slate-200' : ''
                }`}
              >
                {manufacturer}
              </div>
            ))}
          </ul>
        </div>
        <div className="md:col-span-3">
          <h2 className="section__title" id="products">
            Products
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mb-3">
            {filteredProducts.map((product) => (
              <ProductItem product={product} key={product.slug}></ProductItem>
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
