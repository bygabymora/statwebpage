import React from 'react';
import Layout from '../../components/Layout';
import { ProductItem } from '../../components/ProductItem';
import Product from '../../models/Product.js';
import db from '../../utils/db';

export default function Products({ products }) {
  return (
    <Layout title="Products">
      <h2 className="section__title" id="products">
        Products
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductItem product={product} key={product.slug}></ProductItem>
        ))}
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
