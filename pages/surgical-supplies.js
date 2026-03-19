import React, { useState } from "react";
import Layout from "../components/main/Layout";
import Link from "next/link";
import { BsChevronRight } from "react-icons/bs";
import {
  FaHospital,
  FaStethoscope,
  FaHeartbeat,
  FaBrain,
  FaBone,
  FaCut,
  FaShieldAlt,
  FaSyringe,
  FaUserMd,
  FaMicroscope,
  FaHandshake,
  FaChevronDown,
  FaChevronUp,
  FaBoxOpen,
} from "react-icons/fa";
import db from "../utils/db";
import Product from "../models/Product";
import { findManufacturerProfile } from "../utils/manufacturerProfiles";

const specialtyIcons = {
  Surgical: FaCut,
  Orthopedics: FaBone,
  Cardiovascular: FaHeartbeat,
  Neurology: FaBrain,
  "Sports Medicine": FaBone,
  Urology: FaSyringe,
  "Wound Care": FaShieldAlt,
  "Critical Care": FaHospital,
  Diagnostics: FaMicroscope,
  "Medical Devices": FaStethoscope,
  Surgery: FaCut,
  "ENT Surgery": FaUserMd,
  ENT: FaUserMd,
};

function getIconForSpecialty(specialty) {
  return specialtyIcons[specialty] || FaStethoscope;
}

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
      "each.description": 1,
    },
  ).lean();

  // Group products by manufacturer with product details
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
      id: p._id.toString(),
      name: p.name,
      hasStock,
    });
  });

  // Sort manufacturers by product count desc, products alphabetically
  const manufacturers = [...manufacturerMap.values()]
    .sort((a, b) => b.products.length - a.products.length)
    .map((m) => {
      const profile = findManufacturerProfile(m.name);
      m.products.sort((a, b) => a.name.localeCompare(b.name));
      return {
        name: m.name,
        productCount: m.products.length,
        inStock: m.products.filter((p) => p.hasStock).length,
        description: profile?.description || null,
        specialties: profile?.specialties || [],
        foundedYear: profile?.foundedYear || null,
        products: m.products,
      };
    });

  // Build specialty index
  const specialtyMap = new Map();
  manufacturers.forEach((m) => {
    m.specialties.forEach((s) => {
      if (!specialtyMap.has(s)) {
        specialtyMap.set(s, []);
      }
      specialtyMap.get(s).push({
        manufacturer: m.name,
        products: m.products.slice(0, 5),
      });
    });
  });

  const specialties = [...specialtyMap.entries()]
    .map(([name, entries]) => ({ name, entries }))
    .sort((a, b) => b.entries.length - a.entries.length);

  const totalProducts = productsRaw.length;

  return {
    props: {
      manufacturers: JSON.parse(JSON.stringify(manufacturers)),
      specialties: JSON.parse(JSON.stringify(specialties)),
      totalProducts,
    },
    revalidate: 3600,
  };
}

