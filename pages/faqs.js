import React from 'react';
import Layout from '../components/Layout';

export default function facs() {
  return (
    <>
      <Layout title="FAQS">
        <div className="card p-5 mb-10">
          <h1 className="mb-4 text-xl">FAQS</h1>
          <h2>How do you acquire your products?</h2>
          <p>
            Stat Surgical acquires products from domestic hospitals, surgery
            centers, and trusted suppliers.
          </p>
          <br />
          <h2>What is the expiration dating of your products? </h2>
          <p>
            Stat Surgical strives to provide long-dated products. Typically
            products have 1-3+ years until expiration. Stat Surgical will never
            send short-dated products unless approved by the customer.
          </p>
          <br />
          <h2>Are your products in original packaging? </h2>
          <p>
            All products are in original packaging. They are exactly like you
            would receive directly from the manufacturer.
          </p>
          <br />
          <h2>Are your prices negotiable? </h2>
          <p>
            Stat Surgical has the best prices in the business. We will never let
            pricing get in the way of our “strong” relationships with our
            customers. If pricing is an issue, we will make it work!
          </p>
          <br />
          <h2>What payment methods do you accept? </h2>
          <p>
            We accept purchase orders from domestic hospitals and surgery
            centers, credit cards, PayPal, and Venmo.
          </p>
          <br />
          <h2>
            Can I buy items by the each, or do I have to buy a whole box?{' '}
          </h2>
          <p>
            Unlike buying products from the manufacturer, you can purchase items
            individually or in boxes. Cost saving is priority one!
          </p>
        </div>
      </Layout>
    </>
  );
}
