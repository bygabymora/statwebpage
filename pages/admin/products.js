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
                  Product Management
                </h1>
                <p className='mt-1 text-sm text-slate-600 sm:text-base'>
                  Review inventory, pricing, and stock health across your
                  catalog.
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

            <div className='mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
              <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Showing
                </p>
                <p className='mt-1 text-2xl font-bold text-[#0e355e]'>
                  {filteredProducts.length}
                </p>
                <p className='text-xs text-slate-500'>
                  Products in current view
                </p>
              </div>
              <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Catalog
                </p>
                <p className='mt-1 text-2xl font-bold text-[#0e355e]'>
                  {products.length}
                </p>
                <p className='text-xs text-slate-500'>
                  Total products available
                </p>
              </div>
              <div className='rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2 lg:col-span-1'>
                <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Stock Filter
                </p>
                <p className='mt-1 text-base font-semibold text-[#0e355e]'>
                  {filterStock === "all" && "All Stock Levels"}
                  {filterStock === "inStock" && "In Stock"}
                  {filterStock === "lowStock" && "Low Stock"}
                  {filterStock === "outOfStock" && "Out of Stock"}
                </p>
                <p className='text-xs text-slate-500'>
                  Current inventory segment
                </p>
              </div>
            </div>

            <div className='flex flex-col gap-3 sm:flex-row'>
              <div className='relative flex-1'>
                <BsSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' />
                <input
                  type='text'
                  placeholder='Search products or manufacturers...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm transition-colors placeholder:text-slate-400 focus:border-[#144e8b] focus:outline-none focus:ring-2 focus:ring-[#9fc0e5]'
                />
              </div>

              <select
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value)}
                className='w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm transition-colors focus:border-[#144e8b] focus:outline-none focus:ring-2 focus:ring-[#9fc0e5] sm:w-56'
              >
                <option value='all'>All Stock Levels</option>
                <option value='inStock'>In Stock</option>
                <option value='lowStock'>Low Stock</option>
                <option value='outOfStock'>Out of Stock</option>
              </select>
            </div>
          </section>

          {loading ?
            <div className='flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-14 shadow-sm'>
              <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-[#0e355e]'></div>
              <span className='ml-3 text-slate-600'>Loading products...</span>
            </div>
          : error ?
            <div className='mb-6 rounded-xl border border-red-200 bg-red-50 p-4'>
              <div className='text-sm font-semibold text-red-700'>
                Error loading products
              </div>
              <div className='mt-1 text-sm text-red-600'>{error}</div>
            </div>
          : filteredProducts.length === 0 ?
            <div className='rounded-2xl border border-slate-200 bg-white py-14 text-center shadow-sm'>
              <div className='mb-2 text-base font-semibold text-slate-600'>
                No products found
              </div>
              <div className='text-sm text-slate-500'>
                {searchTerm || filterStock !== "all" ?
                  "Try adjusting your search or filter criteria"
                : "No products available"}
              </div>
            </div>
          : <>
              <div className='grid gap-4 lg:hidden'>
                {filteredProducts.map((product) => {
                  const eachStock = product.each?.countInStock ?? 0;
                  const boxStock = product.box?.countInStock ?? 0;
                  const totalStock = eachStock + boxStock;
                  const stockStatus = getStockStatus(totalStock);

                  return (
                    <article
                      key={product._id}
                      className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md'
                    >
                      <div className='h-1 w-full bg-gradient-to-r from-[#0e355e] to-[#2c6aa9]'></div>
                      <div className='p-5'>
                        <div className='mb-4 flex items-start gap-4'>
                          <div className='relative flex-shrink-0'>
                            <Image
                              width={80}
                              height={80}
                              src={product.image}
                              alt={product.name}
                              className='rounded-xl border border-slate-200 object-cover shadow-sm'
                              loading='lazy'
                            />
                            <span
                              className={`absolute -right-1 -top-1 h-3 w-3 rounded-full ${stockStatus.badge} ring-2 ring-white`}
                            ></span>
                          </div>
                          <div className='min-w-0 flex-1'>
                            <h3 className='text-base font-bold leading-tight text-slate-900'>
                              {product.name}
                            </h3>
                            <p className='mt-1 text-sm font-medium text-slate-600'>
                              {product.manufacturer}
                            </p>
                            <span
                              className={`mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${stockStatus.color}`}
                            >
                              {stockStatus.label}
                            </span>
                          </div>
                        </div>

                        <div className='mb-4 grid grid-cols-2 gap-3'>
                          <div className='rounded-lg border border-slate-200 bg-slate-50 p-3'>
                            <div className='mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500'>
                              Each
                            </div>
                            <div className='text-lg font-bold text-slate-900'>
                              ${product.each?.wpPrice ?? "N/A"}
                            </div>
                            <div className='text-sm text-slate-600'>
                              Stock: {eachStock}
                            </div>
                          </div>
                          <div className='rounded-lg border border-slate-200 bg-slate-50 p-3'>
                            <div className='mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500'>
                              Box
                            </div>
                            <div className='text-lg font-bold text-slate-900'>
                              ${product.box?.wpPrice ?? "N/A"}
                            </div>
                            <div className='text-sm text-slate-600'>
                              Stock: {boxStock}
                            </div>
                          </div>
                        </div>

                        <div className='mb-4 rounded-lg border border-slate-200 bg-white p-3'>
                          <p className='line-clamp-2 text-sm leading-relaxed text-slate-700'>
                            {product.information || "No description available"}
                          </p>
                          <p className='mt-2 text-xs font-medium text-slate-500'>
                            Total Stock: {totalStock}
                          </p>
                        </div>

                        <Link
                          href={`/admin/product/${product._id}`}
                          className='block w-full rounded-lg bg-[#0e355e] px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[#144e8b]'
                        >
                          Edit Product Info
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>

              <section className='hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block'>
                <div className='overflow-x-auto'>
                  <div className='min-w-[1120px]'>
                    <div className='grid grid-cols-12 items-center gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4'>
                      <div className='col-span-4 flex items-center gap-2'>
                        <span className='text-xs font-semibold uppercase tracking-wider text-slate-600'>
                          Product / Manufacturer
                        </span>
                        <button
                          onClick={toggleSortDirection}
                          className='rounded-md p-1 transition-colors hover:bg-slate-200'
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
                      <div className='col-span-2 text-xs font-semibold uppercase tracking-wider text-slate-600'>
                        Each
                      </div>
                      <div className='col-span-2 text-xs font-semibold uppercase tracking-wider text-slate-600'>
                        Box
                      </div>
                      <div className='col-span-1 text-xs font-semibold uppercase tracking-wider text-slate-600'>
                        Status
                      </div>
                      <div className='col-span-2 text-xs font-semibold uppercase tracking-wider text-slate-600'>
                        Description
                      </div>
                    </div>

                    <div className='divide-y divide-slate-200'>
                      {filteredProducts.map((product, index) => {
                        const eachStock = product.each?.countInStock ?? 0;
                        const boxStock = product.box?.countInStock ?? 0;
                        const totalStock = eachStock + boxStock;
                        const stockStatus = getStockStatus(totalStock);

                        return (
                          <div
                            key={product._id}
                            className={`grid grid-cols-12 items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50 ${
                              index % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                            }`}
                          >
                            <div className='col-span-4'>
                              <div className='flex items-center gap-4'>
                                <div className='relative flex-shrink-0'>
                                  <Image
                                    width={64}
                                    height={64}
                                    src={product.image}
                                    alt={product.name}
                                    className='rounded-lg border border-slate-200 object-cover shadow-sm'
                                    loading='lazy'
                                  />
                                  <span
                                    className={`absolute -right-1 -top-1 h-3 w-3 rounded-full ${stockStatus.badge} ring-2 ring-white`}
                                  ></span>
                                </div>
                                <div className='min-w-0'>
                                  <div className='truncate text-sm font-semibold leading-tight text-slate-900'>
                                    {product.name}
                                  </div>
                                  <div className='truncate text-sm font-medium text-slate-600'>
                                    {product.manufacturer}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className='col-span-2 text-sm'>
                              <div className='text-lg font-bold text-slate-900'>
                                ${product.each?.wpPrice ?? "N/A"}
                              </div>
                              <div className='text-slate-600'>
                                Stock:{" "}
                                <span className='font-semibold'>
                                  {eachStock}
                                </span>
                              </div>
                            </div>

                            <div className='col-span-2 text-sm'>
                              <div className='text-lg font-bold text-slate-900'>
                                ${product.box?.wpPrice ?? "N/A"}
                              </div>
                              <div className='text-slate-600'>
                                Stock:{" "}
                                <span className='font-semibold'>
                                  {boxStock}
                                </span>
                              </div>
                            </div>

                            <div className='col-span-1'>
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${stockStatus.color}`}
                              >
                                {stockStatus.label}
                              </span>
                              <div className='mt-1 text-xs text-slate-500'>
                                Total: {totalStock}
                              </div>
                            </div>

                            <div className='col-span-2'>
                              <div className='line-clamp-3 text-sm leading-relaxed text-slate-700'>
                                {product.information ||
                                  "No description available"}
                              </div>
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
