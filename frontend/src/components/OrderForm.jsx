import React, { useState } from 'react';
import { createOrder } from '../api';

const OrderForm = () => {
  const [orderData, setOrderData] = useState({
    customer_id: '',
    total_amount: '',
    status: 'pending',
    pickup_time: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderData({ ...orderData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newOrder = await createOrder(orderData);
      console.log('Order created:', newOrder);
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  return (
    <div>
      <h2>Create Order</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          name="customer_id"
          placeholder="Customer ID"
          value={orderData.customer_id}
          onChange={handleChange}
        />
        <input
          type="number"
          name="total_amount"
          placeholder="Total Amount"
          value={orderData.total_amount}
          onChange={handleChange}
        />
        <input
          type="datetime-local"
          name="pickup_time"
          value={orderData.pickup_time}
          onChange={handleChange}
        />
        <button type="submit">Create Order</button>
      </form>
    </div>
  );
};

export default OrderForm;
