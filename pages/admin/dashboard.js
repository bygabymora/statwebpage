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
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
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
        color: "rgba(148, 163, 184, 0.25)",
      },
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
      return state;
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
    summary: {
      salesData: [],
      salesPerProduct: [],
      totalPricePerUser: [],
      ordersPrice: 0,
      ordersCount: 0,
      productsCount: 0,
      usersCount: 0,
    },
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
              backgroundColor: "rgba(74, 144, 217, 0.85)",
              borderColor: "rgba(14, 53, 94, 1)",
              borderWidth: 1,
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
              backgroundColor: "rgba(34, 111, 173, 0.85)",
              borderColor: "rgba(14, 53, 94, 1)",
              borderWidth: 1,
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
              backgroundColor: "rgba(49, 163, 199, 0.85)",
              borderColor: "rgba(14, 53, 94, 1)",
              borderWidth: 1,
              data: summary.salesPerProduct.map((x) => x.totalQuantity),
            },
          ],
        };
        break;
      case "users":
        data = {
          labels: summary.totalPricePerUser.map((x) => x._id),
          datasets: [
            {
              label: "Money spent by user",
              backgroundColor: "rgba(99, 102, 241, 0.8)",
              borderColor: "rgba(14, 53, 94, 1)",
              borderWidth: 1,
              data: summary.totalPricePerUser.map((x) => x.totalSpent),
            },
          ],
        };
        break;
      default:
        data = { labels: [], datasets: [] };
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/admin/summary?t=${Date.now()}`, {
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

    fetchData();
  }, []);

  const handleRefresh = async () => {
    try {
      dispatch({ type: "FETCH_REQUEST" });
      const { data } = await axios.get(`/api/admin/summary?t=${Date.now()}`, {
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

  const links = [
    { href: "/admin/dashboard", label: "Dashboard", isBold: true },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/news", label: "News" },
  ];

  return (
    <Layout title='Admin Dashboard'>
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
        <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8 my-6 may-6'>
          <section className='mb-6 rounded-2xl border border-[#d7e3f2] bg-white p-5 shadow-sm sm:p-6'>
            <div className='mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <h1 className='text-2xl font-bold tracking-tight text-[#0e355e] sm:text-3xl'>
                  Admin Dashboard
                </h1>
                <p className='mt-1 text-sm text-slate-600 sm:text-base'>
                  Monitor sales, orders, product performance, and user activity.
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
                  Chart Focus
                </p>
                <p className='mt-1 text-base font-semibold text-[#0e355e]'>
                  {chartTitles[activeChart]}
                </p>
                <p className='text-xs text-slate-500'>Current view</p>
              </div>
              <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Total Sales
                </p>
                <p className='mt-1 text-2xl font-bold text-[#0e355e]'>
                  $
                  {summary.ordersPrice.toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </p>
                <p className='text-xs text-slate-500'>Revenue so far</p>
              </div>
              <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Orders
                </p>
                <p className='mt-1 text-2xl font-bold text-[#0e355e]'>
                  {summary.ordersCount}
                </p>
                <p className='text-xs text-slate-500'>Total orders placed</p>
              </div>
              <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Catalog / Users
                </p>
                <p className='mt-1 text-2xl font-bold text-[#0e355e]'>
                  {summary.productsCount} / {summary.usersCount}
                </p>
                <p className='text-xs text-slate-500'>Products and users</p>
              </div>
            </div>
          </section>

          {loading ?
            <div className='flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-14 shadow-sm'>
              <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-[#0e355e]'></div>
              <span className='ml-3 text-slate-600'>
                Loading dashboard data...
              </span>
            </div>
          : error ?
            <div className='mb-6 rounded-xl border border-red-200 bg-red-50 p-4'>
              <div className='text-sm font-semibold text-red-700'>
                Error loading dashboard
              </div>
              <div className='mt-1 text-sm text-red-600'>{error}</div>
            </div>
          : <>
              <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                <article className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md'>
                  <div className='h-1 w-full bg-gradient-to-r from-[#0e355e] to-[#2c6aa9]'></div>
                  <div className='p-4'>
                    <div className='mb-3 flex items-center justify-between'>
                      <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                        Sales
                      </p>
                      <button
                        onClick={() => setActiveChart("sales")}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
                          activeChart === "sales" ?
                            "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                        }`}
                      >
                        View Chart
                      </button>
                    </div>
                    <p className='text-2xl font-bold text-slate-900'>
                      $
                      {summary.ordersPrice.toLocaleString("en-US", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </p>
                    <p className='text-sm font-medium text-slate-600'>
                      Total Sales
                    </p>
                  </div>
                </article>

                <article className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md'>
                  <div className='h-1 w-full bg-gradient-to-r from-[#1c4e80] to-[#4a90d9]'></div>
                  <div className='p-4'>
                    <div className='mb-3 flex items-center justify-between'>
                      <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                        Orders
                      </p>
                      <button
                        onClick={() => setActiveChart("orders")}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
                          activeChart === "orders" ?
                            "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        View Chart
                      </button>
                    </div>
                    <p className='text-2xl font-bold text-slate-900'>
                      {summary.ordersCount}
                    </p>
                    <p className='text-sm font-medium text-slate-600'>
                      Total Orders
                    </p>
                  </div>
                </article>

                <article className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md'>
                  <div className='h-1 w-full bg-gradient-to-r from-[#0e355e] to-[#2563a5]'></div>
                  <div className='p-4'>
                    <div className='mb-3 flex items-center justify-between'>
                      <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                        Products
                      </p>
                      <button
                        onClick={() => setActiveChart("products")}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
                          activeChart === "products" ?
                            "bg-cyan-100 text-cyan-700"
                          : "bg-slate-100 text-slate-600 hover:bg-cyan-50 hover:text-cyan-700"
                        }`}
                      >
                        View Chart
                      </button>
                    </div>
                    <p className='text-2xl font-bold text-slate-900'>
                      {summary.productsCount}
                    </p>
                    <p className='text-sm font-medium text-slate-600'>
                      Total Products
                    </p>
                  </div>
                </article>

                <article className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md'>
                  <div className='h-1 w-full bg-gradient-to-r from-[#164c7a] to-[#3f82ba]'></div>
                  <div className='p-4'>
                    <div className='mb-3 flex items-center justify-between'>
                      <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                        Users
                      </p>
                      <button
                        onClick={() => setActiveChart("users")}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
                          activeChart === "users" ?
                            "bg-indigo-100 text-indigo-700"
                          : "bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
                        }`}
                      >
                        View Chart
                      </button>
                    </div>
                    <p className='text-2xl font-bold text-slate-900'>
                      {summary.usersCount}
                    </p>
                    <p className='text-sm font-medium text-slate-600'>
                      Total Users
                    </p>
                  </div>
                </article>
              </div>

              <section className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6'>
                <div className='mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:justify-between'>
                  <h2 className='text-lg font-bold text-slate-900 sm:text-xl'>
                    {chartTitles[activeChart]}
                  </h2>
                  <div className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 sm:text-sm'>
                    <span className='h-2 w-2 rounded-full bg-[#4a90d9]'></span>
                    Current Data
                  </div>
                </div>
                <div className='h-72 sm:h-80 lg:h-96'>
                  {summary && <Bar options={options} data={data} />}
                </div>
              </section>
            </>
          }
        </div>
      </div>
    </Layout>
  );
}

AdminDashboardScreen.auth = { adminOnly: true };
export default AdminDashboardScreen;
