import React, { useEffect, useState } from 'react';
import { fetchOrderItems } from '../api';

const OrderItem = ({ orderId }) => {
  const [orderItems, setOrderItems] = useState([]);

  useEffect(() => {
    const getOrderItems = async () => {
      const items = await fetchOrderItems(orderId);
      setOrderItems(items);
    };
    if (orderId) getOrderItems();
  }, [orderId]);

  return (
    <div>
      <h3>Order {orderId} Items</h3>
      <ul>
        {orderItems.map((item) => (
          <li key={item.id}>
            {item.item_name} x{item.quantity} - ${item.price}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderItem;
