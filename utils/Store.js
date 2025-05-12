import React, { createContext, useReducer } from "react";
import Cookies from "js-cookie";

export const Store = createContext();

const initialState = {
  cart: Cookies.get("cart")
    ? JSON.parse(Cookies.get("cart"))
    : { cartItems: [], shippingAddress: {} },
  cookieAccepted: Cookies.get("cookieAccepted") || false,
};

function reducer(state, action) {
  switch (action.type) {
    case "CART_ADD_ITEM": {
      const newItem = action.payload;
      const existingItem = state.cart.cartItems.find(
        (item) =>
          item._id === newItem._id &&
          item.typeOfPurchase === newItem.typeOfPurchase
      );
      if (existingItem) {
        if (existingItem.typeOfPurchase !== newItem.typeOfPurchase) {
          // Create a new line in the cart
          const cartItems = [...state.cart.cartItems, newItem];
          Cookies.set("cart", JSON.stringify({ ...state.cart, cartItems }));
          return { ...state, cart: { ...state.cart, cartItems } };
        } else {
          // Update the existing item's quantity
          const cartItems = state.cart.cartItems.map((item) =>
            item._id === existingItem._id ? newItem : item
          );
          Cookies.set("cart", JSON.stringify({ ...state.cart, cartItems }));
          return { ...state, cart: { ...state.cart, cartItems } };
        }
      } else {
        const cartItems = [...state.cart.cartItems, newItem];
        Cookies.set("cart", JSON.stringify({ ...state.cart, cartItems }));

        return { ...state, cart: { ...state.cart, cartItems } };
      }
    }

    case "CART_UPDATE_ITEM": {
      const updatedItem = action.payload;
      const cartItems = state.cart.cartItems.map((item) =>
        item._id === updatedItem._id &&
        item.typeOfPurchase === updatedItem.typeOfPurchase
          ? { ...item, quantity: updatedItem.quantity }
          : item
      );

      Cookies.set("cart", JSON.stringify({ ...state.cart, cartItems }));

      return { ...state, cart: { ...state.cart, cartItems } };
    }

    case "CART_REMOVE_ITEM": {
      const cartItems = state.cart.cartItems.filter(
        (item) =>
          item._id !== action.payload._id ||
          (item._id === action.payload._id &&
            item.typeOfPurchase !== action.payload.typeOfPurchase)
      );
      Cookies.set("cart", JSON.stringify({ ...state.cart, cartItems }));
      return { ...state, cart: { ...state.cart, cartItems } };
    }

    case "CART_RESET":
      return {
        ...state,
        cart: {
          cartItems: [],
          shippingAddress: { location: {} },
          paymentMethod: "",
        },
      };
    case "CART_CLEAR_ITEMS":
      return { ...state, cart: { ...state.cart, cartItems: [] } };

    case "ACCEPT_COOKIES":
      Cookies.set("cookieAccepted", true);
      return { ...state, cookieAccepted: true };

    default:
      return state;
  }
}

const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  return <Store.Provider value={value}>{children}</Store.Provider>;
};

export default React.memo(StoreProvider);
