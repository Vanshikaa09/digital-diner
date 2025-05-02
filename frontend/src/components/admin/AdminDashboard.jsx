

import { useState } from "react"
import { Box, Flex, Heading, Tab, TabList, TabPanel, TabPanels, Tabs, Button, useToast } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import AdminMenu from "./AdminMenu"
import AdminOrders from "./AdminOrders"

const AdminDashboard = () => {
  const [tabIndex, setTabIndex] = useState(0)
  const navigate = useNavigate()
  const toast = useToast()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    toast({
      title: "Logged out",
      status: "success",
      duration: 3000,
      isClosable: true,
    })
    navigate("/AdminLogin")
  }

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h1" size="xl">
          Admin Dashboard
        </Heading>
        <Button colorScheme="red" onClick={handleLogout}>
          Logout
        </Button>
      </Flex>

      <Tabs index={tabIndex} onChange={setTabIndex} colorScheme="blue">
        <TabList>
          <Tab>Menu Management</Tab>
          <Tab>Order Management</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <AdminMenu />
          </TabPanel>
          <TabPanel>
            <AdminOrders />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}

export default AdminDashboard
