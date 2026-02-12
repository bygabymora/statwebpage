import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useReducer, useState } from "react";
import Layout from "../../components/main/Layout";
import { getError } from "../../utils/error";
import { RiLoopLeftFill } from "react-icons/ri";
import {
  BsFillArrowDownSquareFill,
  BsFillArrowUpSquareFill,
  BsSearch,
} from "react-icons/bs";
import Image from "next/image";

// Helper function to determine stock status
const getStockStatus = (stock) => {
  if (stock === 0)
    return {
      label: "Out of Stock",
      color: "bg-red-100 text-red-800",
      badge: "bg-red-500",
    };
  if (stock <= 5)
    return {
      label: "Low Stock",
      color: "bg-yellow-100 text-yellow-800",
      badge: "bg-yellow-500",
    };
  if (stock <= 20)
    return {
      label: "Medium Stock",
      color: "bg-blue-100 text-blue-800",
      badge: "bg-blue-500",
    };
  return {
    label: "In Stock",
    color: "bg-green-100 text-green-800",
    badge: "bg-green-500",
  };
};

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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStock, setFilterStock] = useState("all");
  const [{ loading, error, products }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
    products: [],
  });

  // Filter products based on search and stock filter
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStock === "all") return matchesSearch;

    const eachStock = product.each?.countInStock ?? 0;
    const boxStock = product.box?.countInStock ?? 0;
    const totalStock = eachStock + boxStock;

    switch (filterStock) {
      case "outOfStock":
        return matchesSearch && totalStock === 0;
      case "lowStock":
        return matchesSearch && totalStock > 0 && totalStock <= 5;
      case "inStock":
        return matchesSearch && totalStock > 5;
      default:
        return matchesSearch;
    }
  });

  const handleRefresh = async () => {
    try {
      dispatch({ type: "FETCH_REQUEST" });
      const { data } = await axios.get(`/api/admin/products?t=${Date.now()}`, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      console.log(
        `Manual refresh: ${data.length} products at ${new Date().toISOString()}`,
      );
      dispatch({ type: "FETCH_SUCCESS", payload: data });
    } catch (err) {
      dispatch({ type: "FETCH_FAIL", payload: getError(err) });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { slug } = router.query;
        const sortQuery = sortDirection === 1 ? "asc" : "desc";
        const { data } = await axios.get(
          `/api/admin/products?slug=${slug}&sort=${sortQuery}`,
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
      {/* Enhanced Navigation */}
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <nav className='flex space-x-1 sm:space-x-4 py-3 overflow-x-auto'>
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
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        {/* Header Section */}
        <div className='mb-8'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
            <div>
              <h1 className='text-3xl font-bold text-[#0e355e]'>
                Product Management
              </h1>
              <p className='text-gray-600 mt-1'>
                Look at the product inventory and pricing
              </p>
            </div>
            <div className='text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg'>
              Total Products:{" "}
              <span className='font-semibold text-gray-700'>
                {filteredProducts.length}
              </span>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className='flex gap-2 my-5 text-xs sm:text-sm bg-[#144e8b] hover:bg-[#0e355e] disabled:bg-gray-400 text-white px-3 py-2 rounded-lg transition-colors font-medium'
              >
                <RiLoopLeftFill
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                ></RiLoopLeftFill>
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className='flex flex-col sm:flex-row gap-4 mb-6'>
            <div className='relative flex-1'>
              <BsSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
              <input
                type='text'
                placeholder='Search products or manufacturers...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#144e8b] focus:border-[#144e8b] transition-colors'
              />
            </div>
            <div className='flex gap-2'>
              <select
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value)}
                className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#144e8b] focus:border-[#144e8b] transition-colors bg-white'
              >
                <option value='all'>All Stock Levels</option>
                <option value='inStock'>In Stock</option>
                <option value='lowStock'>Low Stock</option>
                <option value='outOfStock'>Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {loading ?
          <div className='flex items-center justify-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#0e355e]'></div>
            <span className='ml-3 text-gray-600'>Loading products...</span>
          </div>
        : error ?
          <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
            <div className='flex items-center'>
              <div className='text-red-600 font-medium'>
                Error loading products:
              </div>
            </div>
            <div className='text-red-500 mt-1'>{error}</div>
          </div>
        : filteredProducts.length === 0 ?
          <div className='text-center py-12'>
            <div className='text-gray-500 mb-2'>No products found</div>
            <div className='text-sm text-gray-400'>
              {searchTerm || filterStock !== "all" ?
                "Try adjusting your search or filter criteria"
              : "No products available"}
            </div>
          </div>
        : <>
            {/* Mobile Card Layout */}
            <div className='grid gap-4 lg:hidden'>
              {filteredProducts.map((product) => {
                const eachStock = product.each?.countInStock ?? 0;
                const boxStock = product.box?.countInStock ?? 0;
                const totalStock = eachStock + boxStock;
                const stockStatus = getStockStatus(totalStock);

                return (
                  <div
                    key={product._id}
                    className='bg-white shadow-md rounded-xl p-5 border border-gray-100 hover:shadow-lg transition-all duration-200'
                  >
                    {/* Header with Image and Title */}
                    <div className='flex items-start gap-4 mb-4'>
                      <div className='flex-shrink-0 relative'>
                        <Image
                          width={80}
                          height={80}
                          src={product.image}
                          alt={product.name}
                          className='rounded-xl object-cover shadow-sm'
                          loading='lazy'
                        />
                        <div
                          className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${stockStatus.badge}`}
                        ></div>
                      </div>
                      <div className='min-w-0 flex-1'>
                        <h3 className='font-bold text-gray-900 text-lg leading-tight mb-1'>
                          {product.name}
                        </h3>
                        <p className='text-gray-600 text-sm font-medium'>
                          {product.manufacturer}
                        </p>
                        <div
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${stockStatus.color}`}
                        >
                          {stockStatus.label}
                        </div>
                      </div>
                    </div>

                    {/* Pricing Grid */}
                    <div className='grid grid-cols-2 gap-4 mb-4'>
                      <div className='bg-gray-50 rounded-lg p-3'>
                        <div className='text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1'>
                          Each
                        </div>
                        <div className='text-lg font-bold text-gray-900'>
                          ${product.each?.wpPrice ?? "N/A"}
                        </div>
                        <div className='text-sm text-gray-600'>
                          Stock: {eachStock}
                        </div>
                      </div>
                      <div className='bg-gray-50 rounded-lg p-3'>
                        <div className='text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1'>
                          Box
                        </div>
                        <div className='text-lg font-bold text-gray-900'>
                          ${product.box?.wpPrice ?? "N/A"}
                        </div>
                        <div className='text-sm text-gray-600'>
                          Stock: {boxStock}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className='mb-4'>
                      <p className='text-sm text-gray-700 line-clamp-2 leading-relaxed'>
                        {product.information || "No description available"}
                      </p>
                    </div>

                    {/* Action Button */}
                    <Link
                      href={`/admin/product/${product._id}`}
                      className='block w-full text-center px-4 py-3 bg-gradient-to-r bg-[#0e355e] text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg'
                    >
                      Edit Product Info
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table Layout */}
            <div className='hidden lg:block bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200'>
              <div className='max-h-[80vh] overflow-auto custom-scrollbar'>
                <table className='min-w-full'>
                  <thead className='bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 sticky top-0 z-10'>
                    <tr>
                      <th className='px-6 py-4 text-left'>
                        <div className='flex items-center gap-2'>
                          <span className='text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                            Product / Manufacturer
                          </span>
                          <button
                            onClick={toggleSortDirection}
                            className='p-1 rounded-md hover:bg-gray-200 transition-colors'
                            title={`Sort ${
                              sortDirection === -1 ? "Ascending" : "Descending"
                            }`}
                          >
                            {sortDirection === -1 ?
                              <BsFillArrowUpSquareFill className='text-[#0e355e]' />
                            : <BsFillArrowDownSquareFill className='text-[#144e8b]' />
                            }
                          </button>
                        </div>
                      </th>
                      <th className='px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                        Each
                      </th>
                      <th className='px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                        Box
                      </th>
                      <th className='px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                        Status
                      </th>
                      <th className='px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[200px]'>
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-200'>
                    {filteredProducts.map((product, index) => {
                      const eachStock = product.each?.countInStock ?? 0;
                      const boxStock = product.box?.countInStock ?? 0;
                      const totalStock = eachStock + boxStock;
                      const stockStatus = getStockStatus(totalStock);

                      return (
                        <tr
                          key={product._id}
                          className={`hover:bg-gray-50 transition-colors ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-25"
                          }`}
                        >
                          <td className='px-6 py-4'>
                            <div className='flex items-center gap-4'>
                              <div className='flex-shrink-0 relative'>
                                <Image
                                  width={64}
                                  height={64}
                                  src={product.image}
                                  alt={product.name}
                                  className='rounded-lg object-cover shadow-sm border border-gray-200'
                                  loading='lazy'
                                />
                                <div
                                  className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${stockStatus.badge} border-2 border-white`}
                                ></div>
                              </div>
                              <div className='min-w-0 flex-1'>
                                <div className='font-semibold text-gray-900 text-sm leading-tight mb-1'>
                                  {product.name}
                                </div>
                                <div className='text-gray-600 text-sm font-medium'>
                                  {product.manufacturer}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className='px-4 py-4'>
                            <div className='text-sm'>
                              <div className='font-bold text-gray-900 text-lg'>
                                ${product.each?.wpPrice ?? "N/A"}
                              </div>
                              <div className='text-gray-600'>
                                Stock:{" "}
                                <span className='font-medium'>{eachStock}</span>
                              </div>
                            </div>
                          </td>
                          <td className='px-4 py-4'>
                            <div className='text-sm'>
                              <div className='font-bold text-gray-900 text-lg'>
                                ${product.box?.wpPrice ?? "N/A"}
                              </div>
                              <div className='text-gray-600'>
                                Stock:{" "}
                                <span className='font-medium'>{boxStock}</span>
                              </div>
                            </div>
                          </td>
                          <td className='px-4 py-4'>
                            <div
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}
                            >
                              {stockStatus.label}
                            </div>
                            <div className='text-xs text-gray-500 mt-1'>
                              Total: {totalStock}
                            </div>
                          </td>
                          <td className='px-4 py-4'>
                            <div className='text-sm text-gray-700 line-clamp-3 leading-relaxed max-w-xs'>
                              {product.information ||
                                "No description available"}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        }
      </div>
    </Layout>
  );
}
