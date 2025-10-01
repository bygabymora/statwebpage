import React, { useMemo, useState, useEffect } from "react";
import Layout from "../../components/main/Layout";
import { ProductItemPage } from "../../components/products/ProductItemPage";
import { AiOutlineMenuFold } from "react-icons/ai";
import { BsChevronRight } from "react-icons/bs";
import Link from "next/link";
import { useRouter } from "next/router";
import SearchForm from "../../components/products/SearchForm";
import db from "../../utils/db";
import Product from "../../models/Product";
import { enrichAndSortForPublic } from "../../utils/productSort";

export async function getStaticProps() {
  await db.connect(true);

  const productsRaw = await Product.find(
    { approved: true, active: true },
    {
      name: 1,
      image: 1,
      manufacturer: 1,
      "each.description": 1,
      "box.description": 1,
      "each.countInStock": 1,
      "box.countInStock": 1,
      "each.clearanceCountInStock": 1,
      "box.clearanceCountInStock": 1,
      "each.wpPrice": 1,
      "box.wpPrice": 1,
      "clearance.price": 1,
      sentOvernigth: 1,
    }
  ).lean();

  // ⬇⬇ SAME order you need
  const products = enrichAndSortForPublic(productsRaw);

  return {
    props: { products: JSON.parse(JSON.stringify(products)) },
    revalidate: 300,
  };
}

export default function Products({ products }) {
  const router = useRouter();
  const { manufacturer, query } = router.query;

  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const [showManufacturers, setShowManufacturers] = useState(false);
  const [page, setPage] = useState(1);
  const productsPerPage = 24;

  useEffect(() => {
    if (manufacturer) setSelectedManufacturer(decodeURIComponent(manufacturer));
    else setSelectedManufacturer(null);
  }, [manufacturer]);

  const manufacturers = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      const norm = p.manufacturer?.trim().toLowerCase();
      if (!map.has(norm)) map.set(norm, p.manufacturer?.trim());
    });
    return [...map.values()];
  }, [products]);

  // Keeps the original ORDER (just filtering)
  const byManufacturer = useMemo(() => {
    if (!selectedManufacturer) return products;
    const target = selectedManufacturer.trim().toLowerCase();
    return products.filter(
      (p) => p.manufacturer?.trim().toLowerCase() === target
    );
  }, [products, selectedManufacturer]);

  const filteredProducts = useMemo(() => {
    if (!query) return byManufacturer;
    const q = String(query).trim().toLowerCase();
    return byManufacturer.filter((p) => {
      const haystack = [
        p.name,
        p.manufacturer,
        p.each?.description,
        p.box?.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [byManufacturer, query]);

  const paginatedProducts = useMemo(
    () => filteredProducts.slice(0, page * productsPerPage),
    [filteredProducts, page]
  );

  const handleManufacturerClick = (manufacturer) => {
    router.push(
      `/products?manufacturer=${encodeURIComponent(manufacturer)}`,
      undefined,
      {
        shallow: true,
      }
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
    setPage(1);
  };

  const handleShowAll = () => {
    router.push("/products", undefined, { shallow: true });
    setPage(1);
  };

  const breadcrumbs = [{ name: "Home", href: "/" }, { name: "Products" }];

  return (
    <Layout title='Products'>
      <nav className='text-sm text-gray-700 mt-0 md:mt-2'>
        <div className='flex justify-between items-center my-0 md:my-4'>
          <ul className='flex ml-0 lg:ml-20 items-center space-x-2'>
            {breadcrumbs.map((breadcrumb, index) => (
              <li key={index} className='flex items-center'>
                {breadcrumb.href ? (
                  <Link
                    href={breadcrumb.href}
                    className='hover:underline text-[#0e355e]'
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
              onClick={() => setShowManufacturers((s) => !s)}
              aria-label='Toggle Manufacturers List'
            >
              <AiOutlineMenuFold color='white' />
            </button>
          </div>
        </div>
      </nav>
      <div className='mt-1 grid grid-cols-1 md:grid-cols-4'>
        <div className='md:col-span-1 p-4'>
          <ul
            className={`${
              showManufacturers ? "block" : "hidden"
            } md:block md:sticky md:top-[16rem]`}
          >
            <h2
              className='block justify-center items-center text-center text-xs lg:text-lg'
              id='manufacturers'
            >
              MANUFACTURERS
            </h2>
            <div className='max-h-[60vh] pt-2 overflow-y-auto custom-scrollbar'>
              <div>
                {" "}
                <div
                  onClick={handleShowAll}
                  className={`cursor-pointer block justify-center card items-center text-center my-3 text-xs lg:text-lg pb-3 sticky top-0 ${
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
                      className={`cursor-pointer block justify-center card items-center text-center my-3 text-xs lg:text-lg py-2 ${
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
          <h1 className='section__title -mt-7' id='products'>
            Products
          </h1>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((product, index) => (
                <ProductItemPage
                  key={product._id}
                  product={product}
                  index={index}
                />
              ))
            ) : query ? (
              <SearchForm
                searchedWord={String(query)}
                setSearchedWord={() => {}}
                name=''
                setName={() => {}}
              />
            ) : (
              <p>No products found.</p>
            )}
          </div>

          {filteredProducts.length > paginatedProducts.length && (
            <div className='text-center my-5 mt-4'>
              <button
                onClick={() => setPage((prev) => prev + 1)}
                className='primary-button'
              >
                Load More Products
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
