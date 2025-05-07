import React, { useState, useEffect } from "react";
import axios from "axios";

export default function CustomerLinking({
  user,
  setUser,
  setCustomer,
  customer,
}) {
  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch suggestions on keyword change with debounce
  useEffect(() => {
    if (keyword.trim() === "") {
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(() => fetchSuggestions(), 300);
    return () => clearTimeout(timeout);
  }, [keyword]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/customer/searchCustomers", {
        params: { keyword, limit: 10 },
      });
      setSuggestions(data.data);
    } catch (err) {
      console.error("Error fetching customers", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (customer) => {
    setCustomer(customer);
    setUser({ ...user, customerId: customer._id, customerData: customer });
    setKeyword(customer.companyName);
    setSuggestions([]);
  };

  return (
    <div className='bg-white w-full mx-auto'>
      <h1 className='text-xl font-semibold mb-4 '>
        Link Customer - {user?.companyName}
      </h1>

      {/* Search Input */}
      <div className='relative mb-6'>
        <label htmlFor='customer-search' className='block text-sm font-medium '>
          Search Customer
        </label>
        <input
          id='customer-search'
          type='text'
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder='Type name or ID...'
          className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500'
        />

        {loading && (
          <div className='absolute top-full mt-1 left-0 text-sm text-gray-500'>
            Loading...
          </div>
        )}

        {suggestions.length > 0 && (
          <ul className='absolute z-10 top-full mt-1 w-full bg-white border border-gray-300 rounded max-h-60 overflow-y-auto shadow-lg'>
            {suggestions.map((c) => (
              <li
                key={c._id}
                onClick={() => handleSelect(c)}
                className='px-3 py-2 hover:bg-blue-100 cursor-pointer'
              >
                {c.companyName} {c.aka && `(${c.aka})`}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Selected Customer Editable Form */}
      {customer && (
        <div>
          <h3 className='text-lg font-medium  mb-3'>Customer Info</h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='mb-4'>
              <label className='block font-medium '>Company Name</label>
              <div>{customer.companyName}</div>
            </div>
            <div className='mb-4'>
              <label className='block font-medium '>Account Owner</label>
              <div>{customer.user?.name}</div>
            </div>
            <div className='mb-4'>
              <label className='block  font-medium '>Account Owner Email</label>
              <div>{customer.user?.email}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
