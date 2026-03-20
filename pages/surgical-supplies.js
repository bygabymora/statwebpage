import React, { useState } from "react";
import Layout from "../components/main/Layout";
import Link from "next/link";
import { BsChevronRight } from "react-icons/bs";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import db from "../utils/db";
import Product from "../models/Product";
import { findManufacturerProfile } from "../utils/manufacturerProfiles";

export async function getStaticProps() {
  await db.connect(true);

  const productsRaw = await Product.find(
    { approved: true, active: true },
    {
      name: 1,
      manufacturer: 1,
      "each.countInStock": 1,
      "box.countInStock": 1,
      "each.wpPrice": 1,
      "box.wpPrice": 1,
    },
  ).lean();

  const manufacturerMap = new Map();
  productsRaw.forEach((p) => {
    const mfr = p.manufacturer?.trim();
    if (!mfr) return;
    if (!manufacturerMap.has(mfr)) {
      manufacturerMap.set(mfr, { name: mfr, products: [] });
    }
    const eachStock = p.each?.countInStock ?? 0;
    const boxStock = p.box?.countInStock ?? 0;
    const hasStock = eachStock > 0 || boxStock > 0;

    manufacturerMap.get(mfr).products.push({
      name: p.name,
      hasStock,
    });
  });

  const manufacturers = [...manufacturerMap.values()]
    .sort((a, b) => b.products.length - a.products.length)
    .map((m) => {
      const profile = findManufacturerProfile(m.name);
      m.products.sort((a, b) => a.name.localeCompare(b.name));
      return {
        name: m.name,
        productCount: m.products.length,
        inStock: m.products.filter((p) => p.hasStock).length,
        specialties: profile?.specialties || [],
        products: m.products,
      };
    });

  return {
    props: {
      manufacturers: JSON.parse(JSON.stringify(manufacturers)),
      totalProducts: productsRaw.length,
    },
    revalidate: 3600,
  };
}

