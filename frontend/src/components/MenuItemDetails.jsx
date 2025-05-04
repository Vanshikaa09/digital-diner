  'use client'

  import { useEffect, useState } from "react"
  import { useParams, useNavigate } from "react-router-dom"
  import {
    Box,
    Button,
    Container,
    Divider,
    Flex,
    Heading,
    Image,
    List,
    ListItem,
    Spinner,
    Stack,
    Tag,
    Text,
    Badge,
    Center,
    VStack,
    HStack,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
  } from "@chakra-ui/react"
  import { ChevronRightIcon, ArrowBackIcon } from "@chakra-ui/icons"
  import { fetchMenuItem } from "../api"
  import { useCart } from "../hooks/useCart"
  import { useToast } from "../hooks/use-toast"

  const MenuItemDetails = () => {
    const { itemId } = useParams()
    const [item, setItem] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { addItem } = useCart()
    const { toast } = useToast()
    const navigate = useNavigate()

    useEffect(() => {
      const getMenuItem = async () => {
        try {
          setLoading(true)
          const menuItem = await fetchMenuItem(itemId)
          setItem(menuItem)
        } catch (error) {
          console.error("Failed to fetch menu item:", error)
          setError("Failed to load menu item. Please try again later.")
        } finally {
          setLoading(false)
        }
      }

      getMenuItem()
    }, [itemId])

    // Format currency
    const formatPrice = (price) => {
      return `Rs.${(price).toFixed(2)}`
    }

    // Handle adding item to cart
    const handleAddToCart = () => {
    // Format the item to ensure it has the correct structure 
    // that matches what's expected in the Cart component
    const formattedItem = {
      ...item,
      menuItemId: item.id || item._id, // Ensure menuItemId is set properly
      id: item.id || item._id,         // Make sure id is present
    }
    
    addItem(formattedItem)
    toast({
      title: `${item.name} added to cart`,
      variant: "default",
    })
  }

    if (loading) {
      return (
        <Center py={10}>
          <Spinner size="xl" color="bottleGreen" />
        </Center>
      )
    }

    if (error) {
      return (
        <Box textAlign="center" py={10}>
          <Heading size="md" color="red.500" mb={4}>
            {error}
          </Heading>
          <Button
            leftIcon={<ArrowBackIcon />}
            colorScheme="bottleGreen"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Box>
      )
    }

    if (!item) {
      return (
        <Box textAlign="center" py={10}>
          <Heading size="md" mb={4}>
            Menu item not found
          </Heading>
          <Button
            leftIcon={<ArrowBackIcon />}
            colorScheme="bottleGreen"
            onClick={() => navigate(-1)}
          >
            Go Back to Menu
          </Button>
        </Box>
      )
    }

    return (
      <Container maxW="container.xl" py={6}>
        {/* Breadcrumb */}
        <Breadcrumb
          spacing="8px"
          separator={<ChevronRightIcon color="gray.500" />}
          mb={6}
        >
          <BreadcrumbItem>
            <BreadcrumbLink href="/" color="bottleGreen">
              Menu
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink color="gray.500">{item.name}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <Flex
          direction={{ base: "column", md: "row" }}
          align="start"
          gap={8}
          mb={8}
        >
          {/* Image */}
          <Box
            width={{ base: "100%", md: "40%" }}
            borderRadius="lg"
            overflow="hidden"
            border="1px"
            borderColor="bottleGreen"
          >
            {item.image? (
              <Image
                src={item.image}
                alt={item.name}
                width="100%"
                height="auto"
                objectFit="cover"
              />
            ) : (
              <Box height="300px" bg="gray.100" />
            )}
          </Box>

          {/* Details */}
          <VStack
            align="start"
            spacing={4}
            width={{ base: "100%", md: "60%" }}
          >
            <Heading color="bottleGreen">{item.name}</Heading>
            
            <Badge colorScheme="green" fontSize="md" px={2} py={1}>
              {item.category || "Uncategorized"}
            </Badge>
            
            <Text fontSize="xl" fontWeight="bold" color="bottleGreen">
              {formatPrice(item.price)}
            </Text>
            
            <Text fontSize="lg">{item.description}</Text>
            
              {/* {item.ingredients && (
                <Box width="100%">
                  <Heading size="md" mb={2} color="bottleGreen">
                    Ingredients
                  </Heading>
                  <List>
                    {item.ingredients.map((ingredient, index) => (
                      <ListItem key={index}>• {ingredient}</ListItem>
                    ))}
                  </List>
                </Box>
              )}
              */}
            {/* {item.allergens && (
              <Box width="100%">
                <Heading size="md" mb={2} color="bottleGreen">
                  Allergens
                </Heading>
                <HStack spacing={2} flexWrap="wrap">
                  {item.allergens.map((allergen, index) => (
                    <Tag key={index} colorScheme="red" size="md">
                      {allergen}
                    </Tag>
                  ))}
                </HStack>
              </Box>
            )}
            
            {item.nutritionalInfo && (
              <Box width="100%">
                <Heading size="md" mb={2} color="bottleGreen">
                  Nutritional Information
                </Heading>
                <HStack spacing={4} flexWrap="wrap">
                  <Box borderWidth="1px" borderRadius="md" p={2}>
                    <Text fontWeight="bold">Calories</Text>
                    <Text>{item.nutritionalInfo.calories}</Text>
                  </Box>
                  <Box borderWidth="1px" borderRadius="md" p={2}>
                    <Text fontWeight="bold">Protein</Text>
                    <Text>{item.nutritionalInfo.protein}</Text>
                  </Box>
                  <Box borderWidth="1px" borderRadius="md" p={2}>
                    <Text fontWeight="bold">Carbs</Text>
                    <Text>{item.nutritionalInfo.carbs}</Text>
                  </Box>
                  <Box borderWidth="1px" borderRadius="md" p={2}>
                    <Text fontWeight="bold">Fat</Text>
                    <Text>{item.nutritionalInfo.fat}</Text>
                  </Box>
                </HStack>
              </Box>
            )} */}
            
            <Flex mt={4} width="100%" gap={4}>
              <Button
                leftIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                colorScheme="gray"
              >
                Back to Menu
              </Button>
              <Button
                colorScheme="green"
                bg="bottleGreen"
                size="lg"
                onClick={handleAddToCart}
                flex={1}
              >
                Add to Cart - {formatPrice(item.price)}
              </Button>
            </Flex>
          </VStack>
        </Flex>
      </Container>
    )
  }

  export default MenuItemDetails