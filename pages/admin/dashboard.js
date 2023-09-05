import axios from 'axios';
import Link from 'next/link';
import { Bar } from 'react-chartjs-2';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import React, { useEffect, useReducer, useState } from 'react';
import Layout from '../../components/Layout';
import { getError } from '../../utils/error';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
  },
};

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, summary: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      state;
  }
}
function AdminDashboardScreen() {
  const [activeChart, setActiveChart] = useState('sales');
  const chartTitles = {
    sales: 'Sales report.',
    orders: 'Orders report.',
    products: 'Products report.',
    users: 'Users report.',
  };

  const [{ loading, error, summary }, dispatch] = useReducer(reducer, {
    loading: true,
    summary: { salesData: [] },
    error: '',
  });

  let data = {};

  if (summary) {
    switch (activeChart) {
      case 'sales':
        data = {
          labels: summary.salesData.map((x) => x._id),
          datasets: [
            {
              label: 'Sales per month',
              backgroundColor: 'rgba(162, 222, 208, 1)',
              data: summary.salesData.map((x) => x.totalSales),
            },
          ],
        };
        break;
      case 'orders':
        data = {
          labels: summary.salesData ? summary.salesData.map((x) => x._id) : [],
          datasets: [
            {
              label: 'Quantity of orders per month',
              backgroundColor: 'rgba(162, 222, 208, 1)',
              data: summary.salesData
                ? summary.salesData.map((x) => x.orderCount)
                : [],
            },
          ],
        };
        break;
      case 'products':
        data = {
          labels: summary.salesPerProduct.map((x) => x._id),
          datasets: [
            {
              label: 'Quantity of products sold by reference',
              backgroundColor: 'rgba(162, 222, 208, 1)',
              data: summary.salesPerProduct.map((x) => x.totalQuantity),
            },
          ],
        };
        break;
      case 'users':
        data = {
          labels: summary.totalPricePerUser.map((x) => x._id), // This will be user's name now
          datasets: [
            {
              label: 'Money spent by user',
              backgroundColor: 'rgba(162, 222, 208, 1)',
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
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/summary`);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    fetchData();
  }, []);

  return (
    <Layout title="Admin Dashboard">
      <div className="grid  md:grid-cols-4 md:gap-5">
        <div>
          <ul>
            <li>
              <Link href="/admin/dashboard" className="font-bold">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin/orders">Orders</Link>
            </li>
            <li>
              <Link href="/admin/products">Products</Link>
            </li>
            <li>
              <Link href="/admin/users">Users</Link>
            </li>
            <li>
              <Link href="/admin/news">News</Link>
            </li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <h1 className="mb-4 text-xl">Admin Dashboard</h1>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="alert-error">{error}</div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-4">
                <div className="card m-5 p-5">
                  <p>
                    $
                    {summary.ordersPrice.toLocaleString('en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </p>
                  <p className="font-bold">Sales</p>
                  <a
                    className="underline hover:cursor-pointer"
                    onClick={() => setActiveChart('sales')}
                  >
                    See sales
                  </a>
                </div>

                <div className="card m-5 p-5">
                  <p>{summary.ordersCount} </p>
                  <p className="font-bold">Orders</p>
                  <a
                    className="underline hover:cursor-pointer "
                    onClick={() => setActiveChart('orders')}
                  >
                    See Orders
                  </a>
                </div>
                <div className="card m-5 p-5">
                  <p>{summary.productsCount} </p>
                  <p className="font-bold">Products</p>
                  <a
                    className="underline hover:cursor-pointer"
                    onClick={() => setActiveChart('products')}
                  >
                    See Products
                  </a>
                </div>
                <div className="card m-5 p-5">
                  <p>{summary.usersCount} </p>
                  <p className="font-bold">Users</p>
                  <a
                    className="underline hover:cursor-pointer"
                    onClick={() => setActiveChart('users')}
                  >
                    See users
                  </a>
                </div>
              </div>
              <h2 className="text-xl">{chartTitles[activeChart]}</h2>
              {summary && (
                <Bar
                  options={{
                    legend: { display: true, position: 'right' },
                  }}
                  data={data}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

AdminDashboardScreen.auth = { adminOnly: true };
export default AdminDashboardScreen;
