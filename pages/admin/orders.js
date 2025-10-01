import axios from "axios";
import Link from "next/link";
import React, { useEffect, useReducer, useCallback } from "react";
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
      return state;
  }
}

const formatYMD = (val) => {
  if (!val) return "";
  try {
    const d = typeof val === "string" ? new Date(val) : val;
    if (Number.isNaN(d?.getTime?.())) return "";
    return d.toISOString().slice(0, 10);
  } catch {
    return String(val).slice(0, 10);
  }
};

const paymentAmountStatus = (invoice) => {
  if (!invoice) return "Not Paid";
  let status = "";
  invoice.balance === 0 && invoice.quickBooksInvoiceIdProduction
    ? (status = "Paid")
    : invoice.balance === invoice?.totalPrice
    ? (status = "Not Paid")
    : invoice?.balance > 0 &&
      invoice?.balance <
        invoice.totalPrice -
          (invoice?.creditCardFee ? invoice?.creditCardFee : 0)
    ? (status = "Partial Payment")
    : invoice.balance < 0
    ? (status = "Over Payment")
    : (status = "Not Paid");
  return status;
};

export default function AdminOrderScreen() {
  const [{ loading, error, orders = [] }, dispatch] = useReducer(reducer, {
    loading: true,
    orders: [],
    error: "",
  });

  const fetchData = useCallback(async () => {
    try {
      dispatch({ type: "FETCH_REQUEST" });
      const { data } = await axios.get(`/api/admin/orders`, {
        headers: { "Cache-Control": "no-cache" },
      });
      dispatch({ type: "FETCH_SUCCESS", payload: data || [] });
    } catch (err) {
      dispatch({ type: "FETCH_FAIL", payload: getError(err) });
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        <div className='flex items-center justify-between mb-4'>
          <h1 className='text-2xl font-bold'>Admin Orders</h1>
          <button
            onClick={fetchData}
            className='px-3 py-2 rounded-xl bg-white shadow hover:bg-gray-100'
          >
            Refresh
          </button>
        </div>

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
                    "Payment Status",
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
                {orders.map((order) => {
                  const createdAt = formatYMD(order?.createdAt);
                  const paidAt = formatYMD(order?.paidAt);
                  const deliveredAt = formatYMD(order?.deliveredAt);
                  const atCustomersAt = formatYMD(order?.atCostumersDate);

                  // === Igualamos la lógica del cliente ===
                  const invoiceStatus = paymentAmountStatus(order?.invoice);
                  const isPaidByFlag = !!order?.isPaid;
                  const paidStatus = isPaidByFlag
                    ? paidAt
                      ? `Paid (${paidAt})`
                      : "Paid"
                    : invoiceStatus;

                  return (
                    <tr key={order?._id} className='border-b hover:bg-gray-100'>
                      <td className='border border-collapse p-5'>
                        {order?._id ? String(order._id).slice(-4) : "No ID"}
                      </td>
                      <td className='border border-collapse p-5'>
                        {order?.wpUser?.firstName || "DELETED USER"}
                      </td>
                      <td className='border border-collapse p-5'>
                        {createdAt || "No Date"}
                      </td>
                      <td className='border border-collapse p-5'>
                        $
                        {new Intl.NumberFormat("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(order?.totalPrice ?? 0)}
                      </td>
                      <td className='border border-collapse p-5'>
                        <div className='font-semibold'>{paidStatus}</div>
                        {/* Info de método/terms como en cliente */}
                        <div className='text-sm text-gray-600'>
                          {order?.paymentMethod === "Stripe" ? (
                            <div>
                              Credit Card <br />
                              (Powered by Stripe)
                            </div>
                          ) : (
                            <div>{order?.paymentMethod || "—"}</div>
                          )}
                          {order?.paymentMethod === "PO Number" &&
                            order?.defaultTerm && (
                              <div>
                                <span className='font-semibold'>Terms: </span>
                                {order.defaultTerm}
                              </div>
                            )}
                        </div>
                      </td>
                      <td className='border border-collapse p-5'>
                        {order?.isDelivered
                          ? deliveredAt || "Processed"
                          : "Not Processed"}
                      </td>
                      <td className='border border-collapse p-5'>
                        {order?.isAtCostumers
                          ? atCustomersAt || "Delivered"
                          : "not delivered"}
                      </td>
                      <td className='border border-collapse p-5'>
                        <Link
                          className='underline font-bold'
                          href={`/order/${order?._id}`}
                          passHref
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

AdminOrderScreen.auth = { adminOnly: true };
