import data from '../utils/data.js';
import Layout from '../components/Layout.js';
import { ProductItem } from '../components/ProductItem.js';
import React from 'react';
import Banner from '../components/Banner';
import Contact from '../components/contact/Contact';

export default function Home() {
  return (
    <Layout title="Home Page">
      <Banner />
      <br id="products" />
      <h2 className="text-2xl font-semibold text-center mb-5">
        Latest Products
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {data.products.map((product) => (
          <ProductItem product={product} key={product.slug}></ProductItem>
        ))}
      </div>
      <Contact />
    </Layout>
  );
}
