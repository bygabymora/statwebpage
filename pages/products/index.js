import React, { useState, useEffect } from "react";
import Layout from "../../components/main/Layout";
import { ProductItemPage } from "../../components/products/ProductItemPage";
import { AiOutlineMenuFold } from "react-icons/ai";
import axios from "axios";
import { BsChevronRight } from "react-icons/bs";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function Products() {
  const router = useRouter();
  const { manufacturer } = router.query;
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const [showManufacturers, setShowManufacturers] = useState(false);
  const [products, setProducts] = useState([]);
  const manufacturersMap = new Map();
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  const fetchData = async () => {
    try {
      setLoading(true);
      const sortDirection = 1;
      const sortQuery = sortDirection === 1 ? "asc" : "desc";
      const { data } = await axios.get(`/api/products?sort=${sortQuery}`);
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        const isProtectedUser =
          session?.user?.restricted === true && status === "authenticated";
        const isProtectedProduct = product?.protected === true;

        // If the user is protected and the product too, we exclude it
        if (isProtectedUser && isProtectedProduct) return false;

        return (
          product.manufacturer.trim().toLowerCase() ===
          selectedManufacturer.trim().toLowerCase()
        );
      })
    : products.filter((product) => {
        const isProtectedUser =
          session?.user?.restricted === true && status === "authenticated";
        const isProtectedProduct = product?.protected === true;

        if (isProtectedUser && isProtectedProduct) return false;

        return true;
      });

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
      </nav>
      <div className='grid grid-cols-1 md:grid-cols-4'>
        <div className='md:col-span-1 p-4'>
          <div className='block md:hidden '>
            <button
              className='bg-[#144e8b] px-4 py-2 rounded'
              onClick={() => setShowManufacturers(!showManufacturers)}
            >
              <AiOutlineMenuFold color='white' />
            </button>
          </div>
          <ul
            className={`${
              showManufacturers ? "block" : "hidden"
            } md:block md:sticky md:top-[8rem]`}
          >
            <div
              onClick={handleShowAll}
              className={`manufacturer-item cursor-pointer ${
                selectedManufacturer === null ? "bg-slate-200" : ""
              }`}
            >
              ALL PRODUCTS
            </div>
            <h2
              className='block justify-center items-center text-center my-3 text-xs lg:text-lg pb-3'
              id='manufacturers'
            >
              Manufacturers
            </h2>
            <div className='max-h-[60vh] pt-2 overflow-y-auto custom-scrollbar'>
              {manufacturers
                .slice()
                .sort((a, b) => a.localeCompare(b))
                .map((manufacturer, index) => (
                  <div
                    key={index}
                    onClick={() => handleManufacturerClick(manufacturer)}
                    className={`manufacturer-item cursor-pointer block justify-center card items-center text-center my-3 text-xs lg:text-lg pb-3 ${
                      selectedManufacturer === manufacturer
                        ? "bg-slate-200"
                        : ""
                    }`}
                  >
                    {manufacturer}
                  </div>
                ))}
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
            ) : (
              filteredProducts.map((product, index) => (
                <div key={index}>
                  <ProductItemPage product={product} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
