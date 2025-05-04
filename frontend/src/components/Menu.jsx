'use client'

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
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
  Select,
  Flex,
} from "@chakra-ui/react"
import { InfoIcon } from "@chakra-ui/icons"
import { fetchMenu } from "../api"
import { useCart } from "../hooks/useCart"
import { useToast } from "../hooks/use-toast"

const Menu = () => {
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("")
  const { addItem } = useCart()
  const { toast } = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [addedItem, setAddedItem] = useState(null)
  const navigate = useNavigate()

  // Fetch menu items on component mount
  useEffect(() => {
    const getMenu = async () => {
      try {
        const data = await fetchMenu()
        const formatted = data.map(item => ({
          ...item,
          id: item._id || item.id,     // ✅ ensure `id` is present
          imageUrl: item.image || item.imageUrl || "", // ✅ use `imageUrl` or empty fallback
        }))
        setMenuItems(formatted)
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
  const handleAddToCart = (event, item) => {
    // Stop event propagation to prevent navigation when clicking the Add to Cart button
    event.stopPropagation()
    
    addItem(item)
    setAddedItem(item)

    toast({
      title: `${item.name} added to cart`,
      variant: "default",
    })

    onOpen()
    setTimeout(() => {
      onClose()
    }, 3000)
  }

  // Handle view item details
  const handleViewDetails = (itemId) => {
    navigate(`/menu/${itemId}`)
  }

  // Filter menu items based on category
  const filteredMenuItems = selectedCategory
    ? menuItems.filter(item => item.category === selectedCategory)
    : menuItems

  if (loading) {
    return (
      <Center py={10}>
        <Spinner size="xl" color="bottleGreen" />
      </Center>
    )
  }

  return (
    <Box>
      <Heading as="h1" mb={6} color="bottleGreen">
        Our Menu
      </Heading>

      {/* Category Filter */}
      <Box mb={4}>
        <Select
          placeholder="Select Category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          bg="white"
          color="bottleGreen"
          borderColor="bottleGreen"
          _hover={{ borderColor: "bottleGreen" }}
          _focus={{ borderColor: "bottleGreen", boxShadow: "0 0 0 1px #0A5F38" }}
        >
          <option value="Main Course">Main Course</option>
          <option value="Appetizers">Appetizers</option>
          <option value="Sides">Sides</option>
          <option value="Beverages">Beverages</option>
          <option value="Desserts">Desserts</option>
        </Select>
      </Box>

      {/* Item added alert */}
      {isOpen && addedItem && (
        <Alert status="success" mb={4} rounded="md" bg="bottleGreen" color="white">
          <AlertIcon color="white" />
          <Text>{addedItem.name} added to your cart!</Text>
          <CloseButton position="absolute" right="8px" top="8px" onClick={onClose} color="white" />
        </Alert>
      )}

      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
        {filteredMenuItems.map((item) => (
          <Card 
            key={item.id} 
            maxW="sm" 
            shadow="md" 
            border="1px" 
            borderColor="bottleGreen" 
            borderRadius="md"
            transition="transform 0.3s"
            _hover={{ transform: "translateY(-5px)", cursor: "pointer" }}
            onClick={() => handleViewDetails(item.id)}
          >
            <CardBody>
              {item.imageUrl ? (
                <Image 
                  src={item.imageUrl} 
                  alt={item.name} 
                  borderRadius="lg" 
                  height="200px" 
                  width="100%" 
                  objectFit="cover" 
                />
              ) : (
                <Box height="200px" bg="gray.100" borderRadius="lg" />
              )}
              <Stack mt="4" spacing="3">
                <Heading size="md" color="bottleGreen">{item.name}</Heading>
                <Text color="black" noOfLines={2}>
                  {item.description}
                </Text>
                <Text color="bottleGreen" fontSize="xl" fontWeight="bold">
                  {formatPrice(item.price)}
                </Text>
              </Stack>
            </CardBody>
            <CardFooter>
              <Flex width="100%" gap={2}>
                <Button 
                  flex={1}
                  bg="bottleGreen" 
                  color="white" 
                  _hover={{ bg: "green.700" }} 
                  onClick={(e) => handleAddToCart(e, item)}
                >
                  Add to Cart
                </Button>
                <Button
                  leftIcon={<InfoIcon />}
                  variant="outline"
                  colorScheme="green"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(item.id);
                  }}
                >
                  Details
                </Button>
              </Flex>
            </CardFooter>
          </Card>
        ))}
      </Grid>
    </Box>
  )
}

export default Menu
