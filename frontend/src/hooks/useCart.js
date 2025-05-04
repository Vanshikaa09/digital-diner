"use client"

import { useContext, useEffect } from "react"

import {CartContext} from "../contexts/CartContext"

/**
 * Custom hook for accessing and manipulating the shopping cart
 * Combines the context from CartContext.jsx with localStorage persistence
 */
export const useCart = () => {
  const context = useContext(CartContext)
  
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        // Reset the cart first to avoid duplication
        context.clearCart()
        // Add each item individually to ensure proper state management
        parsedCart.forEach(item => {
          // Add item once with initial quantity of 1
          context.addItem({
            id: item.menuItemId,
            name: item.name,
            price: item.price
          })
          // Then update to actual quantity (subtract 1 as we already added 1)
          if (item.quantity > 1) {
            context.updateQuantity(item.menuItemId, item.quantity)
          }
        })
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error)
      }
    }
  }, []) // Empty dependency array ensures this runs only once on mount

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(context.items))
  }, [context.items])

  return {
    // Return all properties and methods from CartContext
    ...context,
    
    // We can also add additional or override methods here if needed
    // For example, a helper method to get the total number of unique items
    uniqueItemCount: context.items.length,
    
    // Or a method to handle adding multiple items at once
    addItems: (items) => {
      items.forEach(item => context.addItem(item))
    }
  }
}

export default useCart// // useCart.js
// import { useContext } from 'react';
// import { CartContext } from '../contexts/CartContext';

// export const useCart = () => {
//   const context = useContext(CartContext);
  
//   if (context === undefined) {
//     throw new Error('useCart must be used within a CartProvider');
//   }
  
//   return context;
// };
