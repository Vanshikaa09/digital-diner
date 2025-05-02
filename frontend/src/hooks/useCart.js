// useCart.js
import { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';

export const useCart = () => {
  const context = useContext(CartContext);
  
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
};// // useCart.js
// import { useState, useEffect } from 'react';

// export const useCart = () => {
//   const [items, setItems] = useState(() => {
//     // Load cart from localStorage on initialization
//     const savedCart = localStorage.getItem('cart');
//     return savedCart ? JSON.parse(savedCart) : [];
//   });

//   // Save cart to localStorage whenever it changes
//   useEffect(() => {
//     localStorage.setItem('cart', JSON.stringify(items));
//   }, [items]);

//   // Calculate total price
//   const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
//   // Calculate total items
//   const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

//   // Add item to cart
//   const addItem = (menuItem) => {
//     setItems(prevItems => {
//       // Check if item already exists in cart
//       const existingItemIndex = prevItems.findIndex(item => item.menuItemId === menuItem.id);
      
//       if (existingItemIndex >= 0) {
//         // If item exists, create a new array with the updated quantity
//         const newItems = [...prevItems];
//         newItems[existingItemIndex] = {
//           ...newItems[existingItemIndex],
//           quantity: newItems[existingItemIndex].quantity + 1
//         };
//         return newItems;
//       } else {
//         // If item doesn't exist, add it to the cart with correct price formatting
//         return [...prevItems, {
//           menuItemId: menuItem.id,
//           name: menuItem.name,
//           price: menuItem.price / 100, // Convert price from cents to rupees for display
//           quantity: 1
//         }];
//       }
//     });
//   };

//   // Update item quantity
//   const updateQuantity = (menuItemId, quantity) => {
//     setItems(prevItems => 
//       prevItems.map(item => 
//         item.menuItemId === menuItemId ? { ...item, quantity } : item
//       )
//     );
//   };

//   // Remove item from cart
//   const removeItem = (menuItemId) => {
//     setItems(prevItems => prevItems.filter(item => item.menuItemId !== menuItemId));
//   };

//   // Clear cart
//   const clearCart = () => {
//     setItems([]);
//   };

//   return {
//     items,
//     addItem,
//     updateQuantity,
//     removeItem,
//     clearCart,
//     totalPrice,
//     totalItems
//   };
// };