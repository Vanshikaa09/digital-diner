

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Badge,
  Flex,
  Text,
  Spinner,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Divider,
  Alert,
  AlertIcon,
  Input,
  FormControl,
  FormLabel,
} from "@chakra-ui/react"
import { fetchOrders, fetchUserOrders, fetchOrderItems } from "../api"

const Order = () => {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderItems, setOrderItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [phone, setPhone] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const navigate = useNavigate()


  useEffect(() => {
    const savedPhone = localStorage.getItem("userPhone")
    if (savedPhone) {
      setPhone(savedPhone) // Populate the phone state from localStorage
      fetchOrdersForUser(savedPhone) // Fetch orders for the saved phone number
    } else {
      setLoading(false) // Set loading to false if no phone is saved
    }
  }, [])
  // useEffect(() => {
  //   // Check if there's a saved phone number in localStorage
  //   const savedPhone = localStorage.getItem("userPhone")
  //   if (savedPhone) {
  //     setPhone(savedPhone)
  //     fetchOrdersForUser(savedPhone)
  //   } else {
  //     // If no saved phone, show empty state instead of all orders
  //     setLoading(false)
  //   }
  // }, [])

  const fetchAllOrders = async () => {
    try {
      setLoading(true)
      const fetchedOrders = await fetchOrders()
      console.log("Fetched all orders:", fetchedOrders)
      setOrders(fetchedOrders)
    } catch (error) {
      console.error("Error fetching orders:", error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const fetchOrdersForUser = async (phoneNumber) => {
    if (!phoneNumber || phoneNumber.trim() === "") {
      setOrders([])
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      console.log("Fetching orders for phone:", phoneNumber)
      const fetchedOrders = await fetchUserOrders(phoneNumber)
      console.log("Fetched user orders:", fetchedOrders)
      
      // Filter orders by phone number on the client side as well for redundancy
      const filteredOrders = fetchedOrders.filter(
        order => order.customer_phone === phoneNumber
      )
      console.log("Filtered orders:", filteredOrders)
      
      setOrders(filteredOrders)
    } catch (error) {
      console.error("Error fetching user orders:", error)
      setOrders([])
    } finally {
      setLoading(false)
      setSubmitted(true)
    }
  }

  // const handleSubmitPhone = () => {
  //   if (phone.trim()) {
  //     localStorage.setItem("userPhone", phone.trim())
  //     fetchOrdersForUser(phone.trim())
  //   } else {
  //     // Show error or notification about empty phone field
  //     setOrders([])
  //     setSubmitted(false)
  //   }
  // }
  const handleSubmitPhone = () => {
    if (phone.trim()) {
      localStorage.setItem("userPhone", phone.trim()) // Save the new phone number
      fetchOrdersForUser(phone.trim()) // Fetch orders for the new phone number
    } else {
      // Show error or notification about empty phone field
      setOrders([]) // Reset orders
      setSubmitted(false) // Reset the submitted state
      localStorage.removeItem("userPhone") // Remove the phone number from localStorage
    }
  }
  

  const handleViewDetails = async (order) => {
    setSelectedOrder(order)
    setLoadingDetails(true)
    try {
      // If order has items array, use it directly
      if (order.items && Array.isArray(order.items) && order.items.length > 0) {
        setOrderItems(order.items)
      } else {
        // Otherwise fetch from API
        const items = await fetchOrderItems(order.id)
        setOrderItems(items)
      }
    } catch (error) {
      console.error("Error fetching order items:", error)
      setOrderItems([])
    } finally {
      setLoadingDetails(false)
      onOpen()
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "green"
      case "processing":
        return "blue"
      case "cancelled":
        return "red"
      case "pending":
      default:
        return "yellow"
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Helper function to safely format currency
  const formatCurrency = (amount) => {
    // Convert to number if it's a string, or default to 0 if null/undefined
    const numAmount = amount !== null && amount !== undefined ? Number(amount) : 0

    // Check if it's a valid number
    if (isNaN(numAmount)) {
      console.warn("Invalid amount value:", amount)
      return "0.00"
    }

    return numAmount.toFixed(2)
  }

  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="xl" />
        <Text mt={4}>Loading orders...</Text>
      </Box>
    )
  }

  return (
    <Box p={4}>
      <Heading as="h1" mb={6}>
        Your Orders
      </Heading>

      {/* Phone number input */}
      <Box mb={6} p={4} borderWidth="1px" borderRadius="lg">
        <FormControl>
          <FormLabel>Enter your phone number to see your orders</FormLabel>
          <Flex>
            <Input
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              mr={4}
            />
            <Button  bg="bottleGreen" 
                color="white" onClick={handleSubmitPhone}>
              Find Orders
            </Button>
          </Flex>
        </FormControl>
      </Box>

      {submitted && orders.length === 0 ? (
        <Box p={8}>
          <Alert status="info" mb={4}>
            <AlertIcon />
            No orders found for this phone number.
          </Alert>
          <Button  bg="bottleGreen" 
                color="white"  onClick={() => navigate("/")}>
            Browse Menu
          </Button>
        </Box>
      ) : orders.length > 0 ? (
        <>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Order ID</Th>
                <Th>Date</Th>
                <Th>Total</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {orders.map((order) => (
                <Tr key={order.id}>
                  <Td>#{order.id}</Td>
                  <Td>{formatDate(order.created_at || order.pickup_time)}</Td>
                  <Td>Rs.{formatCurrency(order.total_amount)}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(order.status)}>{order.status || "Pending"}</Badge>
                  </Td>
                  <Td>
                    <Button size="sm" c bg="bottleGreen" 
                color="white"  onClick={() => handleViewDetails(order)}>
                      View Details
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          {/* Order Details Modal */}
          <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Order #{selectedOrder?.id} Details</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                {loadingDetails ? (
                  <Flex justify="center" align="center" py={8}>
                    <Spinner />
                  </Flex>
                ) : (
                  <>
                    <Flex justify="space-between" mb={4}>
                      <Box>
                        <Text fontWeight="bold">Order Date</Text>
                        <Text>{formatDate(selectedOrder?.created_at || selectedOrder?.pickup_time)}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold">Status</Text>
                        <Badge colorScheme={getStatusColor(selectedOrder?.status)}>
                          {selectedOrder?.status || "Pending"}
                        </Badge>
                      </Box>
                    </Flex>

                    {selectedOrder?.pickup_time && (
                      <Box mb={4}>
                        <Text fontWeight="bold">Pickup Time</Text>
                        <Text>{formatDate(selectedOrder.pickup_time)}</Text>
                      </Box>
                    )}

                    <Divider my={4} />

                    <Heading as="h3" size="sm" mb={3}>
                      Items
                    </Heading>

                    {orderItems.length === 0 ? (
                      <Text color="gray.500">No items found for this order.</Text>
                    ) : (
                      <VStack align="stretch" spacing={2}>
                        {orderItems.map((item, index) => (
                          <Flex key={index} justify="space-between">
                            <Text>
                              {item.name || item.item_name} x {item.quantity}
                            </Text>
                            <Text fontWeight="medium">Rs.{formatCurrency((item.price || 0) * (item.quantity || 1))}</Text>
                          </Flex>
                        ))}

                        <Divider my={2} />

                        <Flex justify="space-between" fontWeight="bold">
                          <Text>Total:</Text>
                          <Text>Rs.{formatCurrency(selectedOrder?.total_amount)}</Text>
                        </Flex>
                      </VStack>
                    )}

                    {selectedOrder?.customer_name && (
                      <>
                        <Divider my={4} />
                        <Heading as="h3" size="sm" mb={3}>
                          Customer Information
                        </Heading>
                        <Text>
                          <strong>Name:</strong> {selectedOrder.customer_name}
                        </Text>
                        {selectedOrder.customer_email && (
                          <Text>
                            <strong>Email:</strong> {selectedOrder.customer_email}
                          </Text>
                        )}
                        {selectedOrder.customer_phone && (
                          <Text>
                            <strong>Phone:</strong> {selectedOrder.customer_phone}
                          </Text>
                        )}
                        {selectedOrder.customer_address && (
                          <Text>
                            <strong>Address:</strong> {selectedOrder.customer_address}
                          </Text>
                        )}
                      </>
                    )}
                  </>
                )}
              </ModalBody>
            </ModalContent>
          </Modal>
        </>
      ) : !submitted ? (
        <Box p={8} textAlign="center">
          <Text fontSize="lg" mb={4}>Please enter your phone number to view your orders</Text>
        </Box>
      ) : (
        <Box p={8}>
          <Alert status="info" mb={4}>
            <AlertIcon />
            You haven't placed any orders yet.
          </Alert>
          <Button colorScheme="blue" onClick={() => navigate("/")}>
            Browse Menu
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default Order