import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Badge, IconButton } from '@chakra-ui/react';
import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../hooks/useCart';

const CartIcon = () => {
  // Use useCart hook to get the totalItems
  const { totalItems } = useCart();
  const navigate = useNavigate();

  return (
    <Box position="relative" display="inline-block">
      <IconButton
        icon={<FaShoppingCart />}
        aria-label="Shopping Cart"
        colorScheme="blue"
        variant="ghost"
        fontSize="20px"
        onClick={() => navigate('/cart')}
      />
      {totalItems > 0 && (
        <Badge
          colorScheme="red"
          borderRadius="full"
          position="absolute"
          top="-1"
          right="-1"
          fontSize="0.8em"
        >
          {totalItems}
        </Badge>
      )}
    </Box>
  );
};

export default CartIcon;