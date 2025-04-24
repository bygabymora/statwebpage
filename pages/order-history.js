import axios from "axios";
import Link from "next/link";
import React, { useEffect, useReducer } from "react";
import Layout from "../components/main/Layout";
import { getError } from "../utils/error";

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, orders: action.payload, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}
function OrderHistoryScreen() {
  const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
    loading: true,
    orders: [],
    error: "",
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/orders/history`);
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    fetchOrders();
  }, []);
  return (
    <Layout title='Order History'>
      <h1 className='mb-4 text-xl'>Order History</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className='alert-error'>{error}</div>
      ) : (
        <div className='overflow-x-auto mb-4'>
          <table className='table-auto min-w-full border-collapse border'>
            <thead className='border'>
              <tr>
                <th className='px-5 border text-left'>ID</th>
                <th className='p-5 border text-left'>DATE</th>
                <th className='p-5 border text-left'>TOTAL</th>
                <th className='p-5 border text-left'>PAID</th>
                <th className='p-5 border text-left'>PROCESSED</th>
                <th className='p-5 border text-left'>DELIVERED</th>
                <th className='p-5 border text-left'>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className='border'>
                  <td className=' p-5 border'>
                    {order._id.substring(20, 24).toUpperCase()}
                  </td>
                  <td className=' p-5 border'>
                    {order.createdAt.substring(0, 10)}
                  </td>
                  <td className=' p-5 border'>
                    $
                    {new Intl.NumberFormat("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(order.totalPrice)}
                  </td>
                  <td className=' p-5 border'>
                    {order.isPaid
                      ? `${order.paidAt.substring(0, 10)}`
                      : "Not Paid"}
                  </td>
                  <td className=' p-5 border'>
                    {order.isDelivered
                      ? `${order.deliveredAt.substring(0, 10)}`
                      : "Not Processed"}
                  </td>
                  <td className=' p-5 border'>
                    {order.isAtCostumers
                      ? `${order.atCostumersDate.substring(0, 10)}`
                      : "Not Delivered"}
                  </td>
                  <td className=' p-5 '>
                    <Link
                      className='font-bold underline'
                      href={`/order/${order._id}`}
                      style={{ color: "#144e8b" }}
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
    </Layout>
  );
}

OrderHistoryScreen.auth = true;
export default OrderHistoryScreen;
