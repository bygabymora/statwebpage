import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ProductItem } from '../components/ProductItem.js';
import Layout from '../components/Layout';

const SearchPage = ({ query }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      const { data } = await axios.get(`/api/search?keyword=${query}`);
      setProducts(data);
    };

    fetchSearchResults();
  }, [query]);

  return (
    <Layout title="Search Results">
      <div>
        <h1 className="section__title">Search Results</h1>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4 mb-3">
            {products.map((product) => (
              <ProductItem key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <h2 className="section__subtitle">No products found</h2>
        )}
      </div>
    </Layout>
  );
};

SearchPage.getInitialProps = ({ query }) => {
  return { query: query.query || '' };
};

export default SearchPage;
