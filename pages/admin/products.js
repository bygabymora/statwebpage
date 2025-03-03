import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useReducer, useState } from 'react';
import Layout from '../../components/main/Layout';
import { getError } from '../../utils/error';
import { BsFillArrowDownSquareFill, BsFillArrowUpSquareFill } from 'react-icons/bs';
import Image from 'next/image';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, products: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export default function AdminProductsScreen() {
  const router = useRouter();
  const [sortDirection, setSortDirection] = useState(1);
  const [
    { loading, error, products },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: '',
    products: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { slug } = router.query;

        const sortQuery = sortDirection === 1 ? 'asc' : 'desc';

        const { data } = await axios.get(
          `/api/admin/products?slug=${slug}&sort=${sortQuery}`
        );

        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [router.query, sortDirection]);

  const toggleSortDirection = () => {
    const newSortDirection = sortDirection === -1 ? 1 : -1;
    setSortDirection(newSortDirection);
  };

  const links = [
    { href: '/admin/dashboard', label: 'Dashboard'},
    { href: '/admin/orders', label: 'Orders'},
    { href: '/admin/products', label: 'Products', isBold: true},
    { href: '/admin/users', label: 'Users'},
    { href: '/admin/news', label: 'News'},
  ];

  return (
    <Layout title="Admin Products">
      <div className="flex justify-center">
        <ul className="flex space-x-4 my-3 lg:text-lg w-full">
          {links.map(({ href, label, isBold }) => (
            <li key={href} className="w-full">
              <Link href={href}
                className={`flex items-center justify-center py-2 bg-white rounded-2xl shadow-md hover:bg-gray-100 transition
                  ${isBold ? 'font-semibold' : ''}`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="md:col-span-3 p-4">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold mb-4">Products</h1>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <br />
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-100 border border-collapse sticky top-0 z-10">
                <tr className='sticky top-0'>
                  <th className="p-4 text-left uppercase border border-collapse sticky top-0">
                    REF
                    <br />
                    Manufacturer
                    <br />
                    <button
                      onClick={toggleSortDirection}
                      className="primary-button"
                    >
                      {sortDirection === -1 ? (
                        <BsFillArrowUpSquareFill />
                      ) : (
                        <BsFillArrowDownSquareFill />
                      )}
                    </button>
                  </th>
                  <th className="p-2 text-left w-[12%]">PRICE EACH</th>
                  <th className="p-2 text-left w-[12%] border">COUNT IN STOCK (EACH)</th>
                  <th className="p-2 text-left w-[12%] border">PRICE BOX</th>
                  <th className="p-2 text-left w-[12%]">COUNT IN STOCK (BOX)</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border border-collapse odd:bg-white even:bg-gray-50">
                    <td className="p-2 border">
                      <div>
                        {product.name}
                        <br />
                        {product.manufacturer}
                        <br />
                        <Image
                          width={100}
                          height={100}
                          src={product.image}
                          alt={product.name}
                          className="rounded-lg shadow-lg hover:scale-105 transition-all duration-300" 
                        />
                      </div>
                    </td>
                    <td className="p-2 border w-[12%]">${product.each?.wpPrice ?? 'N/A'}</td>
                    <td className="p-2 border w-[12%]">{product.each?.quickBooksQuantityOnHandProduction ?? 0}</td>
                    <td className="p-2 border w-[12%]">${product.box?.wpPrice ?? 'N/A'}</td>
                    <td className="p-2 border w-[12%]">{product.box?.quickBooksQuantityOnHandProduction ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}