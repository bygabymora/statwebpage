import React, { useState, useEffect } from "react";
import Layout from "../../components/main/Layout";
import { ProductItemPage } from "../../components/products/ProductItemPage";
import { AiOutlineMenuFold } from "react-icons/ai";
import axios from "axios";
import { BsChevronRight } from "react-icons/bs";
import Link from "next/link";
import { useRouter } from "next/router";
import SearchForm from "../../components/products/SearchForm";

export default function Products() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [searchedWord, setSearchedWord] = useState("");
  const { manufacturer, query } = router.query;
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const [showManufacturers, setShowManufacturers] = useState(false);
  const [products, setProducts] = useState([]);
  const manufacturersMap = new Map();
  const [loading, setLoading] = useState(true);

  const fetchSearchResults = async () => {
    const { data } = await axios.get(`/api/search?keyword=${query}`);
    setProducts(data);
    if (data.length === 0) {
      setSearchedWord(query);
    }
  };

  const fetchData = async () => {
    const { data } = await axios.get(`/api/products`);
    setProducts(data);
  };

  useEffect(() => {
    try {
      setLoading(true);
      if (!query) {
        console.log("No query provided");
        fetchData();
      } else {
        console.log("Query provided:", query);
        fetchSearchResults();
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [router, query, router.query]);

  // FIX: Every time you change manufacturers in the URL, it updates the selected manufacturer
  useEffect(() => {
    if (manufacturer) {
      setSelectedManufacturer(decodeURIComponent(manufacturer));
    } else {
      setSelectedManufacturer(null);
    }
  }, [manufacturer]);

  products.forEach((product) => {
    const normalized = product.manufacturer?.trim().toLowerCase();
    if (!manufacturersMap.has(normalized)) {
      manufacturersMap.set(normalized, product.manufacturer?.trim());
    }
  });

  const manufacturers = [...manufacturersMap.values()];

  const filteredProducts = selectedManufacturer
    ? products.filter((product) => {
        return (
          product.manufacturer?.trim().toLowerCase() ===
          selectedManufacturer?.trim().toLowerCase()
        );
      })
    : products;

  const handleManufacturerClick = (manufacturer) => {
    router.push(
      `/products?manufacturer=${encodeURIComponent(manufacturer)}`,
      undefined,
      { shallow: true }
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleShowAll = () => {
    router.push("/products", undefined, { shallow: true });
  };

  const breadcrumbs = [{ name: "Home", href: "/" }, { name: "Products" }];

  return (
    <Layout title='Products'>
      <nav className='text-sm text-gray-700'>
        <div className='flex justify-between items-center'>
          <ul className='flex ml-0 lg:ml-20 items-center space-x-2'>
            {breadcrumbs.map((breadcrumb, index) => (
              <li key={index} className='flex items-center'>
                {breadcrumb.href ? (
                  <Link
                    href={breadcrumb.href}
                    className='hover:underline text-[#144e8b]'
                  >
                    {breadcrumb.name}
                  </Link>
                ) : (
                  <span>{breadcrumb.name}</span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <BsChevronRight className='mx-2 text-gray-500' />
                )}
              </li>
            ))}
          </ul>
          <div className='block md:hidden'>
            <button
              className='bg-[#144e8b] px-4 py-2 rounded'
              onClick={() => setShowManufacturers(!showManufacturers)}
            >
              <AiOutlineMenuFold color='white' />
            </button>
          </div>
        </div>
      </nav>
      <div className='mt-2 grid grid-cols-1 md:grid-cols-4'>
        <div className='md:col-span-1 p-4'>
          <ul
            className={`${
              showManufacturers ? "block" : "hidden"
            } md:block md:sticky md:top-[16rem]`}
          >
            <h2
              className='block justify-center items-center text-center my-3 text-xs lg:text-lg'
              id='manufacturers'
            >
              MANUFACTURERS
            </h2>
            <div className='max-h-[60vh] pt-2 overflow-y-auto custom-scrollbar'>
              <div>
                {" "}
                <div
                  onClick={handleShowAll}
                  className={` cursor-pointer block justify-center card items-center text-center my-3 text-xs lg:text-lg pb-3 sticky top-0 ${
                    selectedManufacturer === null && !query
                      ? "primary-button"
                      : "secondary-button"
                  }`}
                >
                  {selectedManufacturer === null && !query
                    ? "ALL PRODUCTS"
                    : "SEE ALL PRODUCTS"}
                </div>
                {manufacturers
                  .slice()
                  .sort((a, b) => a.localeCompare(b))
                  .map((manufacturer, index) => (
                    <div
                      key={index}
                      onClick={() => handleManufacturerClick(manufacturer)}
                      className={` cursor-pointer block justify-center card items-center text-center my-3 text-xs lg:text-lg py-2 ${
                        selectedManufacturer === manufacturer
                          ? "bg-slate-200"
                          : ""
                      }`}
                    >
                      {manufacturer}
                    </div>
                  ))}
              </div>
            </div>
          </ul>
        </div>
        <div className='md:col-span-3'>
          <h2 className='section__title' id='products'>
            Products
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-2'>
            {loading ? (
              <p>Loading products...</p>
            ) : products.length > 0 ? (
              filteredProducts.map((product, index) => (
                <div key={index}>
                  <ProductItemPage product={product} />
                </div>
              ))
            ) : products.length === 0 && searchedWord ? (
              <SearchForm
                searchedWord={searchedWord}
                setSearchedWord={setSearchedWord}
                name={name}
                setName={setName}
              />
            ) : null}
          </div>
        </div>
      </div>
    </Layout>
  );
}
