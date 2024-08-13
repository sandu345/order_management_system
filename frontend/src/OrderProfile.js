// File: src/OrderProfile.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import VerticalNav from './VerticalNav';
import CurrencyInput from 'react-currency-input-field';
import './styles/Home.css';

function OrderProfile() {
  const [orderData, setOrderData] = useState({
    customerId: '',
    customerName: '',
    orderedDate: '',
    weddingDate: '',
    courierDate: '',
    returnDate: '',
    depositAmount: '',
    itemPrice: '',
    courierCharge: '',
    paidAmount: '',
    isPaid: false,
    items: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.orderData) {
      const formattedOrderData = {
        ...location.state.orderData,
        orderedDate: formatDate(location.state.orderData.orderedDate),
        weddingDate: formatDate(location.state.orderData.weddingDate),
        courierDate: location.state.orderData.courierDate,
        returnDate: formatDate(location.state.orderData.returnDate),
        items: location.state.orderData.items || [],
      };
      setOrderData(formattedOrderData);
    } else {
      fetchOrderData();
    }
  }, [orderId, location.state]);

  const fetchOrderData = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/getOrder/${orderId}`);
      const formattedOrderData = {
        ...response.data,
        orderedDate: formatDate(response.data.orderedDate),
        weddingDate: formatDate(response.data.weddingDate),
        courierDate: response.data.courierDate,
        returnDate: formatDate(response.data.returnDate),
        paidAmount: response.data.paidAmount || '0',
        items: response.data.items || [],
      };
      setOrderData(formattedOrderData);
    } catch (error) {
      console.error('Error fetching order data:', error);
      setError('Failed to fetch order data. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'DISPATCHED') return dateString;
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOrderData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleItemReturnedChange = (index, checked) => {
    setOrderData(prevState => {
      const newItems = [...prevState.items];
      newItems[index].isReturned = checked;
      return { ...prevState, items: newItems };
    });
  };

  const handleItemDispatchedChange = (index, checked) => {
    setOrderData(prevState => {
      const newItems = [...prevState.items];
      newItems[index].isDispatched = checked;
  
      // Check if all items are dispatched
      const allItemsDispatched = newItems.every(item => item.isDispatched);
  
      return { 
        ...prevState, 
        items: newItems, 
        courierDate: allItemsDispatched ? new Date().toISOString().split('T')[0] : prevState.courierDate
      };
    });
  };

  const handleCurrencyInput = (value, name) => {
    setOrderData(prevState => ({
      ...prevState,
      [name]: value || ''
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const updatedOrderData = {
        ...orderData,
        paidAmount: orderData.paidAmount || '0',
        isPaid: remainingAmount <= 0,
        courierDate: orderData.courierDate === 'DISPATCHED' ? 'DISPATCHED' : formatDate(orderData.courierDate)
      };
      await axios.put(`http://localhost:4000/updateOrder/${orderId}`, updatedOrderData);
      setIsEditing(false);
      navigate('/orders');
    } catch (error) {
      console.error('Error updating order:', error);
      setError('Failed to update order. Please try again.');
    }
  };

  const handleCustomerClick = () => {
    navigate(`/customerProfile/${orderData.customerId}`);
  };

  const calculateTotalAmount = () => {
    const itemPrice = parseFloat(orderData.itemPrice) || 0;
    return itemPrice;
  };

  const calculateRemainingAmount = () => {
    const totalAmount = calculateTotalAmount();
    const paidAmount = parseFloat(orderData.paidAmount) || 0;
    return totalAmount - paidAmount;
  };

  const totalAmount = calculateTotalAmount();
  const remainingAmount = calculateRemainingAmount();
  const isTransactionCompleted = remainingAmount <= 0;

  if (!orderData) return <div>Loading...</div>;

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
            <h2 className='register-title'>Order Profile</h2>
            {error && <div className="error">{error}</div>}
            <form>
              <div>
                <label className='input-field-names'><strong>Customer ID:</strong></label>
                <input
                  type="text"
                  name="customerId"
                  value={orderData.customerId}
                  readOnly
                  className='form-control clickable'
                  onClick={handleCustomerClick}
                  style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                />
              </div>
              <div>
                <label className='input-field-names'><strong>Customer Name:</strong></label>
                <input
                  type="text"
                  name="customerName"
                  value={orderData.customerName}
                  readOnly
                  className='form-control'
                />
              </div>
              <div>
                <label className='input-field-names'><strong>Items:</strong></label>
                {orderData.items.map((item, index) => (
                  <div key={index} className="item-container">
                    <input
                      type="text"
                      name="itemName"
                      value={item.itemName}
                      readOnly={!isEditing}
                      className='form-control'
                    />
                    <label>
                      <input
                        type="checkbox"
                        checked={item.isReturned}
                        onChange={(e) => handleItemReturnedChange(index, e.target.checked)}
                        disabled={!isEditing}
                      />
                      Is Returned
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={item.isDispatched}
                        onChange={(e) => handleItemDispatchedChange(index, e.target.checked)}
                        disabled={!isEditing}
                      />
                      Is Dispatched
                    </label>
                  </div>
                ))}
              </div>
              <div>
                <label className='input-field-names'><strong>Ordered Date:</strong></label>
                <input
                  type="date"
                  name="orderedDate"
                  value={orderData.orderedDate}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className='form-control'
                />
              </div>
              <div>
                <label className='input-field-names'><strong>Wedding Date:</strong></label>
                <input
                  type="date"
                  name="weddingDate"
                  value={orderData.weddingDate}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className='form-control'
                />
              </div>
              <div>
                <label className='input-field-names'><strong>Courier Date:</strong></label>
                <input
                  type="text"
                  name="courierDate"
                  value={orderData.courierDate}
                  readOnly
                  className='form-control'
                />
              </div>
              <div>
                <label className='input-field-names'><strong>Return Date:</strong></label>
                <input
                  type="date"
                  name="returnDate"
                  value={orderData.returnDate}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className='form-control'
                />
              </div>
              <div>
                <label className='input-field-names'><strong>Deposit Amount:</strong></label>
                <CurrencyInput
                  name="depositAmount"
                  prefix='Rs.'
                  value={orderData.depositAmount}
                  onValueChange={(value) => handleCurrencyInput(value, 'depositAmount')}
                  disabled={!isEditing}
                  className='form-control'
                  decimalsLimit={2}
                />
              </div>
              <div>
                <label className='input-field-names'><strong>Item Price:</strong></label>
                <CurrencyInput
                  name="itemPrice"
                  prefix='Rs.'
                  value={orderData.itemPrice}
                  onValueChange={(value) => handleCurrencyInput(value, 'itemPrice')}
                  disabled={!isEditing}
                  className='form-control'
                  decimalsLimit={2}
                />
              </div>
              <div>
                <label className='input-field-names'><strong>Paid Amount:</strong></label>
                <div className="paid-amount-container">
                  <CurrencyInput
                    name="paidAmount"
                    prefix='Rs.'
                    value={orderData.paidAmount}
                    onValueChange={(value) => handleCurrencyInput(value, 'paidAmount')}
                    disabled={!isEditing}
                    className='form-control'
                    decimalsLimit={2}
                  />
                  <div className="remaining-amount">
                    {isTransactionCompleted ? (
                      <span className='completed-transaction'>Transaction Completed</span>
                    ) : (
                      <span>Remaining Amount: Rs. {remainingAmount.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className='input-field-names'><strong>Total Amount:</strong></label>
                <CurrencyInput
                  name="totalAmount"
                  prefix='Rs.'
                  value={totalAmount}
                  readOnly
                  className='form-control'
                  decimalsLimit={2}
                />
              </div>
              {isEditing ? (
                <button type="button" onClick={handleSave} className='btn-success'>Save Changes</button>
              ) : (
                <button type="button" onClick={handleEdit} className='btn-edit'>Edit Order</button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderProfile;