export default function SurgicalSupplies({ manufacturers, totalProducts }) {
  const [expandedMfr, setExpandedMfr] = useState(null);

  const toggleManufacturer = (name) => {
    setExpandedMfr(expandedMfr === name ? null : name);
  };

  const breadcrumbs = [
    { href: "/", name: "Home" },
    { href: "/products", name: "Products" },
    { name: "Surgical Supplies" },
  ];

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Surgical Supplies by Manufacturer",
    description:
      "Browse surgical supplies from leading manufacturers including Medtronic, Stryker, Johnson & Johnson, Zimmer Biomet, and more.",
    url: "https://www.statsurgicalsupply.com/surgical-supplies",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: totalProducts,
      itemListElement: manufacturers
        .flatMap((m) => m.products)
        .slice(0, 50)
        .map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: p.name,
          url: `https://www.statsurgicalsupply.com/products/${encodeURIComponent(p.name)}`,
        })),
    },
    provider: {
      "@type": "Organization",
      name: "STAT Surgical Supply",
      url: "https://www.statsurgicalsupply.com",
    },
  };

  return (
    <Layout
      title='Surgical Supplies by Manufacturer | STAT Surgical Supply'
      description='Browse surgical supplies from top manufacturers — Medtronic, Stryker, Johnson & Johnson, Zimmer Biomet, BD, and more. New, factory-sealed products with up to 50% savings.'
      schema={[schemaData]}
    >
      {/* Breadcrumbs */}
      <nav className='text-sm text-gray-700' aria-label='Breadcrumb'>
        <ul className='flex ml-0 lg:ml-20 items-center space-x-2 -mt-5'>
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={index} className='flex items-center'>
              {breadcrumb.href ?
                <Link
                  href={breadcrumb.href}
                  className='hover:underline text-[#0e355e]'
                >
                  {breadcrumb.name}
                </Link>
              : <span>{breadcrumb.name}</span>}
              {index < breadcrumbs.length - 1 && (
                <BsChevronRight className='mx-2 text-gray-500' />
              )}
            </li>
          ))}
        </ul>
      </nav>

      <main className='w-full'>
        {/* Hero */}
        <section className='py-14 px-6'>
          <div className='max-w-3xl mx-auto text-center'>
            <h1 className='text-3xl lg:text-4xl font-bold text-[#0e355e] mb-4'>
              Surgical Supplies
            </h1>
            <p className='text-gray-600 text-lg leading-relaxed'>
              {totalProducts.toLocaleString()} products from{" "}
              {manufacturers.length} manufacturers. New, factory-sealed, with
              savings up to 50%.
            </p>
            <div className='flex gap-3 justify-center mt-8'>
              <Link
                href='/products'
                className='px-6 py-3 bg-[#07783e] text-white text-sm font-semibold rounded-lg hover:bg-[#025e2d] transition-colors'
              >
                Browse All Products
              </Link>
              <Link
                href='/#contact'
                className='px-6 py-3 border border-[#0e355e] text-[#0e355e] text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors'
              >
                Request a Quote
              </Link>
            </div>
          </div>
        </section>

        {/* Manufacturers + Products */}
        <section className='pb-16 px-6'>
          <div className='max-w-4xl mx-auto'>
            <div className='border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-200'>
              {manufacturers.map((m) => {
                const isExpanded = expandedMfr === m.name;
                return (
                  <div key={m.name}>
                    <button
                      onClick={() => toggleManufacturer(m.name)}
                      className='w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors'
                    >
                      <div className='flex items-center gap-3 min-w-0'>
                        <h2 className='text-sm font-semibold text-[#0e355e] truncate'>
                          {m.name}
                        </h2>
                        <span className='text-xs text-gray-500 whitespace-nowrap'>
                          {m.productCount}
                        </span>
                        {m.inStock > 0 && (
                          <span className='text-xs text-[#07783e] whitespace-nowrap hidden sm:inline'>
                            {m.inStock} in stock
                          </span>
                        )}
                      </div>
                      <div className='text-gray-400 text-xs ml-3'>
                        {isExpanded ?
                          <FaChevronUp />
                        : <FaChevronDown />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className='bg-gray-50 px-5 py-4 border-t border-gray-100'>
                        <ul className='columns-1 sm:columns-2 lg:columns-3 gap-x-6'>
                          {m.products.map((product) => (
                            <li
                              key={product.name}
                              className='break-inside-avoid mb-1'
                            >
                              <Link
                                href={`/products/${encodeURIComponent(product.name)}`}
                                title={`${product.name} by ${m.name}`}
                                className='inline-flex items-center gap-1.5 text-sm text-gray-700 hover:text-[#07783e] transition-colors py-0.5'
                              >
                                <span className='truncate'>{product.name}</span>
                                {product.hasStock && (
                                  <span className='text-[10px] text-[#07783e] flex-shrink-0'>
                                    ●
                                  </span>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                        <div className='mt-3 pt-3 border-t border-gray-200'>
                          <Link
                            href={`/products?manufacturer=${encodeURIComponent(m.name)}`}
                            className='text-xs font-medium text-[#07783e] hover:underline'
                          >
                            View all {m.name} products →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className='bg-[#0e355e] py-12 px-6'>
          <div className='max-w-2xl mx-auto text-center'>
            <h2 className='text-2xl font-bold text-white mb-3'>
              Can&apos;t find what you need?
            </h2>
            <p className='text-gray-300 mb-6'>
              We source hard-to-find and discontinued surgical supplies from
              major manufacturers.
            </p>
            <div className='flex gap-3 justify-center'>
              <Link
                href='/#contact'
                className='px-6 py-3 bg-[#07783e] text-white text-sm font-semibold rounded-lg hover:bg-[#025e2d] transition-colors'
              >
                Contact Us
              </Link>
              <Link
                href='/support'
                className='px-6 py-3 border border-white/30 text-white text-sm font-semibold rounded-lg hover:bg-white/10 transition-colors'
              >
                Support
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
