import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useReducer, useState } from "react";
import Layout from "../../components/main/Layout";
import { getError } from "../../utils/error";
import {
  BsFillArrowDownSquareFill,
  BsFillArrowUpSquareFill,
} from "react-icons/bs";
import Image from "next/image";

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        products: action.payload,
        error: "",
      };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export default function AdminProductsScreen() {
  const router = useRouter();
  const [sortDirection, setSortDirection] = useState(1);
  const [{ loading, error, products }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
    products: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { slug } = router.query;
        const sortQuery = sortDirection === 1 ? "asc" : "desc";
        const { data } = await axios.get(
          `/api/admin/products?slug=${slug}&sort=${sortQuery}`
        );
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    fetchData();
  }, [router.query, sortDirection]);

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === -1 ? 1 : -1));
  };

  const links = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/products", label: "Products", isBold: true },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/news", label: "News" },
  ];

  return (
    <Layout title='Admin Products'>
      <div className='flex justify-center'>
        <ul className='flex space-x-4 my-3 lg:text-lg w-full'>
          {links.map(({ href, label, isBold }) => (
            <li key={href} className='w-full'>
              <Link
                href={href}
                className={`flex items-center justify-center py-2 bg-white rounded-2xl shadow-md hover:bg-gray-100 transition ${
                  isBold ? "font-semibold" : ""
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className='md:col-span-3 p-4'>
        <div className='flex justify-between items-center mb-4'>
          <h1 className='text-2xl font-bold'>Products</h1>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className='text-red-500'>{error}</div>
        ) : (
          <>
            <div className='flex flex-col gap-4 sm:hidden'>
              {products.map((product) => (
                <div
                  key={product._id}
                  className='bg-white shadow rounded-lg p-4 flex flex-col'
                >
                  <div className='flex items-start gap-4 mb-2 min-w-0'>
                    <div className='flex-shrink-0'>
                      <Image
                        width={60}
                        height={60}
                        src={product.image}
                        alt={product.name}
                        className='rounded-lg'
                        loading='lazy'
                      />
                    </div>
                    <div className='min-w-0'>
                      <div className='font-bold truncate'>{product.name}</div>
                      <div className='text-gray-600 text-sm truncate'>
                        {product.manufacturer}
                      </div>
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-2 text-sm'>
                    <div>
                      <span className='font-semibold'>Price Each:</span> $
                      {product.each?.wpPrice ?? "N/A"}
                    </div>
                    <div>
                      <span className='font-semibold'>In Stock (Each):</span>{" "}
                      {product.each?.quickBooksQuantityOnHandProduction ?? 0}
                    </div>
                    <div>
                      <span className='font-semibold'>Price Box:</span> $
                      {product.box?.wpPrice ?? "N/A"}
                    </div>
                    <div>
                      <span className='font-semibold'>In Stock (Box):</span>{" "}
                      {product.box?.quickBooksQuantityOnHandProduction ?? 0}
                    </div>
                    <div>
                      <span className='font-semibold'>Description:</span>{" "}
                      <p className='text-sm overflow-hidden text-ellipsis line-clamp-2'>
                        {product.information || "No description available"}
                      </p>
                    </div>
                    <div className='col-span-2 text-center'>
                      <Link
                        href={`/admin/product/${product._id}`}
                        className='inline-block px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition'
                      >
                        Edit Info
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className='hidden sm:block max-h-[200vh] overflow-auto'>
              <table className='min-w-full bg-white shadow-md rounded-lg overflow-hidden'>
                <thead className='bg-gray-100 sticky top-0 z-10'>
                  <tr>
                    <th className='p-4 text-left uppercase sticky top-0 z-10'>
                      REF / Manufacturer
                      <button onClick={toggleSortDirection} className='ml-2'>
                        {sortDirection === -1 ? (
                          <BsFillArrowUpSquareFill />
                        ) : (
                          <BsFillArrowDownSquareFill />
                        )}
                      </button>
                    </th>
                    <th className='p-2 text-left w-1/6'>PRICE EACH</th>
                    <th className='p-2 text-left w-1/6'>STOCK (EACH)</th>
                    <th className='p-2 text-left w-1/6'>PRICE BOX</th>
                    <th className='p-2 text-left w-1/6'>STOCK (BOX)</th>
                    <th className='p-2 text-left min-w-[150px]'>DESCRIPTION</th>
                    <th className='p-2 text-center'>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product._id}
                      className='border border-collapse odd:bg-white even:bg-gray-50'
                    >
                      <td className='p-2 border'>
                        <div className='flex items-start gap-4 min-w-0'>
                          <div className='flex-shrink-0'>
                            <Image
                              width={60}
                              height={60}
                              src={product.image}
                              alt={product.name}
                              className='rounded-lg'
                              loading='lazy'
                            />
                          </div>
                          <div className='text-sm min-w-0'>
                            <div className='font-bold truncate'>
                              {product.name}
                            </div>
                            <div className='text-gray-600 truncate'>
                              {product.manufacturer}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className='p-2 border'>
                        ${product.each?.wpPrice ?? "N/A"}
                      </td>
                      <td className='p-2 border'>
                        {product.each?.quickBooksQuantityOnHandProduction ?? 0}
                      </td>
                      <td className='p-2 border'>
                        ${product.box?.wpPrice ?? "N/A"}
                      </td>
                      <td className='p-2 border'>
                        {product.box?.quickBooksQuantityOnHandProduction ?? 0}
                      </td>
                      <td className='p-2 border align-top'>
                        <div className='line-clamp-3 break-words'>
                          {product.information || "No description available"}
                        </div>
                      </td>
                      <td className='p-2 border text-center'>
                        <Link
                          href={`/admin/product/${product._id}`}
                          className='inline-block px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition'
                        >
                          Edit Info
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
