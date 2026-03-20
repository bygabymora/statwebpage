import React, { useState, useRef } from "react";
import Layout from "../components/main/Layout";
import Link from "next/link";
import { BsChevronRight } from "react-icons/bs";
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
  const [activeMfr, setActiveMfr] = useState(manufacturers[0]?.name || null);
  const sectionRefs = useRef({});

  const scrollToManufacturer = (name) => {
    setActiveMfr(name);
    sectionRefs.current[name]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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
        {/* Header */}
        <section className='pt-10 pb-6 px-6'>
          <div className='max-w-6xl mx-auto'>
            <h1 className='text-2xl lg:text-3xl font-bold text-[#0e355e]'>
              Surgical Supplies
            </h1>
            <p className='text-gray-500 mt-2'>
              {totalProducts.toLocaleString()} products &middot;{" "}
              {manufacturers.length} manufacturers &middot; New & factory-sealed
            </p>
          </div>
        </section>

        {/* Two-column layout */}
        <section className='px-6 pb-16'>
          <div className='max-w-6xl mx-auto flex gap-8'>
            {/* Sidebar — manufacturer index */}
            <aside className='hidden lg:block w-56 flex-shrink-0'>
              <div className='sticky top-24'>
                <h2 className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3'>
                  Manufacturers
                </h2>
                <nav className='space-y-0.5 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2'>
                  {manufacturers.map((m) => (
                    <button
                      key={m.name}
                      onClick={() => scrollToManufacturer(m.name)}
                      className={`w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors truncate ${
                        activeMfr === m.name ?
                          "bg-[#0e355e] text-white"
                        : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {m.name}
                      <span
                        className={`ml-1 text-xs ${activeMfr === m.name ? "text-gray-300" : "text-gray-400"}`}
                      >
                        {m.productCount}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main content — all manufacturers expanded */}
            <div className='flex-1 min-w-0'>
              {/* Mobile manufacturer selector */}
              <div className='lg:hidden mb-6'>
                <select
                  value={activeMfr || ""}
                  onChange={(e) => scrollToManufacturer(e.target.value)}
                  className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#0e355e] bg-white'
                >
                  {manufacturers.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.name} ({m.productCount})
                    </option>
                  ))}
                </select>
              </div>

              {/* Manufacturer sections */}
              <div className='space-y-10'>
                {manufacturers.map((m) => (
                  <section
                    key={m.name}
                    ref={(el) => (sectionRefs.current[m.name] = el)}
                    className='scroll-mt-24'
                  >
                    <div className='flex items-baseline justify-between mb-4 border-b border-gray-200 pb-2'>
                      <h2 className='text-lg font-bold text-[#0e355e]'>
                        {m.name}
                      </h2>
                      <div className='flex items-center gap-3 text-xs text-gray-400'>
                        {m.inStock > 0 && (
                          <span className='text-[#07783e]'>
                            {m.inStock} in stock
                          </span>
                        )}
                        <span>{m.productCount} products</span>
                      </div>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-1'>
                      {m.products.map((product) => (
                        <Link
                          key={product.name}
                          href={`/products/${encodeURIComponent(product.name)}`}
                          title={`${product.name} by ${m.name}`}
                          className='group flex items-center gap-2 py-1.5 text-sm text-gray-700 hover:text-[#07783e] transition-colors'
                        >
                          <BsChevronRight className='text-[10px] text-gray-300 group-hover:text-[#07783e] flex-shrink-0 transition-colors' />
                          <span className='truncate'>{product.name}</span>
                          {product.hasStock && (
                            <span className='w-1.5 h-1.5 rounded-full bg-[#07783e] flex-shrink-0' />
                          )}
                        </Link>
                      ))}
                    </div>

                    <div className='mt-3'>
                      <Link
                        href={`/products?manufacturer=${encodeURIComponent(m.name)}`}
                        className='text-xs text-[#07783e] hover:underline'
                      >
                        Browse all {m.name} products →
                      </Link>
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className='border-t border-gray-200 py-10 px-6'>
          <div className='max-w-2xl mx-auto text-center'>
            <h2 className='text-xl font-bold text-[#0e355e] mb-2'>
              Can&apos;t find what you need?
            </h2>
            <p className='text-gray-500 text-sm mb-5'>
              We source hard-to-find and discontinued surgical supplies from
              major manufacturers.
            </p>
            <div className='flex gap-3 justify-center'>
              <Link
                href='/#contact'
                className='px-5 py-2.5 bg-[#07783e] text-white text-sm font-semibold rounded-lg hover:bg-[#025e2d] transition-colors'
              >
                Contact Us
              </Link>
              <Link
                href='/products'
                className='px-5 py-2.5 border border-gray-300 text-[#0e355e] text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors'
              >
                All Products
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
