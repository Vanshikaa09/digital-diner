import axios from "axios"

// const API_URL = "http://localhost:3000/api"

const API_URL ="https://digital-diner-1-wjrk.onrender.com/"


// Menu Items
export const fetchMenu = async () => {
  try {
    console.log("Fetching menu from API...")
    const response = await axios.get(`${API_URL}/menu`)
    console.log("Menu API response:", response.data)
    return response.data
  } catch (error) {
    console.error("Error fetching menu:", error)
    // Return mock data for development if API is not available
    return [
      {
        id: 1,
        name: "Veggie Burger",
        description: "Fresh veggie patty with lettuce, tomato, and special sauce",
        price: 499,
        imageUrl: "https://via.placeholder.com/300x200?text=Veggie+Burger",
      },
      {
        id: 2,
        name: "Chicken Pizza",
        description: "Homemade pizza with grilled chicken, bell peppers, and mozzarella",
        price: 799,
        imageUrl: "https://via.placeholder.com/300x200?text=Chicken+Pizza",
      },
      {
        id: 3,
        name: "Chocolate Milkshake",
        description: "Creamy chocolate milkshake with whipped cream",
        price: 249,
        imageUrl: "https://via.placeholder.com/300x200?text=Chocolate+Milkshake",
      },
      {
        id: 4,
        name: "Fish & Chips",
        description: "Crispy fried fish fillet with seasoned French fries",
        price: 599,
        imageUrl: "https://via.placeholder.com/300x200?text=Fish+And+Chips",
      },
      {
        id: 5,
        name: "Caesar Salad",
        description: "Fresh romaine lettuce with Caesar dressing, croutons, and parmesan",
        price: 349,
        imageUrl: "https://via.placeholder.com/300x200?text=Caesar+Salad",
      },
      {
        id: 6,
        name: "Veg Noodles",
        description: "Stir-fried noodles with mixed vegetables in soy sauce",
        price: 399,
        imageUrl: "https://via.placeholder.com/300x200?text=Veg+Noodles",
      },
    ]
  }
}

// Orders
export const createOrder = async (orderData) => {
  try {
    console.log("Creating order with data:", orderData)
    const response = await axios.post(`${API_URL}/orders`, orderData)
    console.log("Create order response:", response.data)
    return response.data
  } catch (error) {
    console.error("Error creating order:", error.response?.data || error.message)
    // Mock response for development
    return {
      id: Math.floor(Math.random() * 10000),
      ...orderData,
      created_at: new Date().toISOString(),
      status: "pending",
    }
  }
}

// Function to fetch all orders
export const fetchOrders = async () => {
  try {
    console.log("Fetching orders from API...")
    const response = await axios.get(`${API_URL}/orders`)
    console.log("Orders API response:", response.data)

    // Ensure total_amount is a number
    const orders = response.data.map((order) => ({
      ...order,
      total_amount: order.total_amount !== null && order.total_amount !== undefined ? Number(order.total_amount) : 0,
    }))

    return orders
  } catch (error) {
    console.error("Error fetching orders:", error.response?.data || error.message)
    // Mock data for development
    return [
      {
        id: 1001,
        customer_name: "John Doe",
        customer_email: "john@example.com",
        customer_phone: "555-123-4567",
        total_amount: 1048,
        status: "completed",
        items: [
          { name: "Veggie Burger", quantity: 1, price: 499 },
          { name: "Chocolate Milkshake", quantity: 1, price: 249 },
          { name: "Caesar Salad", quantity: 1, price: 300 },
        ],
        created_at: "2025-04-30T10:45:00Z",
      },
      {
        id: 1002,
        customer_name: "Jane Smith",
        customer_email: "jane@example.com",
        customer_phone: "555-987-6543",
        total_amount: 799,
        status: "pending",
        items: [{ name: "Chicken Pizza", quantity: 1, price: 799 }],
        created_at: "2025-04-30T11:15:00Z",
      },
    ]
  }
}

export const fetchUserOrders = async (phone) => {
  try {
    console.log("Fetching user orders from API for phone:", phone);
    // Ensure we only query with phone if it's provided
    const url = phone ? `${API_URL}/orders?phone=${encodeURIComponent(phone)}` : `${API_URL}/orders`;
    const response = await axios.get(url);
    console.log("User Orders API response:", response.data);

    // Ensure total_amount is a number
    const orders = response.data.map((order) => ({
      ...order,
      total_amount: order.total_amount !== null && order.total_amount !== undefined ? Number(order.total_amount) : 0,
    }));

    // Filter by phone number if provided (in case backend doesn't filter)
    if (phone && phone.trim() !== '') {
      return orders.filter(order => order.customer_phone === phone);
    }

    return orders;
  } catch (error) {
    console.error("Error fetching user orders:", error.response?.data || error.message);
    
    // If API call fails, return mock data filtered by phone number
    const mockOrders = [
      {
        id: 1001,
        customer_name: "John Doe",
        customer_email: "john@example.com",
        customer_phone: "555-123-4567",
        total_amount: 1048,
        status: "completed",
        items: [
          { name: "Veggie Burger", quantity: 1, price: 499 },
          { name: "Chocolate Milkshake", quantity: 1, price: 249 },
          { name: "Caesar Salad", quantity: 1, price: 300 },
        ],
        created_at: "2025-04-30T10:45:00Z",
      },
      {
        id: 1002,
        customer_name: "Jane Smith",
        customer_email: "jane@example.com",
        customer_phone: "555-987-6543",
        total_amount: 799,
        status: "pending",
        items: [{ name: "Chicken Pizza", quantity: 1, price: 799 }],
        created_at: "2025-04-30T11:15:00Z",
      },
    ];
    
    // If phone is provided, filter the mock orders by phone number
    if (phone && phone.trim() !== '') {
      return mockOrders.filter(order => order.customer_phone === phone);
    }
    
    return mockOrders;
  }
}

