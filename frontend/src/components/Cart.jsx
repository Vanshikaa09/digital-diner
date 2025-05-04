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
      <Heading as="h1" mb={6} color="bottleGreen">Your Cart</Heading>
      
      {items.length === 0 ? (
        <Box py={8} textAlign="center" bg="white" p={8} borderRadius="md" boxShadow="sm" border="1px" borderColor="bottleGreen">
          <Text fontSize="lg" mb={4}>Your cart is empty</Text>
          <Button 
            bg="bottleGreen" 
            color="white" 
            _hover={{ bg: "green.700" }} 
            onClick={() => navigate('/')}
          >
            Browse Menu
          </Button>
        </Box>
      ) : (
        <>
          <Table variant="simple" mb={6} bg="white" borderRadius="md" overflow="hidden" boxShadow="sm" border="1px" borderColor="bottleGreen">
            <Thead bg="bottleGreen">
              <Tr>
                <Th color="white">Item</Th>
                <Th color="white">Price</Th>
                <Th color="white">Quantity</Th>
                <Th color="white">Subtotal</Th>
                <Th color="white">Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {items.map((item) => (
                <Tr key={item.menuItemId}>
                  <Td fontWeight="medium">{item.name}</Td>
                  <Td>Rs.{item.price.toFixed(2)}</Td>
                  <Td>
                    <HStack>
                      <IconButton
                        size="sm"
                        bg="bottleGreen"
                        color="white"
                        _hover={{ bg: "green.700" }}
                        aria-label="Decrease quantity"
                        icon={<MinusIcon />}
                        onClick={() => handleDecrementQuantity(item.menuItemId)}
                      />
                      <Text px={2} fontWeight="medium">{item.quantity}</Text>
                      <IconButton
                        size="sm"
                        bg="bottleGreen"
                        color="white"
                        _hover={{ bg: "green.700" }}
                        aria-label="Increase quantity"
                        icon={<AddIcon />}
                        onClick={() => handleIncrementQuantity(item.menuItemId)}
                      />
                    </HStack>
                  </Td>
                  <Td fontWeight="bold" color="bottleGreen">Rs.{(item.price * item.quantity).toFixed(2)}</Td>
                  <Td>
                    <IconButton
                      bg="red.500"
                      color="white"
                      _hover={{ bg: "red.600" }}
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
              borderColor="red.500"
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
              <Text fontSize="2xl" fontWeight="bold" color="bottleGreen">
                Rs.{totalPrice.toFixed(2)}
              </Text>
            </Box>
          </Flex>

          <Flex justifyContent="flex-end">
            <Button 
              bg="bottleGreen" 
              color="white"
              _hover={{ bg: "green.700" }}
              size="lg" 
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </Button>
          </Flex>

          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent borderRadius="md">
              <ModalHeader color="bottleGreen">Confirm Checkout</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Text>Are you ready to place your order?</Text>
                <Text fontWeight="bold" mt={2} color="bottleGreen">
                  Total: Rs.{totalPrice.toFixed(2)}
                </Text>
              </ModalBody>
              <ModalFooter>
                <Button variant="outline" borderColor="gray.300" mr={3} onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  bg="bottleGreen" 
                  color="white"
                  _hover={{ bg: "green.700" }}
                  onClick={handlePlaceOrder}
                >
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