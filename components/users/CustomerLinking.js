import React, { useState, useEffect } from "react";
import axios from "axios";
import { useModalContext } from "../context/ModalContext";

export default function CustomerLinking() {
  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, setUser, customer, setCustomer } = useModalContext();

  useEffect(() => {
    if (customer) {
      setKeyword(customer.companyName);
      setSuggestions([]);
    }
  }, [customer]);

  // Fetch suggestions on keyword change with debounce
  useEffect(() => {
    if (keyword?.trim() === "") {
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
    setKeyword(customer.companyName);
    const executiveMatch = customer.purchaseExecutive
      .map((exec) => exec.email)
      .includes(user.email);

    let updatedCustomer = customer;
    if (!executiveMatch) {
      const hasPrincipal = customer.purchaseExecutive.some((exec) => {
        return exec.principalPurchaseExecutive;
      });

      updatedCustomer = {
        ...customer,
        purchaseExecutive: [
          ...(customer.purchaseExecutive || []),
          {
            name: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: "Buyer",
            principalPurchaseExecutive: !hasPrincipal,
            wpId: user._id,
          },
        ],
      };
    } else {
      updatedCustomer = {
        ...customer,
        purchaseExecutive: updatedCustomer.purchaseExecutive.map((exec) => {
          if (exec.email === user.email) {
            return { ...exec, wpId: user._id };
          }
          return exec;
        }),
      };
    }
    setCustomer(updatedCustomer);
    setUser({ ...user, customerId: customer._id, customerData: customer });

    setSuggestions([]);
  };

  return (
    <div className='bg-white w-full mx-auto'>
      <h1 className='text-xl font-semibold mb-4 '>
        Link Customer - {user?.companyName} - {user?.companyEinCode}
      </h1>
      {console.log("customer", customer)}
      {/* Search Input */}
      <div className='relative mb-6'>
        <label htmlFor='customer-search' className='block text-sm font-medium '>
          Search Customer
        </label>
        <input
          autoComplete='off'
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