export default function SurgicalSupplies({
  manufacturers,
  specialties,
  totalProducts,
}) {
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
    name: "Surgical Supplies by Manufacturer & Specialty",
    description:
      "Browse surgical supplies from leading manufacturers including Medtronic, Stryker, Johnson & Johnson, Zimmer Biomet, and more. New, factory-sealed products at competitive prices.",
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
      description='Browse surgical supplies from top manufacturers — Medtronic, Stryker, Johnson & Johnson, Zimmer Biomet, BD, and more. New, factory-sealed products with up to 50% savings for hospitals and surgery centers.'
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
        {/* Hero Section */}
        <section className='text-black py-16 px-6 relative overflow-hidden'>
          <div className='max-w-6xl mx-auto relative z-10'>
            <header className='text-center'>
              <div className='inline-flex items-center bg-gray-100 rounded-full px-4 py-2 mb-6'>
                <FaHospital className='text-[#07783e] mr-2' />
                <span className='text-sm font-semibold'>
                  Trusted by 150+ Healthcare Facilities
                </span>
              </div>
              <h1 className='text-4xl lg:text-5xl font-bold leading-tight mb-6 text-[#0e355e]'>
                Surgical Supplies From
                <br />
                <span className='text-[#07783e]'>Leading Manufacturers</span>
              </h1>
              <p className='text-xl text-black mt-4 max-w-4xl mx-auto font-light leading-relaxed'>
                Browse{" "}
                <strong className='text-[#0e355e]'>
                  {totalProducts.toLocaleString()}+ surgical products
                </strong>{" "}
                from {manufacturers.length} trusted manufacturers. New,
                factory-sealed supplies for hospitals, surgery centers, and
                healthcare providers — with savings of up to{" "}
                <strong className='text-[#07783e]'>50%</strong>.
              </p>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 mb-8'>
                <div className='text-center'>
                  <div className='text-4xl font-bold text-[#0e355e]'>
                    {manufacturers.length}+
                  </div>
                  <div className='text-sm text-black mt-1'>Manufacturers</div>
                </div>
                <div className='text-center'>
                  <div className='text-4xl font-bold text-[#0e355e]'>
                    {totalProducts.toLocaleString()}+
                  </div>
                  <div className='text-sm text-black mt-1'>Products</div>
                </div>
                <div className='text-center'>
                  <div className='text-4xl font-bold text-[#0e355e]'>
                    {specialties.length}+
                  </div>
                  <div className='text-sm text-black mt-1'>
                    Medical Specialties
                  </div>
                </div>
              </div>

              <div className='flex flex-col sm:flex-row gap-4 justify-center mt-8'>
                <Link
                  href='/products'
                  className='px-8 py-4 bg-[#07783e] text-white text-lg font-bold rounded-lg shadow-xl hover:bg-[#025e2d] transition-all duration-300 transform hover:scale-105 flex items-center justify-center'
                >
                  <FaCut className='mr-2' />
                  Browse All Products
                </Link>
                <Link
                  href='/#contact'
                  className='px-8 py-4 border-2 border-[#0e355e] text-[#0e355e] text-lg font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center'
                >
                  <FaUserMd className='mr-2' />
                  Request a Quote
                </Link>
              </div>
            </header>
          </div>
        </section>

        {/* Browse by Specialty */}
        <section className='bg-white py-16 px-6'>
          <div className='max-w-6xl mx-auto'>
            <h2 className='text-3xl font-bold text-[#0e355e] text-center mb-4'>
              Browse by Medical Specialty
            </h2>
            <p className='text-center text-gray-600 mb-12 max-w-2xl mx-auto'>
              Find surgical supplies organized by clinical specialty. Click any
              product to view details, pricing, and availability.
            </p>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16'>
              {specialties.map((specialty) => {
                const IconComponent = getIconForSpecialty(specialty.name);
                return (
                  <div
                    key={specialty.name}
                    className='group p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 transition duration-300 hover:shadow-2xl'
                  >
                    <div className='flex items-center mb-4'>
                      <div className='bg-gradient-to-r from-[#07783e] to-[#0a9447] w-12 h-12 rounded-full flex items-center justify-center mr-4 group-hover:rotate-6 transition-transform duration-300'>
                        <IconComponent className='text-xl text-white' />
                      </div>
                      <h3 className='text-lg font-bold text-[#0e355e]'>
                        {specialty.name}
                      </h3>
                    </div>
                    {specialty.entries.map((entry) => (
                      <div key={entry.manufacturer} className='mb-3'>
                        <h4 className='text-sm font-semibold text-[#0e355e] mb-1'>
                          {entry.manufacturer}
                        </h4>
                        <ul className='space-y-1'>
                          {entry.products.map((product) => (
                            <li key={product.id}>
                              <Link
                                href={`/products/${product.id}`}
                                title={`${product.name} - ${entry.manufacturer} | STAT Surgical Supply`}
                                className='text-sm text-gray-700 hover:text-[#07783e] hover:underline flex items-center'
                              >
                                <BsChevronRight className='mr-1 text-xs text-[#07783e] flex-shrink-0' />
                                <span className='line-clamp-1'>
                                  {product.name}
                                </span>
                                {product.hasStock && (
                                  <span className='ml-auto text-xs text-[#07783e] flex-shrink-0'>
                                    In Stock
                                  </span>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* All Manufacturers with Product Links */}
        <section className='bg-[#f4f7fb] py-16 px-6'>
          <div className='max-w-6xl mx-auto'>
            <h2 className='text-3xl font-bold text-[#0e355e] text-center mb-4'>
              All Products by Manufacturer
            </h2>
            <p className='text-center text-gray-600 mb-12 max-w-2xl mx-auto'>
              Click a manufacturer to expand its product list. Every link takes
              you directly to the product page.
            </p>

            <div className='space-y-4'>
              {manufacturers.map((m) => {
                const isExpanded = expandedMfr === m.name;
                return (
                  <div
                    key={m.name}
                    className='bg-white rounded-xl shadow border border-gray-100 overflow-hidden transition-all duration-300'
                  >
                    <button
                      onClick={() => toggleManufacturer(m.name)}
                      className='w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors'
                    >
                      <div className='flex-1'>
                        <div className='flex items-center gap-3 flex-wrap'>
                          <h3 className='text-lg font-bold text-[#0e355e]'>
                            {m.name}
                          </h3>
                          <span className='text-xs bg-[#07783e]/10 text-[#07783e] font-semibold px-2 py-1 rounded-full'>
                            {m.productCount} product
                            {m.productCount !== 1 ? "s" : ""}
                          </span>
                          {m.inStock > 0 && (
                            <span className='text-xs text-[#07783e] font-medium'>
                              {m.inStock} in stock
                            </span>
                          )}
                        </div>
                        {m.description && (
                          <p className='text-sm text-gray-600 mt-1 line-clamp-1'>
                            {m.description}
                          </p>
                        )}
                        <div className='flex flex-wrap gap-2 mt-2'>
                          {m.specialties.slice(0, 4).map((s) => (
                            <span
                              key={s}
                              className='text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded'
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className='ml-4 text-[#0e355e]'>
                        {isExpanded ?
                          <FaChevronUp />
                        : <FaChevronDown />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className='border-t border-gray-100 px-6 py-4'>
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2'>
                          {m.products.map((product) => (
                            <Link
                              key={product.id}
                              href={`/products/${product.id}`}
                              title={`${product.name} by ${m.name} | STAT Surgical Supply`}
                              className='flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group'
                            >
                              <FaBoxOpen className='text-xs text-gray-400 group-hover:text-[#07783e] flex-shrink-0' />
                              <span className='text-sm text-gray-700 group-hover:text-[#07783e] line-clamp-1'>
                                {product.name}
                              </span>
                              {product.hasStock && (
                                <span className='ml-auto text-xs bg-green-50 text-[#07783e] px-1.5 py-0.5 rounded flex-shrink-0'>
                                  In Stock
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                        <div className='mt-4 pt-3 border-t border-gray-100 text-center'>
                          <Link
                            href={`/products?manufacturer=${encodeURIComponent(m.name)}`}
                            className='text-sm font-semibold text-[#07783e] hover:underline'
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

        {/* Quick Links Section */}
        <section className='bg-white py-16 px-6'>
          <div className='max-w-6xl mx-auto'>
            <h2 className='text-3xl font-bold text-[#0e355e] text-center mb-12'>
              Explore More
            </h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
              <Link
                href='/products'
                className='group p-6 bg-gradient-to-br from-[#0e355e] to-[#1a4971] rounded-xl text-white text-center hover:shadow-2xl transition-all duration-300 hover:scale-105'
              >
                <FaCut className='text-3xl mx-auto mb-3 group-hover:animate-bounce' />
                <h3 className='font-bold text-lg mb-1'>All Products</h3>
                <p className='text-sm text-gray-200'>Browse our full catalog</p>
              </Link>

              <Link
                href='/clearance'
                className='group p-6 bg-gradient-to-br from-[#07783e] to-[#0a9447] rounded-xl text-white text-center hover:shadow-2xl transition-all duration-300 hover:scale-105'
              >
                <FaShieldAlt className='text-3xl mx-auto mb-3 group-hover:animate-bounce' />
                <h3 className='font-bold text-lg mb-1'>Clearance</h3>
                <p className='text-sm text-gray-200'>
                  Special pricing on select items
                </p>
              </Link>

              <Link
                href='/savings'
                className='group p-6 bg-gradient-to-br from-[#0e355e] to-[#07783e] rounded-xl text-white text-center hover:shadow-2xl transition-all duration-300 hover:scale-105'
              >
                <FaHeartbeat className='text-3xl mx-auto mb-3 group-hover:animate-bounce' />
                <h3 className='font-bold text-lg mb-1'>Guaranteed Savings</h3>
                <p className='text-sm text-gray-200'>Save up to 50%</p>
              </Link>

              <Link
                href='/selling'
                className='group p-6 bg-gradient-to-br from-[#1a4971] to-[#0e355e] rounded-xl text-white text-center hover:shadow-2xl transition-all duration-300 hover:scale-105'
              >
                <FaHandshake className='text-3xl mx-auto mb-3 group-hover:animate-bounce' />
                <h3 className='font-bold text-lg mb-1'>
                  Secure Buying & Selling
                </h3>
                <p className='text-sm text-gray-200'>Trusted transactions</p>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className='bg-[#0e355e] py-16 px-6'>
          <div className='max-w-4xl mx-auto text-center'>
            <h2 className='text-3xl font-bold text-white mb-4'>
              Need a Specific Surgical Product?
            </h2>
            <p className='text-gray-300 text-lg mb-8 max-w-2xl mx-auto'>
              Our team can source new, factory-sealed surgical supplies from
              major manufacturers — even hard-to-find and discontinued items.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link
                href='/#contact'
                className='px-8 py-4 bg-[#07783e] text-white text-lg font-bold rounded-lg shadow-xl hover:bg-[#025e2d] transition-all duration-300 transform hover:scale-105'
              >
                Contact Us Today
              </Link>
              <Link
                href='/support'
                className='px-8 py-4 border-2 border-white text-white text-lg font-semibold rounded-lg hover:bg-white/10 transition-all duration-300'
              >
                Get Support
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
