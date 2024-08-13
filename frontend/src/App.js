import React from "react";
import Login from './Login'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Signup from "./Signup";
import Home from "./Home";
import Register from "./Register";
import AllOrders from './AllOrders';
import './styles/App.css';
import CustomerProfile from "./CustomerProfile";
import PlaceOrder from "./PlaceOrder";
import ImageModal from "./ImageModal";
import OrderProfile from "./OrderProfile";
import CustomerOrderList from "./CustomerOrderList";
import CompletedOrders from "./CompletedOrders";
import PayrollDashboard from "./PayrollDashboard";
import EmployeeReport from "./EmployeeReport";
import GenerateSalary from "./GenerateSalary";
import SalaryReport from "./SalaryReport";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/customerRegister" element={<Register />} />
        <Route path="/orders" element={<AllOrders />} />
        <Route path="/customerProfile/:customerId" element={<CustomerProfile />} />
        <Route path="/placeOrder" element={<PlaceOrder />} />
        <Route path="/imageModal" element={<ImageModal />} />
        <Route path="/order-profile/:orderId" element={<OrderProfile />} />
        <Route path="/customer-orders/:customerId" element={<CustomerOrderList />} />
        <Route path="/completedOrders" element={<CompletedOrders/>} />
        <Route path="/payrollDashboard" element={<PayrollDashboard/>} />
        <Route path="/employeeReport" element={<EmployeeReport/>} />
        <Route path="/generateSalary" element={<GenerateSalary/>} />
        <Route path="/salaryReport" element={<SalaryReport/>} />
       
        
      </Routes>
    </BrowserRouter>
  )
}

export default App;