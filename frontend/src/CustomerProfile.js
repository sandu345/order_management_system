// src/components/CustomerProfile.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import VerticalNav from './VerticalNav';
import './styles/Home.css';

function CustomerProfile() {
  const [customer, setCustomer] = useState({
    customerID: '',
    nationalId: '',
    name: '',
    email: '',
    courierAddress: '',
    contactNumbers: [''],
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const { customerId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomerProfile();
  }, [customerId]);

  const fetchCustomerProfile = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/customerProfile/${customerId}`);
      const fetchedCustomer = response.data;
      console.log('Fetched customer data:', fetchedCustomer);

      if (fetchedCustomer && fetchedCustomer.contactNumbers) {
        setCustomer(fetchedCustomer);
      } else {
        console.error("Invalid customer data received:", fetchedCustomer);
        setError("Invalid customer data received. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching customer profile:", error);
      setError("Failed to load customer profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e, index = null) => {
    const { name, value } = e.target;
    if (name === 'contactNumbers' && index !== null) {
      const newContactNumbers = [...customer.contactNumbers];
      newContactNumbers[index] = value;
      setCustomer(prev => ({ ...prev, contactNumbers: newContactNumbers }));
    } else {
      setCustomer(prev => ({ ...prev, [name]: value }));
    }
  };

  const addContactNumber = () => {
    setCustomer(prev => ({
      ...prev,
      contactNumbers: [...prev.contactNumbers, ''],
    }));
  };

  const removeContactNumber = (index) => {
    const newContactNumbers = customer.contactNumbers.filter((_, i) => i !== index);
    setCustomer(prev => ({
      ...prev,
      contactNumbers: newContactNumbers.length ? newContactNumbers : [''],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedCustomer = { 
        ...customer,
        contactNumbers: customer.contactNumbers.filter(number => number !== '')
      };
      console.log("Sending update request with data:", updatedCustomer);
      const response = await axios.put(`http://localhost:4000/updateCustomer/${customerId}`, updatedCustomer);
      console.log("Update response:", response.data);
      setIsEditing(false);
      fetchCustomerProfile();
    } catch (error) {
      console.error("Error updating customer profile:", error.response ? error.response.data : error.message);
      setError("Failed to update customer profile. Please try again.");
    }
  };

  const handlePlaceOrder = () => {
    console.log("Navigating to PlaceOrder with:", customerId, customer.name);
    navigate(`/placeOrder?customerId=${customerId}&customerName=${encodeURIComponent(customer.name)}`);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!customer) return <div>No customer data available</div>;

  return (
    <div className="home-page">
      <VerticalNav links={[
        { name: "All Orders", path: "/orders" },
        { name: "Add New Customer", path: "/customerRegister" },
        { name: "LogOut", path: "/" }
      ]} />
      
      <div className="register-content">
        <div className='form-container'>
          <div className='form-content'>
            <h2 className='register-title'>Customer Profile</h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor='customerid' className='input-field-names'><strong>Customer ID:</strong></label>
                <input name='customerid' className='form-control' type="text" value={customer.customerID} readOnly />
              </div>
              <div>
                <label className='input-field-names'><strong>National ID:</strong></label>
                <input
                  type="text"
                  name="nationalId"
                  value={customer.nationalId}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className='form-control'
                />
              </div>
              <div>
                <label className='input-field-names'><strong>Customer Name:</strong></label>
                <input
                  type="text"
                  name="name"
                  value={customer.name}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className='form-control'
                />
              </div>
              <div>
                <label className='input-field-names'><strong>Email:</strong></label>
                <input
                  type="email"
                  name="email"
                  value={customer.email}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className='form-control'
                />
              </div>
              <div>
                <label className='input-field-names'><strong>Address:</strong></label>
                <input
                  type="text"
                  name="courierAddress"
                  value={customer.courierAddress}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className='form-control'
                />
              </div>
              {customer.contactNumbers.map((number, index) => (
                <div key={`contact${index}`}>
                  <label className='input-field-names'><strong>Contact Number {index + 1}:</strong></label>
                  <input
                    type="text"
                    name="contactNumbers"
                    value={number}
                    onChange={(e) => handleInputChange(e, index)}
                    readOnly={!isEditing}
                    className='form-control'
                  />
                  {isEditing && (
                    <button className='btn-success' type="button" onClick={() => removeContactNumber(index)}>Remove</button>
                  )}
                </div>
              ))}
              {isEditing && (
                <button className='btn-success' type="button" onClick={addContactNumber}>Add Contact Number</button>
              )}
              {isEditing ? (
                <div>
                  <button className='btn-success' type="submit">Save Changes</button>
                  <button className='btn-success' type="button" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              ) : (
                <div>
                  <button className='btn-success' type="button" onClick={() => setIsEditing(true)}>Edit</button>
                  <button className='btn-success' type="button" onClick={handlePlaceOrder}>Place Order</button>
                  <button className='btn-success' type="button" onClick={() => navigate(`/customer-orders/${customer.customerID}`)}>Placed Orders</button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>  
    </div>
  );
}

export default CustomerProfile;