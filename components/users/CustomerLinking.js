import React, { useState, useEffect } from "react";
import axios from "axios";

export default function CustomerLinking({ wpUser, wpCustomer, fetchData }) {
  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatedCustomer, setUpdatedCustomer] = useState(null);
  const [updatedWpUser, setUpdatedWpUser] = useState(null);

  useEffect(() => {
    if (wpCustomer) {
      setKeyword(wpCustomer.companyName);
      setSuggestions([]);
    }
  }, [wpCustomer]);

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

  const handleSelect = async (customer) => {
    setKeyword(customer.companyName);
    const executiveMatch = customer.purchaseExecutive
      .map((exec) => exec.email)
      .includes(wpUser.email);

    let newUpdatedCustomer = customer;

    if (!executiveMatch) {
      const hasPrincipal = customer?.purchaseExecutive?.some((exec) => {
        return exec.principalPurchaseExecutive;
      });

      newUpdatedCustomer = {
        ...customer,
        purchaseExecutive: [
          ...customer.purchaseExecutive,
          {
            name: wpUser.firstName,
            lastName: wpUser.lastName,
            email: wpUser.email,
            role: "Buyer",
            principalPurchaseExecutive: !hasPrincipal,
            wpId: wpUser._id,
          },
        ],
      };
      setUpdatedCustomer(newUpdatedCustomer);
    } else {
      newUpdatedCustomer = {
        ...customer,
        purchaseExecutive: newUpdatedCustomer?.purchaseExecutive?.map(
          (exec) => {
            if (exec.email === wpUser.email) {
              return { ...exec, wpId: wpUser._id };
            }
            return exec;
          }
        ),
      };
      setUpdatedCustomer(newUpdatedCustomer);
    }
    const newUpdatedWpUser = {
      ...wpUser,
      customerId: customer._id,
      customerData: newUpdatedCustomer,
    };

    setUpdatedWpUser(newUpdatedWpUser);

    setSuggestions([]);
  };

  const handleLinkCustomer = async () => {
    await axios.put(`/api/admin/users/${wpUser._id}`, {
      user: updatedWpUser,
      customer: updatedCustomer,
    });

    await fetchData();
  };

  return (
    <div className='bg-white w-full mx-auto'>
      <h1 className='text-xl font-semibold mb-4 '>
        Link Customer - {wpUser?.companyName} - {wpUser?.companyEinCode}
      </h1>
      {console.log("customer", wpCustomer)}
      {console.log("updatedCustomer", updatedCustomer)}
      {console.log("updatedWpUser", updatedWpUser)}
      {/* Search Input */}
      <div>
        <div className='relative mb-6'>
          <label
            htmlFor='customer-search'
            className='block text-sm font-medium '
          >
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
        {updatedCustomer && (
          <div className='mb-4'>
            <h3 className='text-lg font-medium mb-3'>Selected Customer</h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='mb-4'>
                <label className='block font-medium '>Company Name</label>
                <div>{updatedCustomer.companyName}</div>
              </div>
              <div className='mb-4'>
                <label className='block font-medium '>Lead Stage</label>
                <div>{updatedCustomer.leadStage}</div>
              </div>
              <div className='mb-4'>
                <label className='block font-medium '>Account Owner</label>
                <div>{updatedCustomer.user?.name}</div>
              </div>
              <div className='mb-4'>
                <label className='block font-medium '>
                  Account Owner Email
                </label>
                <div>{updatedCustomer.user?.email}</div>
              </div>
            </div>
            {updatedCustomer?.purchaseExecutive?.length > 0 && (
              <div className='mb-4'>
                <label className='block font-medium '>Purchase Executive</label>
                <div>
                  {updatedCustomer.purchaseExecutive.map((exec) => (
                    <div key={exec.email}>
                      {exec.name} {exec.lastName} ({exec.email})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <div>
          <button
            disabled={!updatedCustomer}
            onClick={handleLinkCustomer}
            className='primary-button'
          >
            Link Customer
          </button>
        </div>
      </div>

      {/* Selected Customer Editable Form */}
      {wpCustomer && (
        <div>
          <h3 className='text-lg font-medium  mb-3'>Customer Info</h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='mb-4'>
              <label className='block font-medium '>Company Name</label>
              <div>{wpCustomer.companyName}</div>
            </div>
            <div className='mb-4'>
              <label className='block font-medium '>Account Owner</label>
              <div>{wpCustomer.user?.name}</div>
            </div>
            <div className='mb-4'>
              <label className='block  font-medium '>Account Owner Email</label>
              <div>{wpCustomer.user?.email}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
