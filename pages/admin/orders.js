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
      console.log(
        `Manual refresh: ${data.length} orders at ${new Date().toISOString()}`,
      );
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

  return (
    <Layout title='Admin Orders'>
      {/* Enhanced Navigation */}
      <div className='bg-white shadow-sm border-b'>
        <div className='mx-auto px-2 sm:px-4 lg:px-8 xl:px-12'>
          <nav className='flex space-x-1 py-2 overflow-x-auto scrollbar-hide'>
            {links.map(({ href, label, isBold }) => (
              <Link
                key={href}
                href={href}
                className={`flex-shrink-0 px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4 rounded-lg text-xs sm:text-sm lg:text-base font-medium transition-all duration-200 whitespace-nowrap ${
                  isBold ?
                    "bg-gradient-to-r from-[#0e355e] to-[#0e355e] text-white shadow-md"
                  : "text-gray-600 hover:text-[#0e355e] hover:bg-blue-50"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      {/* Main Content */}
      <div className='mx-auto px-1 sm:px-2 md:px-4 lg:px-8 xl:px-12 py-2 sm:py-4 md:py-6'>
        {/* Header Section */}
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
                ></RiLoopLeftFill>
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
            <div className='flex items-center'>
              <div className='text-red-600 font-medium'>
                Error loading orders:
              </div>
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
            {/* Mobile Card Layout */}
            <div className='grid gap-1 sm:gap-2 md:gap-3 md:hidden'>
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
                  <div
                    key={order?._id}
                    className='bg-white shadow-sm sm:shadow-md rounded-md sm:rounded-lg md:rounded-xl p-1.5 sm:p-2 md:p-3 lg:p-5 border border-gray-100 hover:shadow-lg transition-all duration-200'
                  >
                    {/* Mobile Card Header */}
                    <div className='flex items-start gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 mb-1.5 sm:mb-2 md:mb-3 lg:mb-4'>
                      <div className='flex-shrink-0 relative'>
                        <div className='w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-[#0e355e] to-[#144e8b] rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm md:text-lg lg:text-xl shadow-md'>
                          <FaBox />
                        </div>
                      </div>
                      <div className='min-w-0 flex-1'>
                        <h3 className='font-bold text-gray-900 text-xs sm:text-sm md:text-lg leading-tight mb-1'>
                          Order #
                          {order?._id ? String(order._id).slice(-6) : "No ID"}
                        </h3>
                        <p className='text-gray-600 text-xs sm:text-sm font-medium mb-1 truncate'>
                          {order?.wpUser?.firstName || "DELETED USER"}
                        </p>
                        <div className='flex flex-wrap items-center gap-1 sm:gap-2'>
                          <span className='inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
                            {createdAt || "No Date"}
                          </span>
                          <span className='text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded'>
                            $
                            {new Intl.NumberFormat("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(order?.totalPrice ?? 0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Status */}
                    <div className='mb-1.5 sm:mb-2 md:mb-3 lg:mb-4'>
                      <div className='bg-gray-50 rounded p-1.5 sm:p-2 md:p-3'>
                        <div className='text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1'>
                          Payment Status
                        </div>
                        <div className='font-semibold text-xs sm:text-sm text-gray-900'>
                          {paidStatus}
                        </div>
                        <div className='text-xs text-gray-600 mt-1'>
                          {order?.paymentMethod === "Stripe" ?
                            <div className='flex items-center gap-1'>
                              <FaCreditCard className='w-3 h-3' />
                              Credit Card (Stripe)
                            </div>
                          : <div className='flex items-center gap-1'>
                              <FaFileInvoice className='w-3 h-3' />
                              {order?.paymentMethod || "—"}
                            </div>
                          }
                        </div>
                      </div>
                    </div>

                    {/* Status Grid */}
                    <div className='grid grid-cols-2 gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 mb-1.5 sm:mb-2 md:mb-3 lg:mb-4'>
                      <div className='text-center bg-gray-50 rounded p-1 sm:p-1.5 md:p-2 lg:p-3'>
                        <div className='text-xs text-gray-500 uppercase tracking-wide font-semibold mb-0.5 sm:mb-1'>
                          Processed
                        </div>
                        <div className='flex justify-center'>
                          {order?.isDelivered ?
                            <FaTruck className='text-green-600 text-xs sm:text-sm md:text-lg' />
                          : <span className='text-gray-400 text-xs'>
                              Pending
                            </span>
                          }
                        </div>
                      </div>
                      <div className='text-center bg-gray-50 rounded p-1 sm:p-1.5 md:p-2 lg:p-3'>
                        <div className='text-xs text-gray-500 uppercase tracking-wide font-semibold mb-0.5 sm:mb-1'>
                          Delivered
                        </div>
                        <div className='flex justify-center'>
                          {order?.isAtCostumers ?
                            <FaBox className='text-green-600 text-xs sm:text-sm md:text-lg' />
                          : <span className='text-gray-400 text-xs'>
                              Pending
                            </span>
                          }
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className='flex space-x-1 sm:space-x-1.5 md:space-x-2'>
                      <Link
                        href={`/order/${order?._id}`}
                        className='flex-1 px-1.5 py-1 sm:px-2 sm:py-1.5 md:px-3 md:py-2 lg:px-4 lg:py-3 bg-gradient-to-r from-[#0e355e] to-[#0e355e] text-white font-medium rounded sm:rounded-md md:rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm sm:shadow-md hover:shadow-lg flex items-center justify-center space-x-0.5 sm:space-x-1 md:space-x-2 text-xs sm:text-sm md:text-base'
                      >
                        <FaEye
                          size={10}
                          className='sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4'
                        />
                        <span className='hidden xs:inline sm:inline'>
                          View Details
                        </span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table Layout */}
            <div className='hidden md:block bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200'>
              <div className='overflow-x-auto overflow-y-auto max-h-[85vh] custom-scrollbar'>
                <div className='min-w-full' style={{ minWidth: "700px" }}>
                  <div className='bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 sticky top-0 z-10'>
                    <div className='grid grid-cols-12 gap-2 px-2 py-2 sm:px-3 sm:py-3 lg:px-6 lg:py-4 items-center'>
                      <div className='col-span-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                        Order Info
                      </div>
                      <div className='col-span-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                        Customer
                      </div>
                      <div className='col-span-1 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                        Date
                      </div>
                      <div className='col-span-1 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                        Total
                      </div>
                      <div className='col-span-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                        Payment
                      </div>
                      <div className='col-span-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                        Status
                      </div>
                      <div className='col-span-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                        Actions
                      </div>
                    </div>
                  </div>
                  <div className='divide-y divide-gray-200'>
                    {orders.map((order, index) => {
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
                        <div
                          key={order?._id}
                          className={`hover:bg-gray-50 transition-colors grid grid-cols-12 gap-2 px-2 py-2 sm:px-3 sm:py-3 lg:px-6 lg:py-4 items-center ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-25"
                          }`}
                        >
                          <div className='col-span-2'>
                            <div className='flex items-center gap-1 sm:gap-2 lg:gap-4'>
                              <div className='flex-shrink-0 relative'>
                                <div className='w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-[#0e355e] to-[#144e8b] rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm lg:text-lg shadow-md'>
                                  <FaBox />
                                </div>
                              </div>
                              <div className='min-w-0 flex-1'>
                                <div className='font-semibold text-gray-900 text-xs sm:text-xs lg:text-sm leading-tight mb-1'>
                                  #
                                  {order?._id ?
                                    String(order._id).slice(-6)
                                  : "No ID"}
                                </div>
                                <div className='text-xs text-gray-400 font-mono mt-1 hidden md:block'>
                                  {order?._id ?
                                    String(order._id).slice(-12)
                                  : "No ID"}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className='col-span-2'>
                            <div className='text-xs sm:text-xs lg:text-sm text-gray-900 truncate'>
                              {order?.wpUser?.firstName || "DELETED USER"}
                            </div>
                          </div>
                          <div className='col-span-1'>
                            <div className='text-xs sm:text-xs lg:text-sm text-gray-900'>
                              {createdAt || "No Date"}
                            </div>
                          </div>
                          <div className='col-span-1'>
                            <div className='font-semibold text-xs sm:text-xs lg:text-sm text-gray-900'>
                              $
                              {new Intl.NumberFormat("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(order?.totalPrice ?? 0)}
                            </div>
                          </div>
                          <div className='col-span-2'>
                            <div className='text-xs sm:text-xs lg:text-sm'>
                              <div className='font-semibold text-gray-900 mb-1'>
                                {paidStatus}
                              </div>
                              <div className='text-gray-600 flex items-center gap-1'>
                                {order?.paymentMethod === "Stripe" ?
                                  <>
                                    <FaCreditCard className='w-3 h-3' />
                                    <span>Card</span>
                                  </>
                                : <>
                                    <FaFileInvoice className='w-3 h-3' />
                                    <span>{order?.paymentMethod || "—"}</span>
                                  </>
                                }
                              </div>
                            </div>
                          </div>
                          <div className='col-span-2 text-center'>
                            <div className='flex flex-col gap-1'>
                              <div className='flex justify-center'>
                                {order?.isDelivered ?
                                  <div className='bg-green-100 p-1 sm:p-1.5 lg:p-2 rounded-full'>
                                    <FaTruck className='text-green-600 text-xs sm:text-sm lg:text-lg' />
                                  </div>
                                : <div className='bg-gray-100 p-1 sm:p-1.5 lg:p-2 rounded-full'>
                                    <span className='text-gray-400 text-xs'>
                                      P
                                    </span>
                                  </div>
                                }
                              </div>
                              <div className='flex justify-center'>
                                {order?.isAtCostumers ?
                                  <div className='bg-green-100 p-1 sm:p-1.5 lg:p-2 rounded-full'>
                                    <FaBox className='text-green-600 text-xs sm:text-sm lg:text-lg' />
                                  </div>
                                : <div className='bg-gray-100 p-1 sm:p-1.5 lg:p-2 rounded-full'>
                                    <span className='text-gray-400 text-xs'>
                                      D
                                    </span>
                                  </div>
                                }
                              </div>
                            </div>
                          </div>
                          <div className='col-span-2'>
                            <Link
                              href={`/order/${order?._id}`}
                              className='px-1.5 py-1 sm:px-2 sm:py-1.5 lg:px-3 lg:py-2 primary-button text-white text-xs lg:text-sm font-medium rounded-lg transition-all duration-200 shadow-md flex items-center justify-center space-x-1'
                              title='View Order Details'
                            >
                              <FaEye
                                size={12}
                                className='sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4'
                              />
                              <span className='hidden md:inline text-xs'>
                                Details
                              </span>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </>
        }
      </div>
    </Layout>
  );
}

AdminOrderScreen.auth = { adminOnly: true };
