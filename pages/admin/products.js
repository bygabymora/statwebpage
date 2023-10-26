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
  const [productUpdates, setProductUpdates] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

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

        const { data } = await axios.get(
          `/api/admin/products?slug=${slug}&sort=${sortQuery}`
        );

        const initialProductUpdates = {};
        data.forEach((product) => {
          initialProductUpdates[product._id] = {
            price: product.price,
            countInStock: product.countInStock,
            priceBulk: product.priceBulk,
            countInStockBulk: product.countInStockBulk,
            priceClearance: product.priceClearance,
            countInStockClearance: product.countInStockClearance,
          };
        });

        setProductUpdates(initialProductUpdates);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
        setSortedProducts(data);
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
  const handlePriceChange = (productId, newPrice) => {
    setProductUpdates((prevUpdates) => ({
      ...prevUpdates,
      [productId]: { ...prevUpdates[productId], price: newPrice },
    }));
    setHasChanges(true);
  };
  const handlePriceChange2 = (productId, newPrice2) => {
    setProductUpdates((prevUpdates) => ({
      ...prevUpdates,
      [productId]: { ...prevUpdates[productId], priceBulk: newPrice2 },
    }));
    setHasChanges(true);
  };
  const handlePriceChange3 = (productId, newPrice3) => {
    setProductUpdates((prevUpdates) => ({
      ...prevUpdates,
      [productId]: { ...prevUpdates[productId], priceClearance: newPrice3 },
    }));
    setHasChanges(true);
  };

  const handleStockCountChange = (productId, newStockCount) => {
    setProductUpdates((prevUpdates) => ({
      ...prevUpdates,
      [productId]: { ...prevUpdates[productId], countInStock: newStockCount },
    }));
    setHasChanges(true);
  };
  const handleStockCountChange2 = (productId, newStockCount2) => {
    setProductUpdates((prevUpdates) => ({
      ...prevUpdates,
      [productId]: {
        ...prevUpdates[productId],
        countInStockBulk: newStockCount2,
      },
    }));
    setHasChanges(true);
  };
  const handleStockCountChange3 = (productId, newStockCount3) => {
    setProductUpdates((prevUpdates) => ({
      ...prevUpdates,
      [productId]: {
        ...prevUpdates[productId],
        countInStockClearance: newStockCount3,
      },
    }));
    setHasChanges(true);
  };

  const handleEditClick = async (productId) => {
    if (!window.confirm('Are you sure?')) {
      return;
    }
    const updatedProduct = { ...productUpdates[productId] };

    try {
      const response = await axios.get(`/api/admin/products/${productId}`);
      const existingProduct = response.data;

      const updateFields = {
        name: existingProduct.name,
        manufacturer: existingProduct.manufacturer,
        slug: existingProduct.slug,
        lot: existingProduct.lot,
        expiration: existingProduct.expiration,
        image: existingProduct.image,
        countInStock: existingProduct.countInStock,
        countInStockBulk: existingProduct.countInStockBulk,
        sentOverNight: existingProduct.sentOverNight,
        isInClearance: existingProduct.isInClearance,
        countInStockClearance: existingProduct.countInStockClearance,
        priceClearance: existingProduct.priceClearance,
        includes: existingProduct.includes,
        ...updatedProduct,
      };

      // Update the input fields with the new values
      setProductUpdates((prevUpdates) => ({
        ...prevUpdates,
        [productId]: {},
      }));

      await axios.put(`/api/admin/products/${productId}/update`, updateFields);
      toast.success('Product updated successfully');
      window.location.reload();
    } catch (err) {
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
                    <th className="p-2 text-left w-[12%]">
                      PRICE
                      <br /> EACH
                    </th>
                    <th className="p-2 text-left  border-r border-gray-300  w-[12%]">
                      COUNT
                      <br /> EACH
                    </th>
                    <th className="p-2 text-left  w-[12%]">
                      PRICE <br /> BOX
                    </th>
                    <th className="p-2 text-left  border-r border-gray-300  w-[12%]">
                      COUNT <br />
                      BOX
                    </th>
                    <th className="p-2 text-left  w-[12%]">
                      PRICE
                      <br /> C/RANCE
                    </th>
                    <th className="p-2 text-left  border-r border-gray-300  w-[12%]">
                      COUNT <br />
                      C/RANCE
                    </th>
                    <th className="p-2 text-left  w-[14%]">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProducts.map((product) => (
                    <tr key={product._id} className="border-b">
                      <td className=" p-2 border-r border-gray-300 ">
                        <div>
                          {product.slug}
                          <br />
                          {product.manufacturer}
                        </div>
                        {hasChanges && (
                          <button
                            onClick={() => handleEditClick(product._id)}
                            className="primary-button"
                          >
                            <BiSolidEdit />
                          </button>
                        )}
                      </td>
                      <td className=" p-2 w-[12%]">
                        $
                        <input
                          className="w-[70%]"
                          type="number"
                          value={
                            productUpdates[product._id]?.price !== undefined
                              ? productUpdates[product._id]?.price
                              : product.price
                          }
                          onChange={(e) =>
                            handlePriceChange(product._id, e.target.value)
                          }
                        />
                      </td>
                      <td className=" p-2 border-r border-gray-300 w-[12%]">
                        <input
                          className="w-[70%]"
                          type="number"
                          value={
                            productUpdates[product._id]?.countInStock !==
                            undefined
                              ? productUpdates[product._id]?.countInStock
                              : product.countInStock
                          }
                          onChange={(e) =>
                            handleStockCountChange(product._id, e.target.value)
                          }
                        />
                      </td>
                      <td className=" p-2 ">
                        $
                        <input
                          className="w-[70%]"
                          type="number"
                          value={
                            productUpdates[product._id]?.priceBulk !== undefined
                              ? productUpdates[product._id]?.priceBulk
                              : product.priceBulk
                          }
                          onChange={(e) =>
                            handlePriceChange2(product._id, e.target.value)
                          }
                        />
                      </td>
                      <td className=" p-2 border-r border-gray-300">
                        <input
                          className="w-[70%]"
                          type="number"
                          value={
                            productUpdates[product._id]?.countInStockBulk !==
                            undefined
                              ? productUpdates[product._id]?.countInStockBulk
                              : product.countInStockBulk
                          }
                          onChange={(e) =>
                            handleStockCountChange2(product._id, e.target.value)
                          }
                        />
                      </td>
                      <td className=" p-2 ">
                        $
                        <input
                          className="w-[70%]"
                          type="number"
                          value={
                            productUpdates[product._id]?.priceClearance !==
                            undefined
                              ? productUpdates[product._id]?.priceClearance
                              : product.priceClearance
                          }
                          onChange={(e) =>
                            handlePriceChange3(product._id, e.target.value)
                          }
                        />
                      </td>
                      <td className=" p-2 border-r border-gray-300">
                        <input
                          className="w-[70%]"
                          type="number"
                          value={
                            productUpdates[product._id]
                              ?.countInStockClearance !== undefined
                              ? productUpdates[product._id]
                                  ?.countInStockClearance
                              : product.countInStockClearance
                          }
                          onChange={(e) =>
                            handleStockCountChange3(product._id, e.target.value)
                          }
                        />
                      </td>
                      <td className=" p-5 text-center flex flex-row">
                        <button
                          onClick={() =>
                            router.push(`/admin/product/${product._id}`)
                          }
                          type="button"
                          className="primary-button font-bold underline"
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
