"use client"

import { useEffect, useState } from "react"
import {
  Box,
  Grid,
  Heading,
  Card,
  CardBody,
  CardFooter,
  Image,
  Stack,
  Text,
  Button,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  CloseButton,
  useDisclosure,
} from "@chakra-ui/react"
import { fetchMenu } from "../api"
import { useCart } from "../hooks/useCart"
import { useToast } from "../hooks/use-toast"

const Menu = () => {
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()
  const { toast } = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [addedItem, setAddedItem] = useState(null)

  // Fetch menu items on component mount
  useEffect(() => {
    const getMenu = async () => {
      try {
        const data = await fetchMenu()
        setMenuItems(data)
      } catch (error) {
        console.error("Failed to fetch menu:", error)
      } finally {
        setLoading(false)
      }
    }

    getMenu()
  }, [])

  // Format currency
  const formatPrice = (price) => {
    return `Rs.${(price).toFixed(2)}`
  }

  // Handle adding item to cart
  const handleAddToCart = (item) => {
    // Pass the entire menu item object to addItem
    addItem(item)
    setAddedItem(item)
    
    // Show toast notification
    toast({
      title: `${item.name} added to cart`,
      variant: "default",
    })

    // Auto close the alert after 3 seconds
    onOpen()
    setTimeout(() => {
      onClose()
    }, 3000)
  }

  if (loading) {
    return (
      <Center py={10}>
        <Spinner size="xl" />
      </Center>
    )
  }

  return (
    <Box>
      <Heading as="h1" mb={6}>
        Our Menu
      </Heading>

      {/* Item added alert */}
      {isOpen && addedItem && (
        <Alert status="success" mb={4} rounded="md">
          <AlertIcon />
          <Text>{addedItem.name} added to your cart!</Text>
          <CloseButton position="absolute" right="8px" top="8px" onClick={onClose} />
        </Alert>
      )}

      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
        {menuItems.map((item) => (
          <Card key={item.id} maxW="sm" shadow="md" border="1px" borderColor="gray.200">
            <CardBody>
              <Image src={item.imageUrl} alt={item.name} borderRadius="lg" />
              <Stack mt="4" spacing="3">
                <Heading size="md">{item.name}</Heading>
                <Text color="gray.700" noOfLines={2}>
                  {item.description}
                </Text>
                <Text color="blue.600" fontSize="xl" fontWeight="bold">
                  {formatPrice(item.price)}
                </Text>
              </Stack>
            </CardBody>
            <CardFooter>
              <Button
                colorScheme="blue"
                width="full"
                onClick={() => handleAddToCart(item)}
              >
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </Grid>
    </Box>
  )
}

export default Menu

// import React, { useEffect, useState } from 'react';
// import { fetchMenu } from '../api';
// import {
//   Card,
//   CardHeader,
//   CardFooter,
//   Image,
//   Heading,
//   Text,
//   Button,
//   Box,
//   SimpleGrid
// } from '@chakra-ui/react';
// import { useCart } from '../hooks/useCart';
// import { useToast } from '../hooks/use-toast';


// export function MenuItemCard({ item }) {
//   const { addItem } = useCart();
//   const { toast } = useToast();
// }
// const Menu = () => {
//   const [menu, setMenu] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const getMenu = async () => {
//       try {
//         const menuItems = await fetchMenu();
//         setMenu(menuItems);
//       } catch (error) {
//         console.error('Failed to fetch menu:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     getMenu();
//   }, []);

//   const handleAddToCart = (item) => {
//     addItem(item);
//     toast({
//       title: `RS{item.name} added to cart`,
//       description: "You can view your cart to proceed.",
//       variant: "default", // Use default style
//     });
//     // Add to cart functionality will go here
//     console.log('Adding to cart:', item);
//     // You could dispatch to a context or Redux store here
//   };

//   if (loading) {
//     return <Box p={4}>Loading menu items...</Box>;
//   }

//   if (menu.length === 0) {
//     return <Box p={4}>No menu items available. Please check back later.</Box>;
//   }

//   return (
//     <Box p={4}>
//       <Heading as="h1" mb={4}>Our Menu</Heading>
//       <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
//         {menu.map((item) => (
//           <Card key={item.id} maxW="sm" overflow="hidden" variant="outline">
//             <Image
//               src={item.imageUrl || 'https://via.placeholder.com/300x200?text=Food+Item'}
//               alt={item.name}
//               height="200px"
//               objectFit="cover"
//               fallbackSrc="https://via.placeholder.com/300x200?text=Image+Not+Available"
//             />
//             <CardHeader pb={0}>
//               <Heading size="md">{item.name}</Heading>
//             </CardHeader>
//             <Box p={2}>
//               <Text>{item.description}</Text>
//             </Box>
//             <CardFooter pt={0} display="flex" justifyContent="space-between" alignItems="center">
//               <Text fontWeight="bold" fontSize="lg" color="blue.600">
//                 Rs.{item.price?.toFixed(2) || '0.00'}
//               </Text>
//               <Button 
//                 colorScheme="blue" 
//                 size="sm" 
//                 onClick={() => handleAddToCart(item)}
//               >
//                 Add to Cart
//               </Button>
//             </CardFooter>
//           </Card>
//         ))}
//       </SimpleGrid>
//     </Box>
//   );
// };

// export default Menu;