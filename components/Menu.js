import { useState, useEffect } from "react";
import Link from "next/link";
import axios from 'axios';

const menuItems = [
  { 
    title: "Home",
    subcategories: [
      {
        title: "Home",
        links: [
          { name: "Home", href: "/" }
        ]
      }
    ]
  },
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
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchManufacturers = async () => {
    try {
      const { data } = await axios.get('/api/products');
      const manufacturersSet = new Set();

      data.forEach(product => {
        if (product.manufacturer) {
          manufacturersSet.add(product.manufacturer.trim());
        }
      });
      setManufacturers([...manufacturersSet]);
    } catch (error) {
      console.error('Error fetching manufacturers:', error);
    }
  };

  useEffect(() => {
    fetchManufacturers();
  }, []);

  if (isSmallScreen) return null;

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
      <div className="border-b border-gray-300"></div>  
      <ul className="flex justify-center space-x-6 py-4 text-[#144e8b] font-semibold">
        {updatedMenuItems.map((item, index) => (
          <li
            key={index}
            className="relative group cursor-pointer"
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <span className="px-4 py-2 hover:text-[#03793d] transition-colors duration-200">{item.title}</span>
            {item.subcategories.length > 0 && (
              <div
                className={`absolute left-0 mt-2 w-64 max-h-64 overflow-y-auto bg-white shadow-lg rounded-lg transform transition-all duration-300 ${
                  activeIndex === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
                }`}
              >
                {item.subcategories.map((sub, subIndex) => (
                  <div key={subIndex} className="p-3">
                    <h4 className="font-bold text-[#144e8b] border-b pb-1 mb-2">{sub.title}</h4>
                    <ul className="space-y-1 text-gray-600">
                      {sub.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <Link href={link.href} className="block px-3 py-1 hover:bg-gray-100 rounded transition-all duration-200">
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