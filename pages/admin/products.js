import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useReducer, useState } from 'react';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import { getError } from '../../utils/error';
import {
  BsFillArrowDownSquareFill,
  BsFillArrowUpSquareFill,
  BsTrash3,
} from 'react-icons/bs';
import { BiSolidEdit } from 'react-icons/bi';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, products: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'CREATE_REQUEST':
      return { ...state, loadingCreate: true };
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreate: false };
    case 'CREATE_FAIL':
      return { ...state, loadingCreate: false };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true };
    case 'DELETE_SUCCESS':
      return { ...state, loadingDelete: false, successDelete: true };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };

    default:
      state;
  }
}
export default function AdminProdcutsScreen() {
  const router = useRouter();
  const [sortDirection, setSortDirection] = useState(1);
  const toggleSortDirection = () => {
    const newSortDirection = sortDirection === -1 ? 1 : -1;
    setSortDirection(newSortDirection);
  };
  const [sortedProducts, setSortedProducts] = useState([]);
  const [
    { loading, error, loadingCreate, successDelete, loadingDelete },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,

    error: '',
  });

  const createHandler = async () => {
    if (!window.confirm('Are you sure?')) {
      return;
    }
    try {
      dispatch({ type: 'CREATE_REQUEST' });
      const { data } = await axios.post(`/api/admin/products`);
      dispatch({ type: 'CREATE_SUCCESS' });
      toast.success('Product created successfully');
      router.push(`/admin/product/${data.product._id}`);
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL' });
      toast.error(getError(err));
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { slug } = router.query;

        const sortQuery = sortDirection === 1 ? 'asc' : 'desc';
        console.log('Sort direction in useEffect:', sortDirection);

        const { data } = await axios.get(
          `/api/admin/products?slug=${slug}&sort=${sortQuery}`
        );
        const sortedData = data.map((product) => ({ ...product }));
        dispatch({ type: 'FETCH_SUCCESS', payload: sortedData });

        // Update the sorted products state
        setSortedProducts(sortedData);
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [router.query, sortDirection, successDelete]);

  const deleteHandler = async (productId) => {
    if (!window.confirm('Are you sure?')) {
      return;
    }
    try {
      dispatch({ type: 'DELETE_REQUEST' });
      await axios.delete(`/api/admin/products/${productId}`);

      dispatch({ type: 'DELETE_SUCCESS' });
      toast.success('Product deleted successfully');
    } catch (err) {
      dispatch({ type: 'DELETE_FAIL' });
      toast.error(getError(err));
    }
  };

  return (
    <Layout title="Admin Products">
      <div className="grid md:grid-cols-4 md:gap-5">
        <div>
          <ul>
            <li>
              <Link href="/admin/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link href="/admin/orders">Orders</Link>
            </li>
            <li>
              <Link href="/admin/products" className="font-bold">
                Products
              </Link>
            </li>
            <li>
              <Link href="/admin/users">Users</Link>
            </li>
            <li>
              <Link href="/admin/news">News</Link>
            </li>
          </ul>
        </div>
        <div className="overflow-x-auto md:col-span-3">
          <div className="flex justify-between">
            <h1 className="mb-4 text-xl">Products</h1>
            {loadingDelete && <div>Deleting item...</div>}
            <button
              disabled={loadingCreate}
              onClick={createHandler}
              className="primary-button"
            >
              {loadingCreate ? 'Loading' : 'Create'}
            </button>
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="alert-error">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <br />
              <table className="min-w-full mb-5">
                <thead className="border-b">
                  <tr>
                    <th className="p-2 text-center border-r border-gray-300 w-[16%]">
                      REF/Manufacturer
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
                    <th className="p-2 text-left  border-r border-gray-300  w-[12%]">
                      COUNT EACH
                    </th>
                    <th className="p-2 text-left  w-[12%]">
                      PRICE <br /> BOX
                    </th>
                    <th className="p-2 text-left  border-r border-gray-300  w-[12%]">
                      COUNT BOX
                    </th>
                    <th className="p-2 text-left  w-[12%]">PRICE C/RANCE</th>
                    <th className="p-2 text-left  border-r border-gray-300  w-[12%]">
                      COUNT C/RANCE
                    </th>
                    <th className="p-2 text-left  w-[14%]">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProducts.map((product) => (
                    <tr key={product._id} className="border-b">
                      <td className=" p-2 border-r border-gray-300">
                        {product.slug}
                        <br />
                        {product.manufacturer}
                      </td>
                      <td className=" p-2 ">${product.price}</td>
                      <td className=" p-2 border-r border-gray-300">
                        {product.countInStock}
                      </td>
                      <td className=" p-2 ">${product.priceBulk}</td>
                      <td className=" p-2 border-r border-gray-300">
                        {product.countInStockBulk}
                      </td>
                      <td className=" p-2 ">${product.priceClearance}</td>
                      <td className=" p-2 border-r border-gray-300">
                        {product.countInStockClearance}
                      </td>
                      <td className=" p-5 text-center flex flex-row">
                        <button
                          onClick={() =>
                            router.push(`/admin/product/${product._id}`)
                          }
                          type="button"
                          className="primary-button font-bold underline "
                        >
                          <BiSolidEdit />
                        </button>
                        &nbsp;
                        <button
                          onClick={() => deleteHandler(product._id)}
                          className="primary-button font-bold underline"
                          type="button"
                        >
                          <BsTrash3 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

AdminProdcutsScreen.auth = { adminOnly: true };
