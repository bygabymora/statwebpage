import axios from "axios";
import Link from "next/link";
import React, { useEffect, useReducer, useCallback } from "react";
import Layout from "../../components/main/Layout";
import { getError } from "../../utils/error";
import {
  FaEye,
  FaCreditCard,
  FaFileInvoice,
  FaTruck,
  FaBox,
} from "react-icons/fa";
import { RiLoopLeftFill } from "react-icons/ri";

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
  invoice.balance === 0 && invoice.quickBooksInvoiceIdProduction ?
    (status = "Paid")
  : invoice.balance === invoice?.totalPrice ? (status = "Not Paid")
  : (
    invoice?.balance > 0 &&
    invoice?.balance <
      invoice.totalPrice - (invoice?.creditCardFee ? invoice?.creditCardFee : 0)
  ) ?
    (status = "Partial Payment")
  : invoice.balance < 0 ? (status = "Over Payment")
  : (status = "Not Paid");
  return status;
};

const paymentStatusStyle = (status) => {
  if (status.startsWith("Paid")) return "bg-emerald-100 text-emerald-700";
  if (status === "Partial Payment") return "bg-amber-100 text-amber-700";
  if (status === "Over Payment") return "bg-sky-100 text-sky-700";
  return "bg-slate-100 text-slate-700";
};

