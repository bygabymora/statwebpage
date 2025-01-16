import React from 'react';
import { useContext } from 'react';
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

  const {
    cart: { cartItems },
  } = state;

  const removeItemHandler = (item) => {
    dispatch({ type: 'CART_REMOVE_ITEM', payload: item });
  };

  const updateCartHandler = async (item, qty) => {
    const quantity = Number(qty);
    const purchaseType = item.purchaseType;

    const { data } = await axios.get(`/api/products/${item._id}`);

    if (data.purchaseType === 'Each' && data.countInStock < quantity) {
      alert("Sorry, we don't have enough of that item in stock.");
    }
    if (data.purchaseType === 'Bulk' && data.countInStockBulk < quantity) {
      alert("Sorry, we don't have enough of that item in stock.");
    }
    dispatch({
      type: 'CART_UPDATE_ITEM', // Change to a new action type
      payload: { ...item, quantity, purchaseType },
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
                        className="flex items-center"
                      >
                        <Image
                          src={item.image}
                          alt={item.slug}
                          width={50}
                          height={50}
                        />
                        &nbsp;
                        {item.manufacturer}
                        <br />
                        &nbsp;{item.slug}
                      </Link>
                    </td>
                    <td className="p-5 text-right border">
                      {item.purchaseType === 'Bulk' ? 'Box' : item.purchaseType}
                    </td>
                    {item.purchaseType === 'Each' && (
                      <td className="p-5 text-right border">
                        <select
                          value={item.quantity}
                          onChange={(e) =>
                            updateCartHandler(item, e.target.value)
                          }
                        >
                          {[...Array(item.countInStock).keys()].map((x) => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}
                    {item.purchaseType === 'Bulk' && (
                      <td className="p-5 text-right">
                        <select
                          value={item.quantity}
                          onChange={(e) =>
                            updateCartHandler(item, e.target.value)
                          }
                        >
                          {[...Array(item.countInStockBulk).keys()].map((x) => (
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
                            updateCartHandler(item, e.target.value)
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
          <div className="card p-5 mb-4">
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
        </div>
      )}
    </Layout>
  );
}
export default dynamic(() => Promise.resolve(CartScreen), {
  ssr: false,
});
