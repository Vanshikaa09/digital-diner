"use client"

import { createContext, useCallback, useMemo, useReducer } from "react"

const initialState = {
  items: [],
}

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      // Check if the item already exists in the cart by comparing the actual item ID
      const existingItemIndex = state.items.findIndex((item) => item.menuItemId === action.payload.id)

      if (existingItemIndex > -1) {
        // Item exists, increment quantity
        const updatedItems = [...state.items]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
        }
        return { ...state, items: updatedItems }
      } else {
        // Add new item - make sure we're using the correct ID from the payload
        const newItem = {
          menuItemId: action.payload.id,
          name: action.payload.name,
          price: action.payload.price,
          quantity: 1,
        }
        console.log("Adding new item to cart:", newItem)
        return { ...state, items: [...state.items, newItem] }
      }
    }
    case "REMOVE_ITEM": {
      const updatedItems = state.items.filter((item) => item.menuItemId !== action.payload.menuItemId)
      return { ...state, items: updatedItems }
    }
    case "UPDATE_QUANTITY": {
      const { menuItemId, quantity } = action.payload
      if (quantity <= 0) {
        // Remove item if quantity is zero or less
        return cartReducer(state, { type: "REMOVE_ITEM", payload: { menuItemId } })
      }
      const updatedItems = state.items.map((item) => (item.menuItemId === menuItemId ? { ...item, quantity } : item))
      return { ...state, items: updatedItems }
    }
    case "CLEAR_CART":
      return initialState
    default:
      return state
  }
}

export const CartContext = createContext(undefined)

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  const addItem = useCallback((item) => {
    dispatch({ type: "ADD_ITEM", payload: item })
  }, [])

  const removeItem = useCallback((menuItemId) => {
    dispatch({ type: "REMOVE_ITEM", payload: { menuItemId } })
  }, [])

  const updateQuantity = useCallback((menuItemId, quantity) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { menuItemId, quantity } })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" })
  }, [])

  const totalPrice = useMemo(() => {
    return state.items.reduce((total, item) => total + item.price * item.quantity, 0)
  }, [state.items])

  const totalItems = useMemo(() => {
    return state.items.reduce((total, item) => total + item.quantity, 0)
  }, [state.items])

  const value = useMemo(
    () => ({
      ...state,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalPrice,
      totalItems,
    }),
    [state, addItem, removeItem, updateQuantity, clearCart, totalPrice, totalItems],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}


