import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import VerticalNav from './VerticalNav';
import './styles/allOrdersStyling.css';

function CustomerOrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customer, setCustomer] = useState(null);
  const { customerId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomerAndOrders = async () => {
      try {
        const [ordersResponse, customerResponse] = await Promise.all([
          axios.get(`http://localhost:4000/customerOrders/${customerId}`),
          axios.get(`http://localhost:4000/customerProfile/${customerId}`)
        ]);

        if (Array.isArray(ordersResponse.data)) {
          setOrders(ordersResponse.data);
        } else {
          console.error("Unexpected data format:", ordersResponse.data);
          setError("Unexpected data format received from server");
        }

        setCustomer(customerResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerAndOrders();
  }, [customerId]);

  const handleOrderClick = (orderId) => {
    navigate(`/order-profile/${orderId}`);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="orders-page">
      <VerticalNav links={[
        { name: "All Orders", path: "/orders" },
        { name: "Add New Customer", path: "/customerRegister" },
        { name: "LogOut", path: "/" },
      ]} />
      <div className="orders-content">
        <h2 className="orders-title">Customer Orders</h2>
        {customer && (
          <div className="customer-info">
            <p><strong>Customer Name:</strong> {customer.name}</p>
            <p><strong>Customer ID:</strong> {customer.customerID}</p>
          </div>
        )}
        {orders.length === 0 ? (
          <p>No orders found for this customer.</p>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>ITEMS</th>
                <th>ITEM PRICE</th>
                <th>PAID AMOUNT</th>
                <th>TRANSACTION STATUS</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.orderId}>
                  <td>
                    <span 
                      className="order-link" 
                      onClick={() => handleOrderClick(order.orderId)}
                      style={{cursor: 'pointer', color: 'blue', textDecoration: 'underline'}}
                    >
                      {order.orderId}
                    </span>
                  </td>
                  <td>
                    <ul>
                      {order.items && order.items.map((item, index) => (
                        <li key={index}>
                          {item.itemName} - {item.isReturned ? "Returned" : "Not Returned"}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>Rs.{order.itemPrice}</td>
                  <td>Rs.{order.paidAmount}</td>
                  <td>{order.transactionStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default CustomerOrderList;