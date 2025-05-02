import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  HStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { AddIcon, MinusIcon, DeleteIcon } from '@chakra-ui/icons';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/use-toast';

const Cart = () => {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleIncrementQuantity = (menuItemId) => {
    const item = items.find(item => item.menuItemId === menuItemId);
    if (item) {
      updateQuantity(menuItemId, item.quantity + 1);
    }
  };

  const handleDecrementQuantity = (menuItemId) => {
    const item = items.find(item => item.menuItemId === menuItemId);
    if (item && item.quantity > 1) {
      updateQuantity(menuItemId, item.quantity - 1);
    } else {
      removeItem(menuItemId);
    }
  };

  const handleRemoveItem = (menuItemId, name) => {
    removeItem(menuItemId);
    toast({
      title: `${name} removed from cart`,
      variant: "default",
    });
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Your cart is empty",
        description: "Add some items before checking out.",
        variant: "destructive",
      });
      return;
    }
    onOpen();
  };

  const handlePlaceOrder = () => {
    // Navigate to checkout page with cart data
    navigate('/checkout');
    onClose();
  };

  return (
    <Box p={4}>
      <Heading as="h1" mb={6}>Your Cart</Heading>
      
      {items.length === 0 ? (
        <Box py={8} textAlign="center">
          <Text fontSize="lg" mb={4}>Your cart is empty</Text>
          <Button colorScheme="blue" onClick={() => navigate('/')}>
            Browse Menu
          </Button>
        </Box>
      ) : (
        <>
          <Table variant="simple" mb={6}>
            <Thead>
              <Tr>
                <Th>Item</Th>
                <Th>Price</Th>
                <Th>Quantity</Th>
                <Th>Subtotal</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {items.map((item) => (
                <Tr key={item.menuItemId}>
                  <Td>{item.name}</Td>
                  <Td>Rs.{item.price.toFixed(2)}</Td>
                  <Td>
                    <HStack>
                      <IconButton
                        size="sm"
                        colorScheme="blue"
                        aria-label="Decrease quantity"
                        icon={<MinusIcon />}
                        onClick={() => handleDecrementQuantity(item.menuItemId)}
                      />
                      <Text px={2}>{item.quantity}</Text>
                      <IconButton
                        size="sm"
                        colorScheme="blue"
                        aria-label="Increase quantity"
                        icon={<AddIcon />}
                        onClick={() => handleIncrementQuantity(item.menuItemId)}
                      />
                    </HStack>
                  </Td>
                  <Td>Rs.{(item.price * item.quantity).toFixed(2)}</Td>
                  <Td>
                    <IconButton
                      colorScheme="red"
                      aria-label="Remove item"
                      icon={<DeleteIcon />}
                      onClick={() => handleRemoveItem(item.menuItemId, item.name)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          <Flex justifyContent="space-between" alignItems="center" mb={6}>
            <Button 
              colorScheme="red" 
              variant="outline" 
              onClick={() => {
                clearCart();
                toast({
                  title: "Cart cleared",
                  variant: "default",
                });
              }}
            >
              Clear Cart
            </Button>
            <Box textAlign="right">
              <Text fontSize="lg">Total:</Text>
              <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                Rs.{totalPrice.toFixed(2)}
              </Text>
            </Box>
          </Flex>

          <Flex justifyContent="flex-end">
            <Button 
              colorScheme="blue" 
              size="lg" 
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </Button>
          </Flex>

          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Confirm Checkout</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Text>Are you ready to place your order?</Text>
                <Text fontWeight="bold" mt={2}>
                  Total: Rs.{totalPrice.toFixed(2)}
                </Text>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme="blue" onClick={handlePlaceOrder}>
                  Place Order
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )}
    </Box>
  );
};

export default Cart;