// Function to fetch order items
export const fetchOrderItems = async (orderId) => {
  try {
    console.log("Fetching order items from API for order ID:", orderId);
    const response = await axios.get(`${API_URL}/order-items/${orderId}`);
    console.log("Order items API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching order items:", error.response?.data || error.message);
    return []; // Return empty array when API is unavailable
  }
}

export const fetchMenuItem = async (itemId) => {
  try {
    console.log("Fetching menu item with ID:", itemId)
    const response = await axios.get(`${API_URL}/menu/${itemId}`);
    console.log("Menu item API response:", response.data)
    return response.data
  } catch (error) {
    console.error("Error fetching menu item:", error)
    
    // Return mock data for development if API is not available
    // First try to get the item from the mock menu data
    const mockMenu = [
      {
        id: 1,
        name: "Veggie Burger",
        description: "Fresh veggie patty with lettuce, tomato, and special sauce",
        price: 499,
        imageUrl: "https://via.placeholder.com/300x200?text=Veggie+Burger",
        category: "Main Course",
        ingredients: ["Veggie patty", "Lettuce", "Tomato", "Special sauce", "Whole wheat bun"],
        allergens: ["Gluten", "Soy"],
        nutritionalInfo: {
          calories: 450,
          protein: "15g",
          carbs: "48g",
          fat: "22g"
        }
      },
      {
        id: 2,
        name: "Chicken Pizza",
        description: "Homemade pizza with grilled chicken, bell peppers, and mozzarella",
        price: 799,
        imageUrl: "https://via.placeholder.com/300x200?text=Chicken+Pizza",
        category: "Main Course",
        ingredients: ["Pizza dough", "Tomato sauce", "Grilled chicken", "Bell peppers", "Mozzarella"],
        allergens: ["Gluten", "Dairy"],
        nutritionalInfo: {
          calories: 720,
          protein: "32g",
          carbs: "68g",
          fat: "36g"
        }
      },
      {
        id: 3,
        name: "Chocolate Milkshake",
        description: "Creamy chocolate milkshake with whipped cream",
        price: 249,
        imageUrl: "https://via.placeholder.com/300x200?text=Chocolate+Milkshake",
        category: "Beverages",
        ingredients: ["Milk", "Chocolate syrup", "Vanilla ice cream", "Whipped cream"],
        allergens: ["Dairy"],
        nutritionalInfo: {
          calories: 520,
          protein: "8g",
          carbs: "72g",
          fat: "22g"
        }
      },
      {
        id: 4,
        name: "Fish & Chips",
        description: "Crispy fried fish fillet with seasoned French fries",
        price: 599,
        imageUrl: "https://via.placeholder.com/300x200?text=Fish+And+Chips",
        category: "Main Course",
        ingredients: ["Fish fillet", "Batter", "Potatoes", "Salt", "Vinegar"],
        allergens: ["Fish", "Gluten"],
        nutritionalInfo: {
          calories: 680,
          protein: "24g",
          carbs: "76g",
          fat: "32g"
        }
      },
      {
        id: 5,
        name: "Caesar Salad",
        description: "Fresh romaine lettuce with Caesar dressing, croutons, and parmesan",
        price: 349,
        imageUrl: "https://via.placeholder.com/300x200?text=Caesar+Salad",
        category: "Appetizers",
        ingredients: ["Romaine lettuce", "Caesar dressing", "Croutons", "Parmesan cheese"],
        allergens: ["Dairy", "Gluten", "Eggs"],
        nutritionalInfo: {
          calories: 320,
          protein: "12g",
          carbs: "18g",
          fat: "24g"
        }
      },
      {
        id: 6,
        name: "Veg Noodles",
        description: "Stir-fried noodles with mixed vegetables in soy sauce",
        price: 399,
        imageUrl: "https://via.placeholder.com/300x200?text=Veg+Noodles",
        category: "Main Course",
        ingredients: ["Noodles", "Mixed vegetables", "Soy sauce", "Garlic", "Ginger"],
        allergens: ["Gluten", "Soy"],
        nutritionalInfo: {
          calories: 420,
          protein: "10g",
          carbs: "68g",
          fat: "14g"
        }
      },
    ]
    
    const item = mockMenu.find(item => item.id == itemId)
    
    if (item) {
      return item
    }
    
    // If item not found in mock data, throw error
    throw new Error("Menu item not found")
  }
}


