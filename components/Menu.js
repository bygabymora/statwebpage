import { useState, useEffect } from "react";
import Link from "next/link";
import axios from 'axios';

const menuItems = [
  {
    title: "Manufacturers",
    subcategories: [] // Initially empty, it will be filled with manufacturers from the API
  },
  {
    title: "Products",
    subcategories: [
      {
        title: "Categories",
        links: [
          { name: "Surgical Supplies", href: "/products" },
          { name: "Instruments", href: "/products" },
        ]
    }   
    ]
  },
  {
    title: "About Us",
    subcategories: [
      {
        title: "Company",
        links: [
          { name: "About Us", href: "/about" },
          { name: "Contact Us", href: "/#contact" },
          { name: "Privacy Policy", href: "/privacy-policy" },
          { name: "Terms of Service", href: "/terms" }
        ]
      }
    ]
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
          { name: "Personalized Support", href: "/support" }
        ]
      }
    ]
  },
  {
    title: "News",
    subcategories: [
      {
        title: "Latest News",
        links: [
          { name: "News", href: "/news" },
          { name: "Blog", href: "/news" }
        ]
      }
    ]
  },
  {
    title: "Clearance",
    subcategories: []
  },
];

const Menu = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [manufacturers, setManufacturers] = useState([]);

  // Function to obtain the manufacturers from the API
  const fetchManufacturers = async () => {
    try {
      const { data } = await axios.get('/api/products');
      const manufacturersMap = new Map();

      data.forEach((product) => {
        const normalized = product.manufacturer?.trim().toLowerCase();
        if (!manufacturersMap.has(normalized)) {
          manufacturersMap.set(normalized, product.manufacturer?.trim());
        }
      });

      setManufacturers([...manufacturersMap.values()]);
    } catch (error) {
      console.error('Error al obtener manufacturers:', error);
    }
  };

  useEffect(() => {
    fetchManufacturers();
  }, []);

  // Update the menu with manufacturers
  const updatedMenuItems = menuItems.map(item => {
    if (item.title === "Manufacturers") {
      return {
        ...item,
        subcategories: [
          {
            title: "Manufacturers",
            links: manufacturers.map(manufacturer => ({ name: manufacturer, href: `/products?manufacturer=${encodeURIComponent(manufacturer)}` }))
          }
        ]
      };
    }
    return item;
  });

  return (
    <nav className="bg-gray-100 shadow-md sticky top-0 z-50">
      <ul className="flex justify-center space-x-6 py-3 text-[#144e8b] font-semibold">
        {updatedMenuItems.map((item, index) => (
          <li
            key={index}
            className="relative group cursor-pointer"
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <span className="px-4 py-2">{item.title}</span>
            {item.subcategories.length > 0 && (
              <div
                className={`absolute left-0 w-64 bg-white shadow-lg p-4 rounded-md transition-all duration-300 ${
                  activeIndex === index ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
              >
                {item.subcategories.map((sub, subIndex) => (
                  <div key={subIndex} className="mb-2">
                    <h4 className="font-bold text-gray-800">{sub.title}</h4>
                    <ul className="mt-1 space-y-1 text-gray-600">
                      {sub.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <Link href={link.href} className="hover:text-[#03793d]">
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