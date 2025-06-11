import axios from "axios";
import Link from "next/link";
import React, { useEffect, useReducer } from "react";
import Layout from "../../components/main/Layout";
import { getError } from "../../utils/error";

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, orders: action.payload, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      state;
  }
}

export default function AdminOrderScreen() {
  const [{ loading, error, orders, loadingDelete }, dispatch] = useReducer(
    reducer,
    {
      loading: true,
      orders: [],
      error: "",
    }
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/admin/orders`);
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    fetchData();
  }, []);

  const links = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/orders", label: "Orders", isBold: true },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/news", label: "News" },
  ];

  return (
    <Layout title='Admin Dashboard'>
      <div className='flex justify-center'>
        <ul className='flex space-x-4 my-3 lg:text-lg w-full'>
          {links.map(({ href, label, isBold }) => (
            <li key={href} className='w-full'>
              <Link
                href={href}
                className={`flex items-center justify-center py-2 bg-white rounded-2xl shadow-md hover:bg-gray-100 transition 
                  ${isBold ? "font-semibold" : ""}`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className='md:col-span-3 p-4'>
        <h1 className='text-2xl font-bold mb-4'>Admin Orders</h1>
        {loadingDelete && <div>Deleting...</div>}
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className='text-red-500'>{error}</div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full bg-white shadow-md rounded-lg overflow-hidden'>
              <thead className='bg-gray-100 border border-collapse'>
                <tr>
                  {[
                    "ID",
                    "User",
                    "Date",
                    "Total",
                    "PAID",
                    "Processed",
                    "Delivered",
                    "Actions",
                  ].map((header) => (
                    <th
                      key={header}
                      className='p-4 text-left uppercase border border-collapse'
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className='border-b hover:bg-gray-100'>
                    <td className='border border-collapse p-5'>
                      {order?._id ? order._id.substring(20, 24) : "No ID"}
                    </td>
                    <td className='border border-collapse p-5'>
                      {order?.wpUser?.firstName
                        ? order?.wpUser?.firstName
                        : "DELETED USER"}
                    </td>
                    <td className='border border-collapse p-5'>
                      {order?.createdAt
                        ? order?.createdAt?.substring(0, 10)
                        : "No Date"}
                    </td>
                    <td className='border border-collapse p-5'>
                      ${order.totalPrice}
                    </td>
                    <td className='border border-collapse p-5'>
                      {order.isPaid
                        ? `${order?.paidAt?.substring(0, 10)}`
                        : "Not Paid"}
                    </td>
                    <td className='border border-collapse p-5'>
                      {order.isDelivered
                        ? `${order?.deliveredAt?.substring(0, 10)}`
                        : "Not Processed"}
                    </td>
                    <td className='border border-collapse p-5'>
                      {order.isAtCostumers
                        ? `${order?.atCostumersDate?.substring(0, 10)}`
                        : "not delivered"}
                    </td>
                    <td className='border border-collapse p-5'>
                      <Link
                        className=' underline font-bold '
                        href={`/order/${order._id}`}
                        passHref
                      >
                        Details
                      </Link>
                    </td>
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

AdminOrderScreen.auth = { adminOnly: true };
