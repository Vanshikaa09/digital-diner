"use client"

import { Route, Routes } from "react-router-dom"
import { Box, Heading, Container, Flex, Spacer, Button } from "@chakra-ui/react"
import { Link as RouterLink } from "react-router-dom"
import Menu from "./components/Menu"
import OrderItem from "./components/OrderItem"
import Cart from "./components/Cart"
import Checkout from "./components/Checkout"
import CartIcon from "./components/CartIcon"
import AdminLogin from "./components/admin/AdminLogin"
import AdminDashboard from "./components/admin/AdminDashboard"
import { useEffect, useState } from "react"
import Order from "./components/order"

const App = () => {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check if user is admin
    const user = JSON.parse(localStorage.getItem("user"))
    setIsAdmin(user?.role === "admin")
  }, [])

  return (
    <Box>
      <Box as="header" bg="blue.500" color="white" py={4} px={6}>
        <Container maxW="container.xl">
          <Flex align="center">
            <Heading as="h1" size="lg">
              Digital Diner
            </Heading>
            <Spacer />
            <Flex gap={4} align="center">
              <Button as={RouterLink} to="/" colorScheme="blue" variant="ghost">
                Menu
              </Button>
              <Button as={RouterLink} to="/orders" colorScheme="blue" variant="ghost">
                Orders
              </Button>
              {isAdmin && (
                <Button as={RouterLink} to="/admin/dashboard" colorScheme="blue" variant="ghost">
                  Admin
                </Button>
              )}
              <CartIcon />
            </Flex>
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.xl" pt={6}>
        <Routes>
          <Route path="/" element={<Menu />} />
          <Route path="/orders" element={<Order />} />
          <Route path="/order/:orderId" element={<OrderItem />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </Container>
    </Box>
  )
}

export default App


// import React from 'react';
// import { Route, Routes } from 'react-router-dom';
// import { Box, Heading, Container, Flex, Spacer, Button } from '@chakra-ui/react';
// import { Link as RouterLink } from 'react-router-dom';
// import Menu from './components/Menu'; // Changed from MenuItem to Menu
// import Order from './components/order';
// import OrderItem from './components/orderItem';
// import OrderForm from './components/OrderForm';

// const App = () => {
//   return (
//     <Box>
//       <Box as="header" bg="blue.500" color="white" py={4} px={6}>
//         <Container maxW="container.xl">
//           <Flex align="center">
//             <Heading as="h1" size="lg">Digital Diner</Heading>
//             <Spacer />
//             <Flex gap={4}>
//               <Button as={RouterLink} to="/" colorScheme="blue" variant="ghost">
//                 Menu
//               </Button>
//               <Button as={RouterLink} to="/orders" colorScheme="blue" variant="ghost">
//                 Orders
//               </Button>
//               <Button as={RouterLink} to="/create-order" colorScheme="blue">
//                 New Order
//               </Button>
//             </Flex>
//           </Flex>
//         </Container>
//       </Box>
      
//       <Container maxW="container.xl" pt={6}>
//         <Routes>
//           <Route path="/" element={<Menu />} />
//           <Route path="/orders" element={<Order />} />
//           <Route path="/order/:orderId" element={<OrderItem />} />
//           <Route path="/create-order" element={<OrderForm />} />
//         </Routes>
//       </Container>
//     </Box>
//   );
// };

// export default App;