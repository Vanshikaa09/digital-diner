"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Button,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Image,
  useToast,
  Spinner,
  Text,
  Alert,
  AlertIcon,
} from "@chakra-ui/react"
import { EditIcon, DeleteIcon, AddIcon } from "@chakra-ui/icons"
import axios from "axios"

const API_URL = "http://localhost:3000/api"

const AdminMenu = () => {
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentItem, setCurrentItem] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    image: "",
  })

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/admin/menu`, {
        headers: {
          "x-auth-token": localStorage.getItem("token"),
        },
      })
      setMenuItems(response.data)
      setError(null)
    } catch (err) {
      console.error("Error fetching menu items:", err)
      setError("Failed to load menu items. Please check your connection and permissions.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "price" ? (value === "" ? "" : Number(value)) : value,
    })
  }

  const handleAddItem = () => {
    setCurrentItem(null)
    setFormData({
      name: "",
      description: "",
      category: "",
      price: "",
      image: "",
    })
    onOpen()
  }

  const handleEditItem = (item) => {
    setCurrentItem(item)
    setFormData({
      name: item.name,
      description: item.description || "",
      category: item.category || "",
      price: item.price,
      image: item.image || "",
    })
    onOpen()
  }

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return
    }

    try {
      await axios.delete(`${API_URL}/admin/menu/${id}`, {
        headers: {
          "x-auth-token": localStorage.getItem("token"),
        },
      })

      setMenuItems(menuItems.filter((item) => item._id !== id))

      toast({
        title: "Item deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } catch (err) {
      console.error("Error deleting item:", err)
      toast({
        title: "Error",
        description: "Failed to delete item",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.price) {
      toast({
        title: "Error",
        description: "Name and price are required",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsSubmitting(true)

    try {
      let response

      if (currentItem) {
        // Update existing item
        response = await axios.put(`${API_URL}/admin/menu/${currentItem._id}`, formData, {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        })

        // Update the item in the state
        setMenuItems(menuItems.map((item) => (item._id === currentItem._id ? response.data : item)))

        toast({
          title: "Item updated",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      } else {
        // Add new item
        response = await axios.post(`${API_URL}/admin/menu`, formData, {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        })

        // Add the new item to the state
        setMenuItems([...menuItems, response.data])

        toast({
          title: "Item added",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      }

      onClose()
    } catch (err) {
      console.error("Error saving item:", err)
      toast({
        title: "Error",
        description: "Failed to save item",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="xl" />
        <Text mt={4}>Loading menu items...</Text>
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={8}>
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
        <Button onClick={fetchMenuItems}>Try Again</Button>
      </Box>
    )
  }

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h1" size="lg">
          Menu Management
        </Heading>
        <Button leftIcon={<AddIcon />} colorScheme="green" onClick={handleAddItem}>
          Add New Item
        </Button>
      </Flex>

      {menuItems.length === 0 ? (
        <Alert status="info">
          <AlertIcon />
          No menu items found. Add your first item!
        </Alert>
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Image</Th>
              <Th>Name</Th>
              <Th>Category</Th>
              <Th>Price</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {menuItems.map((item) => (
              <Tr key={item._id}>
                <Td>
                  <Image
                    src={item.image || "https://via.placeholder.com/50x50?text=No+Image"}
                    alt={item.name}
                    boxSize="50px"
                    objectFit="cover"
                    borderRadius="md"
                    fallbackSrc="https://via.placeholder.com/50x50?text=No+Image"
                  />
                </Td>
                <Td>{item.name}</Td>
                <Td>{item.category || "Uncategorized"}</Td>
                <Td>Rs.{item.price.toFixed(2)}</Td>
                <Td>
                  <IconButton icon={<EditIcon />} aria-label="Edit" mr={2} onClick={() => handleEditItem(item)} />
                  <IconButton
                    icon={<DeleteIcon />}
                    aria-label="Delete"
                    colorScheme="red"
                    onClick={() => handleDeleteItem(item._id)}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      {/* Add/Edit Item Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{currentItem ? "Edit Menu Item" : "Add Menu Item"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <FormControl isRequired mb={4}>
                <FormLabel>Name</FormLabel>
                <Input name="name" value={formData.name} onChange={handleInputChange} />
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Description</FormLabel>
                <Textarea name="description" value={formData.description} onChange={handleInputChange} />
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Category</FormLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Select category"
                >
                  <option value="Appetizers">Appetizers</option>
                  <option value="Main Course">Main Course</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Sides">Sides</option>
                </Select>
              </FormControl>

              <FormControl isRequired mb={4}>
                <FormLabel>Price (Rs.)</FormLabel>
                <Input
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Image URL</FormLabel>
                <Input
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
              </FormControl>

              {formData.image && (
                <Box mt={2} mb={4}>
                  <Text fontSize="sm" mb={1}>
                    Image Preview:
                  </Text>
                  <Image
                    src={formData.image || "/placeholder.svg"}
                    alt="Preview"
                    maxH="100px"
                    borderRadius="md"
                    fallbackSrc="https://via.placeholder.com/100x100?text=Invalid+URL"
                  />
                </Box>
              )}

              <ModalFooter px={0}>
                <Button variant="ghost" mr={3} onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme="blue" type="submit" isLoading={isSubmitting}>
                  Save
                </Button>
              </ModalFooter>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default AdminMenu
