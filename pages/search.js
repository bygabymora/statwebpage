import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { Store } from '../utils/Store';
import data from '../utils/data.js';
import Layout from '../components/Layout';
import { BiXCircle } from 'react-icons/bi';

const PAGE_SIZE = 2;

const prices = [
  {
    name: '$1 to $100',
    min: 1,
    max: 100,
    value: '1-100',
  },
  {
    name: '$100 to $200',
    min: 100,
    max: 200,
    value: '100-200',
  },
  {
    name: '$200 to $500',
    min: 200,
    max: 500,
    value: '200-500',
  },
  {
    name: '$500 to $1000',
    min: 500,
    max: 1000,
    value: '500-1000',
  },
  {
    name: '$1000 or more',
    min: 1000,
    max: 100000,
    value: '1000-100000',
  },
];

const ratings = [1, 2, 3, 4, 5];

export default function Search(props) {
  const router = useRouter();
  const {
    query = 'all',
    category = 'all',
    manufacturer = 'all',
    price = 'all',
    min = 0,
    max = 0,
    rating = 'all',
    sort = 'featured',
    page = '1',
  } = router.query;

  const { products, countProducts, categories, manufacturers, pages } = props;

  const filerSearch = ({
    page,
    category,
    manufacturer,
    min,
    max,
    rating,
    sort,
    price,
    searchQuery,
  }) => {
    const { query } = router;
    if (page) query.page = page;
    if (category) query.category = category;
    if (manufacturer) query.manufacturer = manufacturer;
    if (rating) query.rating = rating;
    if (sort) query.sort = sort;
    if (price) query.price = price;
    if (searchQuery) query.searchQuery = searchQuery;
    if (min) query.min ? query.min : query.min === 0 ? 0 : min;
    if (max) query.max ? query.max : query.max === 0 ? 0 : max;

    router.push({
      pathname: router.pathname,
      query: query,
    });
  };

  const categoryHandler = (e) => {
    filerSearch({ category: e.target.value });
  };

  const manufacturerHandler = (e) => {
    filerSearch({ manufacturer: e.target.value });
  };

  const priceHandler = (e) => {
    filerSearch({ price: e.target.value });
  };

  const pageHandler = (e) => {
    filerSearch({ page: e.target.value });
  };

  const ratingHandler = (e) => {
    filerSearch({ rating: e.target.value });
  };

  const sortHandler = (e) => {
    filerSearch({ sort: e.target.value });
  };

  const { state, dispatch } = useContext(Store);

  const addToCartHandler = async (product) => {
    const exisItem = state.cart.cartItems.find((x) => x.slug === product.slug);
    let quantity = exisItem ? exisItem.quantity + 1 : 1;

    if (data.products.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });
  };

  return (
    <Layout title="Search">
      <div className="grid md:grid-cols-4 md:gap-5">
        <div>
          <h3 className="text-lg font-bold">Categories</h3>
          <select
            className="w-full"
            value={category}
            onChange={categoryHandler}
          >
            <option value="all">All</option>
            {categories &&
              categories.map((category) => (
                <option value={category} key={category}>
                  {category}
                </option>
              ))}
          </select>
        </div>
        <div>
          <h3 className="text-lg font-bold">Manufacturers</h3>
          <select
            className="w-full"
            value={manufacturer}
            onChange={manufacturerHandler}
          >
            <option value="all">All</option>
            {manufacturers &&
              manufacturers.map((manufacturer) => (
                <option value={manufacturer} key={manufacturer}>
                  {manufacturer}
                </option>
              ))}
          </select>
        </div>
        <div>
          <h3 className="text-lg font-bold">Price</h3>
          <select className="w-full" value={price} onChange={priceHandler}>
            <option value="all">All</option>
            {prices &&
              prices.map((price) => (
                <option value={price.value} key={price.value}>
                  {price.name}
                </option>
              ))}
          </select>
        </div>
        <div>
          <h3 className="text-lg font-bold">Rating</h3>
          <select className="w-full" value={rating} onChange={ratingHandler}>
            <option value="all">All</option>
            {ratings.map((rating) => (
              <option value={rating} key={rating}>
                {rating} star{rating > 1 && 's'} & up
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-3">
          <div className="mb-2 flex justify-between items-center border-b-2 bp-2">
            <div className="flex items-center">
              {products === 0 ? 'No' : countProducts} Results
              {query !== 'all' && ' : ' + query}
              {category !== 'all' && ' : ' + category}
              {manufacturer !== 'all' && ' : ' + manufacturer}
              {rating !== 'all' && ' : Rating : ' + rating + ' stars & up'}
              {price !== 'all' && ' : Price : ' + price}
              &nbsp;
              {(query !== 'all' && query !== '') ||
              category !== 'all' ||
              manufacturer !== 'all' ||
              rating !== 'all' ||
              price !== 'all' ? (
                <button
                  className="primary-button"
                  onClick={() => router.push('/search')}
                >
                  <BiXCircle className="h-5 w-5" />
                </button>
              ) : null}
            </div>
            <div className="flex items-center">
              Sort by{' '}
              <select value={sort} onChange={sortHandler}>
                <option value="featured">Featured</option>
                <option value="lowest">Price: Low to High</option>
                <option value="highest">Price: High to Low</option>
                <option value="toprated">Customer Reviews</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