export default function AdminOrderScreen() {
  const [{ loading, error, orders = [] }, dispatch] = useReducer(reducer, {
    loading: true,
    orders: [],
    error: "",
  });

  const handleRefresh = async () => {
    try {
      dispatch({ type: "FETCH_REQUEST" });
      const { data } = await axios.get(`/api/admin/orders?t=${Date.now()}`, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      dispatch({ type: "FETCH_SUCCESS", payload: data });
    } catch (err) {
      dispatch({ type: "FETCH_FAIL", payload: getError(err) });
    }
  };

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

  const paidOrders = orders.filter((order) => {
    const paidAt = formatYMD(order?.paidAt);
    const invoiceStatus = paymentAmountStatus(order?.invoice);
    const isPaidByFlag = !!order?.isPaid;
    const paidStatus =
      isPaidByFlag ?
        paidAt ? `Paid (${paidAt})`
        : "Paid"
      : invoiceStatus;
    return paidStatus.startsWith("Paid");
  }).length;

  const deliveredOrders = orders.filter((order) => !!order?.isDelivered).length;
  const atCustomerOrders = orders.filter(
    (order) => !!order?.isAtCostumers,
  ).length;

  const links = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/orders", label: "Orders", isBold: true },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/news", label: "News" },
  ];

  return (
    <Layout title='Admin Orders'>
      <div className='border-b border-slate-200 bg-white/95 backdrop-blur'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <nav className='flex gap-2 overflow-x-auto py-3'>
            {links.map(({ href, label, isBold }) => (
              <Link
                key={href}
                href={href}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 sm:px-4 sm:py-2 sm:text-sm ${
                  isBold ?
                    "bg-[#0e355e] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-[#0e355e]"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className='bg-gradient-to-b from-slate-50 via-white to-slate-100/70'>
        <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8 my-6'>
          <section className='mb-6 rounded-2xl border border-[#d7e3f2] bg-white p-5 shadow-sm sm:p-6'>
            <div className='mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <h1 className='text-2xl font-bold tracking-tight text-[#0e355e] sm:text-3xl'>
                  Order Management
                </h1>
                <p className='mt-1 text-sm text-slate-600 sm:text-base'>
                  Track payments, processing, and fulfillment across all orders.
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className='inline-flex items-center justify-center gap-2 rounded-lg bg-[#0e355e] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#144e8b] disabled:cursor-not-allowed disabled:bg-slate-400'
              >
                <RiLoopLeftFill
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
              <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Total Orders
                </p>
                <p className='mt-1 text-2xl font-bold text-[#0e355e]'>
                  {orders.length}
                </p>
                <p className='text-xs text-slate-500'>All recorded orders</p>
              </div>
              <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Paid
                </p>
                <p className='mt-1 text-2xl font-bold text-[#0e355e]'>
                  {paidOrders}
                </p>
                <p className='text-xs text-slate-500'>Completed payments</p>
              </div>
              <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Processed
                </p>
                <p className='mt-1 text-2xl font-bold text-[#0e355e]'>
                  {deliveredOrders}
                </p>
                <p className='text-xs text-slate-500'>Marked for delivery</p>
              </div>
              <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Delivered
                </p>
                <p className='mt-1 text-2xl font-bold text-[#0e355e]'>
                  {atCustomerOrders}
                </p>
                <p className='text-xs text-slate-500'>At customer status</p>
              </div>
            </div>
          </section>

          {loading ?
            <div className='flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-14 shadow-sm'>
              <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-[#0e355e]'></div>
              <span className='ml-3 text-slate-600'>Loading orders...</span>
            </div>
          : error ?
            <div className='mb-6 rounded-xl border border-red-200 bg-red-50 p-4'>
              <div className='text-sm font-semibold text-red-700'>
                Error loading orders
              </div>
              <div className='mt-1 text-sm text-red-600'>{error}</div>
            </div>
          : orders.length === 0 ?
            <div className='rounded-2xl border border-slate-200 bg-white py-14 text-center shadow-sm'>
              <div className='mb-2 text-base font-semibold text-slate-600'>
                No orders found
              </div>
              <div className='text-sm text-slate-500'>
                Orders will appear here once customers place them
              </div>
            </div>
          : <>
              <div className='grid gap-4 md:hidden'>
                {orders.map((order) => {
                  const createdAt = formatYMD(order?.createdAt);
                  const paidAt = formatYMD(order?.paidAt);
                  const invoiceStatus = paymentAmountStatus(order?.invoice);
                  const isPaidByFlag = !!order?.isPaid;
                  const paidStatus =
                    isPaidByFlag ?
                      paidAt ? `Paid (${paidAt})`
                      : "Paid"
                    : invoiceStatus;

                  return (
                    <article
                      key={order?._id}
                      className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md'
                    >
                      <div className='h-1 w-full bg-gradient-to-r from-[#0e355e] to-[#2c6aa9]'></div>
                      <div className='p-4'>
                        <div className='mb-4 flex items-start gap-3'>
                          <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0e355e] to-[#144e8b] text-white shadow-sm'>
                            <FaBox />
                          </div>
                          <div className='min-w-0 flex-1'>
                            <h3 className='text-sm font-bold leading-tight text-slate-900'>
                              Order #
                              {order?._id ?
                                String(order._id).slice(-6)
                              : "No ID"}
                            </h3>
                            <p className='mt-1 truncate text-sm font-medium text-slate-600'>
                              {order?.wpUser?.firstName || "DELETED USER"}
                            </p>
                            <div className='mt-2 flex flex-wrap items-center gap-2'>
                              <span className='rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700'>
                                {createdAt || "No Date"}
                              </span>
                              <span className='rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700'>
                                $
                                {new Intl.NumberFormat("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }).format(order?.totalPrice ?? 0)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className='mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3'>
                          <p className='mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500'>
                            Payment Status
                          </p>
                          <div className='flex flex-wrap items-center gap-2'>
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${paymentStatusStyle(
                                paidStatus,
                              )}`}
                            >
                              {paidStatus}
                            </span>
                            <span className='inline-flex items-center gap-1 text-xs text-slate-600'>
                              {order?.paymentMethod === "Stripe" ?
                                <>
                                  <FaCreditCard className='h-3 w-3' />
                                  Credit Card (Stripe)
                                </>
                              : <>
                                  <FaFileInvoice className='h-3 w-3' />
                                  {order?.paymentMethod || "-"}
                                </>
                              }
                            </span>
                          </div>
                        </div>

                        <div className='mb-4 grid grid-cols-2 gap-3'>
                          <div className='rounded-lg border border-slate-200 bg-white p-3 text-center'>
                            <p className='mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500'>
                              Processed
                            </p>
                            {order?.isDelivered ?
                              <FaTruck className='mx-auto text-base text-emerald-600' />
                            : <span className='text-xs text-slate-400'>
                                Pending
                              </span>
                            }
                          </div>
                          <div className='rounded-lg border border-slate-200 bg-white p-3 text-center'>
                            <p className='mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500'>
                              Delivered
                            </p>
                            {order?.isAtCostumers ?
                              <FaBox className='mx-auto text-base text-emerald-600' />
                            : <span className='text-xs text-slate-400'>
                                Pending
                              </span>
                            }
                          </div>
                        </div>

                        <Link
                          href={`/order/${order?._id}`}
                          className='inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0e355e] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#144e8b]'
                        >
                          <FaEye className='h-4 w-4' />
                          View Details
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>

              <section className='hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block'>
                <div className='overflow-x-auto'>
                  <div className='min-w-[1040px]'>
                    <div className='grid grid-cols-12 items-center gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4'>
                      <div className='col-span-2 text-xs font-semibold uppercase tracking-wider text-slate-600'>
                        Order
                      </div>
                      <div className='col-span-2 text-xs font-semibold uppercase tracking-wider text-slate-600'>
                        Customer
                      </div>
                      <div className='col-span-1 text-xs font-semibold uppercase tracking-wider text-slate-600'>
                        Date
                      </div>
                      <div className='col-span-1 text-xs font-semibold uppercase tracking-wider text-slate-600'>
                        Total
                      </div>
                      <div className='col-span-3 text-xs font-semibold uppercase tracking-wider text-slate-600'>
                        Payment
                      </div>
                      <div className='col-span-1 text-xs font-semibold uppercase tracking-wider text-slate-600'>
                        Status
                      </div>
                      <div className='col-span-2 text-xs font-semibold uppercase tracking-wider text-slate-600'>
                        Action
                      </div>
                    </div>

                    <div className='divide-y divide-slate-200'>
                      {orders.map((order, index) => {
                        const createdAt = formatYMD(order?.createdAt);
                        const paidAt = formatYMD(order?.paidAt);
                        const invoiceStatus = paymentAmountStatus(
                          order?.invoice,
                        );
                        const isPaidByFlag = !!order?.isPaid;
                        const paidStatus =
                          isPaidByFlag ?
                            paidAt ? `Paid (${paidAt})`
                            : "Paid"
                          : invoiceStatus;

                        return (
                          <div
                            key={order?._id}
                            className={`grid grid-cols-12 items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50 ${
                              index % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                            }`}
                          >
                            <div className='col-span-2'>
                              <div className='flex items-center gap-3'>
                                <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#0e355e] to-[#144e8b] text-white'>
                                  <FaBox className='h-4 w-4' />
                                </div>
                                <div className='min-w-0'>
                                  <p className='text-sm font-semibold text-slate-900'>
                                    #
                                    {order?._id ?
                                      String(order._id).slice(-6)
                                    : "No ID"}
                                  </p>
                                  <p className='text-xs text-slate-500'>
                                    {order?._id ?
                                      String(order._id).slice(-12)
                                    : "No ID"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className='col-span-2 truncate text-sm font-medium text-slate-800'>
                              {order?.wpUser?.firstName || "DELETED USER"}
                            </div>

                            <div className='col-span-1 text-sm text-slate-700'>
                              {createdAt || "No Date"}
                            </div>

                            <div className='col-span-1 text-sm font-semibold text-slate-900'>
                              $
                              {new Intl.NumberFormat("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(order?.totalPrice ?? 0)}
                            </div>

                            <div className='col-span-3'>
                              <div
                                className={`mb-1 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${paymentStatusStyle(
                                  paidStatus,
                                )}`}
                              >
                                {paidStatus}
                              </div>
                              <div className='flex items-center gap-1 text-xs text-slate-600'>
                                {order?.paymentMethod === "Stripe" ?
                                  <>
                                    <FaCreditCard className='h-3 w-3' />
                                    <span>Credit Card (Stripe)</span>
                                  </>
                                : <>
                                    <FaFileInvoice className='h-3 w-3' />
                                    <span>{order?.paymentMethod || "-"}</span>
                                  </>
                                }
                              </div>
                            </div>

                            <div className='col-span-1'>
                              <div className='flex gap-2'>
                                <span
                                  title='Processed'
                                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
                                    order?.isDelivered ?
                                      "bg-emerald-100 text-emerald-700"
                                    : "bg-slate-100 text-slate-400"
                                  }`}
                                >
                                  <FaTruck className='h-3.5 w-3.5' />
                                </span>
                                <span
                                  title='Delivered'
                                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
                                    order?.isAtCostumers ?
                                      "bg-emerald-100 text-emerald-700"
                                    : "bg-slate-100 text-slate-400"
                                  }`}
                                >
                                  <FaBox className='h-3.5 w-3.5' />
                                </span>
                              </div>
                            </div>

                            <div className='col-span-2'>
                              <Link
                                href={`/order/${order?._id}`}
                                className='inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#0e355e] px-3 py-2 text-xs font-semibold text-[#0e355e] transition-colors hover:bg-[#0e355e] hover:text-white'
                                title='View Order Details'
                              >
                                <FaEye className='h-3.5 w-3.5' />
                                Details
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            </>
          }
        </div>
      </div>
    </Layout>
  );
}

AdminOrderScreen.auth = { adminOnly: true };
