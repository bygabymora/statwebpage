import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import axios from "axios";

const menuItems = [
  {
    title: <Link href='/'>Home</Link>,
  },
  {
    title: "Manufacturers",
    subcategories: [], // Initially empty, it will be filled with manufacturers from the API
  },
  {
    title: <Link href='/products'>Products</Link>,
  },
  {
    title: <Link href='/about'>About Us</Link>,
    subcategories: [
      {
        title: "Company",
        links: [
          { name: "About Us", href: "/about" },
          { name: "Contact Us", href: "/#contact" },
          { name: "Privacy Policy", href: "/privacy-policy" },
          { name: "Terms of Service", href: "/terms-of-use" },
          { name: "FAQs", href: "/faqs" },
        ],
      },
    ],
  },
  {
    title: "Our Key Benefits",
    subcategories: [
      {
        title: "Benefits",
        links: [
          { name: "Guaranteed Savings", href: "/savings" },
          { name: "Available Stock", href: "/products" },
          { name: "Secure Buying & Selling", href: "/selling" },
          { name: "Support", href: "/support" },
        ],
      },
    ],
  },
  {
    title: <Link href='/news'>News</Link>,
  },
];

const Menu = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [manufacturers, setManufacturers] = useState([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const router = useRouter();

  const fetchManufacturers = async () => {
    try {
      const { data } = await axios.get(`/api/products`);
      const manufacturersSet = new Set();

      data.forEach((product) => {
        if (product.manufacturer) {
          manufacturersSet.add(product.manufacturer.trim());
        }
      });
      const manufacturersArray = [...manufacturersSet];
      manufacturersArray.sort((a, b) => a.localeCompare(b)); // Alphabetic order
      setManufacturers(manufacturersArray);
    } catch (error) {
      console.error(
        "Error fetching manufacturers:",
        error.response ? error.response.data : error.message
      );
    }
  };

  useEffect(() => {
    fetchManufacturers();
  }, []);

  const handleManufacturerClick = (manufacturer) => {
    setSelectedManufacturer(manufacturer);
    router.push(`/products?manufacturer=${encodeURIComponent(manufacturer)}`);
  };

  const updatedMenuItems = menuItems.map((item) => {
    if (
      item.title === "Manufacturers" ||
      (typeof item.title === "object" &&
        item.title.props?.children === "Manufacturers")
    ) {
      return {
        ...item,
        title: (
          <span
            onClick={(e) => {
              e.preventDefault();
              router.push("/products");
            }}
            className='cursor-pointer hover:text-[#07783e]'
          >
            Manufacturers
          </span>
        ),
        subcategories: [
          {
            title: "Manufacturers",
            links: manufacturers
              .filter((m) => typeof m === "string" && m.trim() !== "")
              .map((manufacturer) => ({
                name: manufacturer,
                href: `/products?manufacturer=${encodeURIComponent(
                  manufacturer
                )}`,
                onClick: (e) => {
                  e.preventDefault();
                  handleManufacturerClick(manufacturer);
                },
              })),
          },
        ],
      };
    }
    return item;
  });

  return (
    <nav className='bg-gray-100 shadow w-full hidden md:block'>
      <ul className='flex justify-center space-x-6 py-1 text-[#0e355e] font-medium text-sm lg:text-base'>
        {updatedMenuItems.map((item, index) => (
          <li
            key={index}
            className='relative group'
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <span className='px-3 py-1 inline-block hover:text-[#07783e] transition-colors duration-200'>
              {item.title}
            </span>

            {item.subcategories && item.subcategories?.length > 0 && (
              <div
                className={`custom-scrollbar absolute left-1/2 -translate-x-1/2 top-full w-80 max-h-80 overflow-y-auto 
                bg-gray-100 shadow-2xl rounded-lg border border-gray-200 transition-all duration-200 z-50 ${
                  activeIndex === index
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 translate-y-2 pointer-events-none"
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {item.subcategories.map((sub, subIndex) => (
                  <div
                    key={subIndex}
                    className='px-6 py-4 border-b last:border-b-0'
                  >
                    <h4 className='font-semibold text-base text-[#0e355e] mb-2'>
                      {sub.title}
                    </h4>
                    <ul className='space-y-2'>
                      {sub.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <Link
                            title={link.name}
                            href={link.href}
                            onClick={link.onClick} // Call the onClick function
                            className={`block text-gray-700 text-base px-3 py-2 rounded-md hover:bg-gray-200 transition-all ${
                              selectedManufacturer === link.name
                                ? "bg-slate-200"
                                : ""
                            }`}
                          >
                            {link.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Menu;
