'use client'

import { Route, Routes } from "react-router-dom"
import { Box, Heading, Container, Flex, Spacer, Button, extendTheme, ChakraProvider } from "@chakra-ui/react"
import { Link as RouterLink } from "react-router-dom"
import Menu from "./components/Menu"
import MenuItemDetails from "./components/MenuItemDetails" // Import new component
import OrderItem from "./components/OrderItem"
import Cart from "./components/Cart"
import Checkout from "./components/Checkout"
import CartIcon from "./components/CartIcon"
import AdminLogin from "./components/admin/AdminLogin"
import AdminDashboard from "./components/admin/AdminDashboard"
import { useEffect, useState } from "react"
import Order from "./components/order"

// Custom Chakra theme with Bottle Green, White, and Black
const theme = extendTheme({
  colors: {
    bottleGreen: "#006747", // Bottle Green color
    white: "#FFFFFF",
    black: "#000000",
  },
  styles: {
    global: {
      body: {
        backgroundColor: "#FFFFFF",
        color: "#000000",
      },
    },
  },
})

const App = () => {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check if user is admin
    const user = JSON.parse(localStorage.getItem("user"))
    setIsAdmin(user?.role === "admin")
  }, [])

  return (
    <ChakraProvider theme={theme}> {/* ChakraProvider with custom theme */}
      <Box>
        <Box as="header" bg="bottleGreen" color="white" py={4} px={6}>
          <Container maxW="container.xl">
            <Flex align="center">
              <Heading as="h1" size="lg">
                Digital Diner
              </Heading>
              <Spacer />
              <Flex gap={4} align="center">
                <Button as={RouterLink} to="/" colorScheme="bottleGreen" variant="ghost">
                  Menu
                </Button>
                <Button as={RouterLink} to="/orders" colorScheme="bottleGreen" variant="ghost">
                  Orders
                </Button>
                <Button as={RouterLink} to="/admin" colorScheme="bottleGreen" variant="ghost">
                  Admin
                </Button>

                {/* {isAdmin && (
                  <Button as={RouterLink} to="/admin/dashboard" colorScheme="bottleGreen" variant="ghost">
                    Admin Dashboard
                  </Button>
                )} */}
                <CartIcon />
              </Flex>
            </Flex>
          </Container>
        </Box>

        <Container maxW="container.xl" pt={6}>
          <Routes>
            <Route path="/" element={<Menu />} />
            <Route path="/menu/:itemId" element={<MenuItemDetails />} /> {/* New route for menu item details */}
            <Route path="/orders" element={<Order />} />
            <Route path="/order/:orderId" element={<OrderItem />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </Container>
      </Box>
    </ChakraProvider> /* ChakraProvider */
  )
}

export default App

