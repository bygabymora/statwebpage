import axios from "axios";
import Link from "next/link";
import React, { useEffect, useReducer, useCallback } from "react";
import Layout from "../../components/main/Layout";
import { getError } from "../../utils/error";
import { getInvoiceTaxTotal } from "../../utils/functions/salesTax";
import {
  FaEye,
  FaCreditCard,
  FaFileInvoice,
  FaBox,
  FaClock,
  FaCheckCircle,
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

const fmt = (n) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n || 0);

const orderTaxTotal = (order) => {
  const invoice = order?.invoice;
  return invoice && invoice._id ? getInvoiceTaxTotal(invoice) : 0;
};

const orderGrandTotal = (order) => {
  const invoice = order?.invoice;
  if (!invoice || !invoice._id) {
    return Number(order?.totalPrice || 0);
  }
  const shippingCost =
    invoice.shippingCost > 0 && invoice.shippingBilling === "Bill Invoice" ?
      invoice.shippingCost
    : 0;
  return Number(
    (
      Number(invoice.itemsPrice || 0) +
      Number(shippingCost || 0) +
      Number(orderTaxTotal(order) || 0)
    ).toFixed(2),
  );
};

const getCustomerName = (order) => {
  const ci = order?.shippingAddress?.contactInfo;
  const name = [ci?.firstName, ci?.lastName].filter(Boolean).join(" ").trim();
  if (name) return name;
  return ci?.email || order?.wpUser?.email || "—";
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

// Uses the database "status" field
// Uses the database "status" field
const getOrderProgress = (order) => {
  const status = (order?.status || "").toString().toLowerCase().trim();

  // Completed / processed / delivered
  if (
    status.includes("complete") ||
    status.includes("completed") ||
    status.includes("delivered") ||
    status === "done" ||
    status === "finished"
  ) {
    return {
      label: order.status || "Completed",
      color: "emerald",
      icon: FaCheckCircle,
      highlight: false,
    };
  }

  // In progress / in process / processing
  if (
    status.includes("progress") ||
    status.includes("process") || // catches "In Process"
    status.includes("processing") ||
    status.includes("in progress") ||
    status.includes("in process") ||
    status === "pending" ||
    status === "active"
  ) {
    return {
      label: order.status || "In Process",
      color: "amber",
      icon: FaClock,
      highlight: true,
    };
  }

  // Fallback
  return {
    label: order.status || "Unknown",
    color: "gray",
    icon: FaClock,
    highlight: false,
  };
};

const StatusBadge = ({ progress }) => {
  const { label, color, icon: Icon } = progress;
  const colorMap = {
    emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
    amber: "bg-amber-100 text-amber-800 border-amber-300",
    gray: "bg-gray-100 text-gray-700 border-gray-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
        colorMap[color] || colorMap.gray
      }`}
    >
      <Icon className='w-3 h-3' />
      {label}
    </span>
  );
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

  const links = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/orders", label: "Orders", isBold: true },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/news", label: "News" },
  ];

  const inProgressCount = orders.filter(
    (o) => getOrderProgress(o).highlight,
  ).length;

  return (
    <Layout title='Admin Orders'>
      <div className='sticky top-0 md:top-32 lg:top-48 z-30 bg-white shadow-xs border-b'>
        <div className='mx-auto px-2 sm:px-4 lg:px-8 xl:px-12'>
          <nav className='flex space-x-1 py-2 overflow-x-auto scrollbar-hide'>
            {links.map(({ href, label, isBold }) => (
              <Link
                key={href}
                href={href}
                className={`shrink-0 px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4 rounded-lg text-xs sm:text-sm lg:text-base font-medium transition-all duration-200 whitespace-nowrap ${
                  isBold ?
                    "bg-linear-to-r/srgb from-[#0e355e] to-[#0e355e] text-white shadow-md"
                  : "text-gray-600 hover:text-[#0e355e] hover:bg-blue-50"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className='mx-auto px-1 sm:px-2 md:px-4 lg:px-8 xl:px-12 py-2 sm:py-4 md:py-6'>
        <div className='mb-3 sm:mb-6 md:mb-8'>
          <div className='flex flex-col gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-4 md:mb-6'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
              <div>
                <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-[#0e355e]'>
                  Order Management
                </h1>
                <p className='text-sm sm:text-base text-gray-600 mt-1'>
                  Manage customer orders and track deliveries
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className='flex gap-2 my-5 text-xs sm:text-sm bg-[#0e355e] hover:bg-[#144e8b] disabled:bg-gray-400 text-white px-3 py-2 rounded-lg transition-colors font-medium'
              >
                <RiLoopLeftFill
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
            <div className='flex flex-wrap gap-2 sm:gap-3'>
              <div className='text-xs sm:text-sm text-gray-500 bg-gray-50 px-2 py-1 sm:px-3 sm:py-2 rounded-lg'>
                Total:{" "}
                <span className='font-semibold text-gray-700'>
                  {orders.length}
                </span>
              </div>
              <div className='text-xs sm:text-sm text-amber-700 bg-amber-50 px-2 py-1 sm:px-3 sm:py-2 rounded-lg border border-amber-200'>
                In Progress:{" "}
                <span className='font-semibold'>{inProgressCount}</span>
              </div>
            </div>
          </div>
        </div>

        {loading ?
          <div className='flex items-center justify-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#0e355e]'></div>
            <span className='ml-3 text-gray-600'>Loading orders...</span>
          </div>
        : error ?
          <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
            <div className='text-red-600 font-medium'>
              Error loading orders:
            </div>
            <div className='text-red-500 mt-1'>{error}</div>
          </div>
        : orders.length === 0 ?
          <div className='text-center py-12'>
            <div className='text-gray-500 mb-2'>No orders found</div>
            <div className='text-sm text-gray-400'>
              Orders will appear here once customers place them
            </div>
          </div>
        : <>
            {/* Mobile Cards */}
            <div className='grid gap-2 sm:gap-3 md:hidden'>
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

                const progress = getOrderProgress(order);

                return (
                  <div
                    key={order?._id}
                    className={`shadow-xs rounded-lg p-3 border transition-all duration-200 ${
                      progress.highlight ?
                        "border-l-4 border-l-amber-500 bg-amber-50/50 border-amber-100"
                      : "bg-white border-gray-100 hover:shadow-md"
                    }`}
                  >
                    <div className='flex items-start gap-3 mb-3'>
                      <div className='w-10 h-10 bg-linear-to-br/srgb from-[#0e355e] to-[#144e8b] rounded-full flex items-center justify-center text-white shadow-md shrink-0'>
                        <FaBox className='w-4 h-4' />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center justify-between gap-2 mb-1'>
                          <h3 className='font-bold text-gray-900 text-sm leading-tight'>
                            Order #
                            {order?._id ? String(order._id).slice(-6) : "No ID"}
                          </h3>
                          <StatusBadge progress={progress} />
                        </div>
                        <p className='text-gray-600 text-xs font-medium truncate mb-1'>
                          {getCustomerName(order)}
                        </p>
                        <div className='flex flex-wrap items-center gap-1.5 text-xs'>
                          <span className='text-gray-500'>
                            {createdAt || "No Date"}
                          </span>
                          <span className='font-semibold text-gray-900'>
                            ${fmt(orderGrandTotal(order))}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className='bg-gray-50 rounded-md p-2.5 mb-3 text-xs'>
                      <div className='text-gray-500 uppercase tracking-wide font-semibold mb-1'>
                        Payment
                      </div>
                      <div className='font-semibold text-gray-900'>
                        {paidStatus}
                      </div>
                      <div className='text-gray-600 mt-1 flex items-center gap-1'>
                        {order?.paymentMethod === "Stripe" ?
                          <>
                            <FaCreditCard className='w-3 h-3' /> Credit Card
                          </>
                        : <>
                            <FaFileInvoice className='w-3 h-3' />
                            {order?.paymentMethod || "—"}
                          </>
                        }
                      </div>
                    </div>

                    <Link
                      href={`/order/${order?._id}`}
                      className='flex items-center justify-center gap-2 w-full px-3 py-2 bg-[#0e355e] hover:bg-[#144e8b] text-white text-sm font-medium rounded-lg transition-colors'
                    >
                      <FaEye className='w-3.5 h-3.5' />
                      View Details
                    </Link>
                  </div>
                );
              })}
            </div>
          </>
        }
      </div>
    </Layout>
  );
}

AdminOrderScreen.auth = { adminOnly: true };
