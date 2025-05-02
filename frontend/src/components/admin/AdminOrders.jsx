import { useState, useEffect } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Flex,
  Heading,
  Select,
  Spinner,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Divider,
} from "@chakra-ui/react";
import { fetchOrders, fetchOrderItems } from "../../api";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const getOrders = async () => {
      try {
        setLoading(true);
        const fetchedOrders = await fetchOrders();
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    getOrders();
  }, []);

  const handleViewDetails = async (order) => {
    setSelectedOrder(order);
    setLoadingDetails(true);
    try {
      const items = await fetchOrderItems(order.id);
      setOrderItems(items);
    } catch (error) {
      console.error("Error fetching order items:", error);
      setOrderItems([]);
    } finally {
      setLoadingDetails(false);
      onOpen();
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    // This is a placeholder for API call to update order status
    console.log(`Updating order ${orderId} status to ${newStatus}`);
    
    // For now, just update the local state
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "green";
      case "processing":
        return "blue";
      case "cancelled":
        return "red";
      case "pending":
      default:
        return "yellow";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper function to safely format currency
  const formatCurrency = (amount) => {
    // Convert to number if it's a string, or default to 0 if null/undefined
    const numAmount = amount !== null && amount !== undefined ? Number(amount) : 0;
    
    // Check if it's a valid number
    if (isNaN(numAmount)) {
      console.warn("Invalid amount value:", amount);
      return "0.00";
    }
    
    return numAmount.toFixed(2);
  };

  const filteredOrders = statusFilter === "all"
    ? orders
    : orders.filter((order) => order.status?.toLowerCase() === statusFilter);

  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="xl" />
        <Text mt={4}>Loading orders...</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h2" size="lg">
          Order Management
        </Heading>
        <Select
          width="200px"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </Flex>

      {filteredOrders.length === 0 ? (
        <Text>No orders found.</Text>
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Order ID</Th>
              <Th>Customer</Th>
              <Th>Date</Th>
              <Th>Total</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredOrders.map((order) => (
              <Tr key={order.id}>
                <Td>#{order.id}</Td>
                <Td>{order.customer_name || "Anonymous"}</Td>
                <Td>{formatDate(order.created_at)}</Td>
                <Td>Rs.{formatCurrency(order.total_amount)}</Td>
                <Td>
                  <Badge colorScheme={getStatusColor(order.status)}>
                    {order.status || "Pending"}
                  </Badge>
                </Td>
                <Td>
                  <Flex gap={2}>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => handleViewDetails(order)}
                    >
                      View
                    </Button>
                    <Select
                      size="sm"
                      width="140px"
                      value={order.status || "pending"}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value)
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </Select>
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

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
                    <Text>{formatDate(selectedOrder?.created_at)}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Status</Text>
                    <Badge colorScheme={getStatusColor(selectedOrder?.status)}>
                      {selectedOrder?.status || "Pending"}
                    </Badge>
                  </Box>
                </Flex>

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
                        <Text fontWeight="medium">
                          Rs.{formatCurrency((item.price || 0) * (item.quantity || 1))}
                        </Text>
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
                  </>
                )}
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminOrders;