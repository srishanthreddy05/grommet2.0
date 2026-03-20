"use client";

import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import type { CartItem, Product } from "@/types";
import { getProductsByIds, placeOrder } from "@/lib/db";
import { getSellingPrice } from "@/lib/pricing";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: { product: Product; quantity: number } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QTY"; payload: { productId: string; quantity: number } }
  | { type: "SYNC_ITEMS"; payload: CartItem[] }
  | { type: "CLEAR" }
  | { type: "TOGGLE_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" };

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  placeOrderFromCart: (input: {
    userId: string;
    name: string;
    email: string;
    mobile: string;
    status?: "pending" | "confirmed" | "shipped" | "delivered";
  }) => Promise<string>;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.findIndex(
        (i) => i.product.id === action.payload.product.id
      );
      const availableStock = Math.max(0, action.payload.product.stock || 0);
      const addQty = Math.max(1, Math.min(action.payload.quantity, availableStock || 1));
      if (existing >= 0) {
        const updated = [...state.items];
        const nextQty = updated[existing].quantity + addQty;
        updated[existing].quantity = availableStock > 0 ? Math.min(nextQty, availableStock) : nextQty;
        return { ...state, items: updated };
      }
      return {
        ...state,
        items: [
          ...state.items,
          {
            product: action.payload.product,
            quantity: addQty,
          },
        ],
      };
    }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((i) => i.product.id !== action.payload) };
    case "UPDATE_QTY":
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.id === action.payload.productId
            ? {
                ...i,
                quantity: Math.max(1, Math.min(action.payload.quantity, Math.max(1, i.product.stock || 1))),
              }
            : i
        ),
      };
    case "SYNC_ITEMS":
      return {
        ...state,
        items: action.payload,
      };
    case "CLEAR":
      return { ...state, items: [] };
    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };
    case "OPEN_CART":
      return { ...state, isOpen: true };
    case "CLOSE_CART":
      return { ...state, isOpen: false };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false });

  // Persist cart to localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      const parsed = JSON.parse(saved);
      parsed.forEach((item: CartItem) => {
        dispatch({ type: "ADD_ITEM", payload: { product: item.product, quantity: item.quantity } });
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state.items));
  }, [state.items]);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce((sum, i) => sum + getSellingPrice(i.product) * i.quantity, 0);

  const placeOrderFromCart = async (input: {
    userId: string;
    name: string;
    email: string;
    mobile: string;
    status?: "pending" | "confirmed" | "shipped" | "delivered";
  }) => {
    if (!state.items.length) {
      throw new Error("Cart is empty");
    }

    const productMap = await getProductsByIds(state.items.map((item) => item.product.id));
    const liveItems: CartItem[] = [];
    const changedItems: string[] = [];

    for (const item of state.items) {
      const liveProduct = productMap[item.product.id];
      if (!liveProduct) {
        changedItems.push(item.product.name || "item");
        continue;
      }

      if (liveProduct.stock < item.quantity) {
        changedItems.push(liveProduct.name);

        if (liveProduct.stock > 0) {
          liveItems.push({ product: liveProduct, quantity: liveProduct.stock });
        }
        continue;
      }

      liveItems.push({ product: liveProduct, quantity: item.quantity });
    }

    // Keep cart in sync with live database values (stock, price, image, etc.).
    dispatch({ type: "SYNC_ITEMS", payload: liveItems });

    if (!liveItems.length) {
      throw new Error("All cart items are out of stock. Please add items again.");
    }

    if (changedItems.length > 0) {
      const unique = Array.from(new Set(changedItems));
      throw new Error(`Stock changed for ${unique.join(", ")}. Cart was updated. Please review and place order again.`);
    }

    const orderId = await placeOrder(
      input.userId,
      input.name,
      input.email,
      input.mobile,
      liveItems,
      input.status || "confirmed"
    );
    dispatch({ type: "CLEAR" });
    dispatch({ type: "CLOSE_CART" });
    return orderId;
  };

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        totalItems,
        totalPrice,
        addItem: (product, quantity = 1) =>
          dispatch({ type: "ADD_ITEM", payload: { product, quantity } }),
        removeItem: (id) => dispatch({ type: "REMOVE_ITEM", payload: id }),
        updateQuantity: (id, qty) =>
          dispatch({ type: "UPDATE_QTY", payload: { productId: id, quantity: qty } }),
        clearCart: () => dispatch({ type: "CLEAR" }),
        toggleCart: () => dispatch({ type: "TOGGLE_CART" }),
        openCart: () => dispatch({ type: "OPEN_CART" }),
        closeCart: () => dispatch({ type: "CLOSE_CART" }),
        placeOrderFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
