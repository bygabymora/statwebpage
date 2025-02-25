import React, { useState, useRef, useEffect } from "react";
import Layout from "../../components/main/Layout";
import { ProductItemPage } from "../../components/products/ProductItemPage";
import { AiOutlineMenuFold } from "react-icons/ai";
import axios from 'axios';

export default function Products() {
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const [showManufacturers, setShowManufacturers] = useState(false);
  const [products, setProducts] = useState([]);
  const firstProductRef = useRef(null);
  const manufacturersMap = new Map();
  

  const [loading, setLoading] = useState(true);
  const fetchData = async () => {
    try {
      setLoading(true);
      const sortDirection = 1;
      const sortQuery = sortDirection === 1 ? "asc" : "desc";
      const { data } = await axios.get(`/api/products?sort=${sortQuery}`);
      setProducts(data);
    } catch (err) {
      console.error('Error al obtener productos:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);

  products.forEach((product) => {
    const normalized = product.manufacturer?.trim().toLowerCase(); // Elimina espacios y normaliza
    if (!manufacturersMap.has(normalized)) {
      manufacturersMap.set(normalized, product.manufacturer?.trim()); // Guarda el original
    }
  });
  
  const manufacturers = [...manufacturersMap.values()];

  const filteredProducts = selectedManufacturer
  ? products.filter(
      (product) => product.manufacturer.trim().toLowerCase() === selectedManufacturer.trim().toLowerCase()
    )
  : products;

  const handleManufacturerClick = (manufacturer) => {
    setSelectedManufacturer(manufacturer);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleShowAll = () => {
    setSelectedManufacturer(null);
  };

  return (
    <Layout title="Products">
      <div className="grid grid-cols-1 md:grid-cols-4">
        <div className="md:col-span-1 p-4">
          <div className="block md:hidden mb-4">
            <button
              className="bg-[#144e8b] px-4 py-2 rounded"
              onClick={() => setShowManufacturers(!showManufacturers)}
            >
              <AiOutlineMenuFold color="white"/>
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
                selectedManufacturer === null
                  ? "bg-slate-200 cursor-pointer"
                  : ""
              }`}
            >
              ALL PRODUCTS
            </div>
            <h2
              className="block justify-center card items-center text-center my-3 text-xs lg:text-lg pb-3"
              id="manufacturers"
            >
              Manufacturers
            </h2>
            {manufacturers.map((manufacturer, index) => (
              <div
                class="block justify-center card items-center text-center my-3 text-xs lg:text-lg pb-3"
                key={index}
                onClick={() => handleManufacturerClick(manufacturer)}
                className={`manufacturer-item cursor-pointer block justify-center card items-center text-center my-3 text-xs lg:text-lg pb-3 ${
                  selectedManufacturer === manufacturer
                    ? "bg-slate-200 cursor-pointer"
                    : ""
                }`}
              >
                {manufacturer}
              </div>
            ))}
          </ul>
        </div>
        <div className="md:col-span-3">
          <h2 className="section__title" id="products">
            Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-2">
            {loading ? (
            <p>Cargando productos...</p>
            ) : (
            filteredProducts.map((product, index) => (
            <ProductItemPage 
            product={product} 
            key={product.name}
            ref={index === 0 ? firstProductRef : null}
            ></ProductItemPage>
            ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
