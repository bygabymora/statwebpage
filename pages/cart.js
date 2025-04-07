import React from 'react';
import { useContext, useState } from 'react';
import { Store } from '../utils/Store';
import Layout from '../components/main/Layout';
import Link from 'next/link';
import Image from 'next/image';
import { BsTrash3 } from 'react-icons/bs';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import axios from 'axios';

function CartScreen() {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const [showModal, setShowModal] = useState(false);
  const [ProductToRemove, setProductToRemove] = useState(null);

  const {
    cart: { cartItems },
  } = state;

  const removeItemHandler = (item) => {
    setProductToRemove(item);
    setShowModal(true);
  };

  const confirmRemoveItem = () => {
    if (ProductToRemove) {
      dispatch({ type: 'CART_REMOVE_ITEM', payload: ProductToRemove });
    }
    setShowModal(false);
    setProductToRemove(null);
  };

  const updateCartHandler = async (item, qty) => {
    const quantity = Number(qty);
    console.log("Actualizando item:", item);
    console.log("Nueva cantidad:", quantity);

    const { data } = await axios.get(`/api/products/${item._id}`);

    if (data.purchaseType === 'Each' && item.each?.quickBooksQuantityOnHandProduction < quantity) {
      alert("Sorry, we don't have enough of that item in stock.");
      return;
    }
    if (data.purchaseType === 'Box' && item.box?.quickBooksQuantityOnHandProduction < quantity) {
      alert("Sorry, we don't have enough of that item in stock.");
      return;
    }
    if (data.purchaseType === 'Clearance' && item.countInStockClearance < quantity
    ) {
      alert("Sorry, we don't have enough of that item in stock.");
      return;
    }
    dispatch({
      type: 'CART_UPDATE_ITEM', // Change to a new action type
      payload: { ...item, quantity},
    });
  };
  return (
    <Layout title="Cart">
      <h1 className="mb-4 text-xl">Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <div>
          Cart is empty.{' '}
          <Link className="font-bold underline" href="/products">
            Go shopping!
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-4 md:gap-5 md:m-4">
          <div className=" md:col-span-3">
            <table className="table-auto min-w-full border-collapse border">
              <thead className="border">
                <tr>
                  <th className="px-5 border text-left">Product</th>
                  <th className="p-5 py-2 border text-right">Type</th>
                  <th className="p-5 py-2 border text-right">Quantity</th>
                  <th className="p-5 py-2 text-right">Price</th>
                  <th className="p-5"></th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.slug} className="border">
                    <td className="p-5 border">
                      <Link
                        href={`/products/${item.slug}`}
                        className="flex flex-col items-center"
                      >
                        <Image
                          src={item.image}
                          alt={item.slug}
                          width={50}
                          height={50}
                          className="mb-1 rounded-lg"
                        />
                        &nbsp;
                        {item.manufacturer}
                        <br />
                        &nbsp;{item.name}
                      </Link>
                    </td>
                    <td className="p-5 text-right border">
                      {item.purchaseType === 'Box' ? 'Box' : item.purchaseType}
                    </td>
                    {item.purchaseType === 'Each' && (
                      <td className="p-5 text-right border">
                        <select
                          value={item.quantity}
                          onChange={(e) =>
                            updateCartHandler(item, Number(e.target.value))
                          }
                        >
                          {[...Array(item.each?.quickBooksQuantityOnHandProduction).keys()].map((x) => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}
                    {item.purchaseType === 'Box' && (
                      <td className="p-5 text-right">
                        <select
                          value={item.quantity}
                          onChange={(e) =>
                            updateCartHandler(item, Number(e.target.value))
                          }
                        >
                          {[...Array(item.box?.quickBooksQuantityOnHandProduction).keys()].map((x) => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}
                    {item.purchaseType === 'Clearance' && (
                      <td className="p-5 text-right">
                        <select
                          value={item.quantity}
                          onChange={(e) =>
                            updateCartHandler(item, Number(e.target.value))
                          }
                        >
                          {[...Array(item.countInStockClearance).keys()].map(
                            (x) => (
                              <option key={x + 1} value={x + 1}>
                                {x + 1}
                              </option>
                            )
                          )}
                        </select>
                      </td>
                    )}
                    <td className="p-5 text-right border">${item.price}</td>
                    <td className="p-5 text-center">
                      <button onClick={() => removeItemHandler(item)}>
                        <BsTrash3 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card p-5 mb-4 max-h-60 overflow-y-auto">
            <ul>
              <li>
                <div className="pb-3 font-xl">
                  Subtotal ({cartItems.reduce((a, c) => a + c.quantity, 0)}){' '}
                  {''}: $
                  {cartItems.reduce((a, c) => a + c.quantity * c.price, 0)}
                </div>
              </li>
              <li>
                <button
                  onClick={() => router.push('Login?redirect=/shipping')}
                  className="primary-button w-full"
                >
                  Checkout
                </button>
              </li>
            </ul>
          </div>
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
                <h2 className="font-bold text-lg">Confirm Deletion</h2>
                <p className="text-[#788b9b]">Are you sure you want to remove this product?</p>
                <div className="flex justify-center gap-4 mt-4">
                  <button 
                    className="px-4 py-2 bg-[#144e8b] text-white rounded-lg hover:bg-[#788b9b] transition"
                    onClick={confirmRemoveItem}
                  >
                    Delete
                  </button>
                  <button 
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
export default dynamic(() => Promise.resolve(CartScreen), {
  ssr: false,
});
