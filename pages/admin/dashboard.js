import axios from "axios";
import Link from "next/link";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import React, { useEffect, useReducer, useState } from "react";
import Layout from "../../components/main/Layout";
import { getError } from "../../utils/error";
import { RiLoopLeftFill } from "react-icons/ri";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
  },
};

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, summary: action.payload, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      state;
  }
}
function AdminDashboardScreen() {
  const [activeChart, setActiveChart] = useState("sales");

  const chartTitles = {
    sales: "Sales report.",
    orders: "Orders report.",
    products: "Products report.",
    users: "Users report.",
  };

  const [{ loading, error, summary }, dispatch] = useReducer(reducer, {
    loading: true,
    summary: { salesData: [] },
    error: "",
  });

  let data = {};

  if (summary) {
    switch (activeChart) {
      case "sales":
        data = {
          labels: summary.salesData.map((x) => x._id),
          datasets: [
            {
              label: "Sales per month",
              backgroundColor: "rgba(162, 222, 208, 1)",
              data: summary.salesData.map((x) => x.totalSales),
            },
          ],
        };
        break;
      case "orders":
        data = {
          labels: summary.salesData ? summary.salesData.map((x) => x._id) : [],
          datasets: [
            {
              label: "Quantity of orders per month",
              backgroundColor: "rgba(162, 222, 208, 1)",
              data:
                summary.salesData ?
                  summary.salesData.map((x) => x.orderCount)
                : [],
            },
          ],
        };
        break;
      case "products":
        data = {
          labels: summary.salesPerProduct.map((x) => x._id),
          datasets: [
            {
              label: "Quantity of products sold by reference",
              backgroundColor: "rgba(162, 222, 208, 1)",
              data: summary.salesPerProduct.map((x) => x.totalQuantity),
            },
          ],
        };
        break;
      case "users":
        data = {
          labels: summary.totalPricePerUser.map((x) => x._id), // This will be user's name now
          datasets: [
            {
              label: "Money spent by user",
              backgroundColor: "rgba(162, 222, 208, 1)",
              data: summary.totalPricePerUser.map((x) => x.totalSpent),
            },
          ],
        };
        break;
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        // Add timestamp and cache-busting headers
        const { data } = await axios.get(`/api/admin/summary?t=${Date.now()}`, {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });
        console.log(`Dashboard data refreshed at ${new Date().toISOString()}`);
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };

    fetchData();
  }, []);

  // Manual refresh function
  const handleRefresh = async () => {
    try {
      dispatch({ type: "FETCH_REQUEST" });
      const { data } = await axios.get(`/api/admin/summary?t=${Date.now()}`, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      console.log(
        `Dashboard manually refreshed at ${new Date().toISOString()}`,
      );
      dispatch({ type: "FETCH_SUCCESS", payload: data });
    } catch (err) {
      dispatch({ type: "FETCH_FAIL", payload: getError(err) });
    }
  };

  const links = [
    { href: "/admin/dashboard", label: "Dashboard", isBold: true },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/news", label: "News" },
  ];

  return (
    <Layout title='Admin Dashboard'>
      {/* Enhanced Navigation */}
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-2 sm:px-4 lg:px-8'>
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
      <div className='max-w-7xl mx-auto px-1 sm:px-2 md:px-4 lg:px-8 py-2 sm:py-4 md:py-6'>
        {/* Header Section */}
        <div className='mb-3 sm:mb-6 md:mb-8'>
          <div className='flex flex-col gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-4 md:mb-6'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
              <div>
                <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-[#0e355e]'>
                  Admin Dashboard
                </h1>
                <p className='text-sm sm:text-base text-gray-600 mt-1'>
                  Overview of your business metrics and analytics
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className='flex items-center gap-2 text-xs sm:text-sm bg-[#144e8b] hover:bg-[#0e355e] disabled:bg-gray-400 text-white px-3 py-2 rounded-lg transition-colors font-medium'
              >
                <RiLoopLeftFill
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                ></RiLoopLeftFill>
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>
        {loading ?
          <div className='flex items-center justify-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#0e355e]'></div>
            <span className='ml-3 text-gray-600'>
              Loading dashboard data...
            </span>
          </div>
        : error ?
          <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
            <div className='flex items-center'>
              <div className='text-red-600 font-medium'>
                Error loading dashboard:
              </div>
            </div>
            <div className='text-red-500 mt-1'>{error}</div>
          </div>
        : <div>
            {/* Stats Cards Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-4 sm:mb-6 md:mb-8'>
              {/* Sales Card */}
              <div className='bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm sm:shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200'>
                <div className='flex items-center justify-between mb-2 sm:mb-3'>
                  <button
                    onClick={() => setActiveChart("sales")}
                    className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                      activeChart === "sales" ?
                        "bg-green-100 text-green-700 ring-2 ring-green-200"
                      : "bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600"
                    }`}
                  >
                    View Chart
                  </button>
                </div>
                <div className='text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1'>
                  $
                  {summary.ordersPrice.toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </div>
                <div className='text-sm sm:text-base font-semibold text-gray-600'>
                  Total Sales
                </div>
              </div>

              {/* Orders Card */}
              <div className='bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm sm:shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200'>
                <div className='flex items-center justify-between mb-2 sm:mb-3'>
                  <button
                    onClick={() => setActiveChart("orders")}
                    className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                      activeChart === "orders" ?
                        "bg-blue-100 text-blue-700 ring-2 ring-blue-200"
                      : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                  >
                    View Chart
                  </button>
                </div>
                <div className='text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1'>
                  {summary.ordersCount}
                </div>
                <div className='text-sm sm:text-base font-semibold text-gray-600'>
                  Total Orders
                </div>
              </div>

              {/* Products Card */}
              <div className='bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm sm:shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200'>
                <div className='flex items-center justify-between mb-2 sm:mb-3'>
                  <button
                    onClick={() => setActiveChart("products")}
                    className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                      activeChart === "products" ?
                        "bg-blue-100 text-blue-700 ring-2 ring-blue-200"
                      : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                  >
                    View Chart
                  </button>
                </div>
                <div className='text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1'>
                  {summary.productsCount}
                </div>
                <div className='text-sm sm:text-base font-semibold text-gray-600'>
                  Total Products
                </div>
              </div>

              {/* Users Card */}
              <div className='bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm sm:shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200'>
                <div className='flex items-center justify-between mb-2 sm:mb-3'>
                  <button
                    onClick={() => setActiveChart("users")}
                    className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                      activeChart === "users" ?
                        "bg-blue-100 text-blue-700 ring-2 ring-blue-200"
                      : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                  >
                    View Chart
                  </button>
                </div>
                <div className='text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1'>
                  {summary.usersCount}
                </div>
                <div className='text-sm sm:text-base font-semibold text-gray-600'>
                  Total Users
                </div>
              </div>
            </div>
            {/* Chart Section */}
            <div className='bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm sm:shadow-lg border border-gray-100'>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6'>
                <h2 className='text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-0'>
                  {chartTitles[activeChart]}
                </h2>
                <div className='flex items-center space-x-2 text-xs sm:text-sm text-gray-500'>
                  <div className='w-2 h-2 sm:w-3 sm:h-3 bg-[rgba(162,222,208,1)] rounded-full'></div>
                  <span>Current Data</span>
                </div>
              </div>
              <div className='h-64 sm:h-80 md:h-96'>
                {summary && (
                  <Bar
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: true,
                          position: "top",
                          labels: {
                            usePointStyle: true,
                            padding: 20,
                          },
                        },
                        tooltip: {
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          titleColor: "white",
                          bodyColor: "white",
                          borderColor: "rgba(162, 222, 208, 1)",
                          borderWidth: 1,
                        },
                      },
                      scales: {
                        x: {
                          grid: {
                            display: false,
                          },
                          ticks: {
                            maxRotation: 45,
                          },
                        },
                        y: {
                          grid: {
                            color: "rgba(0, 0, 0, 0.1)",
                          },
                        },
                      },
                    }}
                    data={data}
                  />
                )}
              </div>
            </div>
          </div>
        }
      </div>
    </Layout>
  );
}

AdminDashboardScreen.auth = { adminOnly: true };
export default AdminDashboardScreen;
