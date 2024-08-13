import React, { useState, useEffect } from "react";
import VerticalNav from "./VerticalNav";
import "./styles/Home.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CompletedOrders() {
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompletedOrders = async () => {
      try {
        const response = await axios.get("http://localhost:4000/completedOrders");
        console.log("Fetched completed orders:", response.data);

        // Fetch item names for each order
        const ordersWithItemNames = await Promise.all(
          response.data.map(async (order) => {
            const itemNamesResponse = await axios.get(
              `http://localhost:4000/orderItems/${order.orderId}`
            );
            const itemNames = itemNamesResponse.data.map((item) => item.itemName);
            return {
              ...order,
              itemNames: itemNames.join(", "),
            };
          })
        );

        setCompletedOrders(ordersWithItemNames);
      } catch (error) {
        console.error("Error fetching completed orders:", error);
        setError("Error fetching completed orders");
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedOrders();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dateString;
  };

  const handleOrderClick = (orderId) => {
    navigate(`/order-profile/${orderId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="home-page">
      <VerticalNav
        links={[
          { name: "All Orders", path: "/orders" },
          { name: "Add New Customer", path: "/customerRegister" },
          { name: "LogOut", path: "/" },
        ]}
      />
      <div className="orders-content">
        <h2 className="orders-title">Completed Orders</h2>
        <table className="orders-table">
          <thead>
            <tr>
              <th>ORDER ID</th>
              <th>CUSTOMER NAME</th>
              <th>ITEM NAMES</th>
              <th>ITEM PRICE</th>
              <th>WEDDING DATE</th>
              <th>COURIER DATE</th>
              <th>RETURN DATE</th>
              <th>Transaction Status</th>
              <th>Items Returned</th>
            </tr>
          </thead>
          <tbody>
            {completedOrders.map((order) => (
              <tr key={order.orderId}>
                <td>
                  <span
                    className="order-id-link"
                    onClick={() => handleOrderClick(order.orderId)}
                  >
                    {order.orderId}
                  </span>
                </td>
                <td>{order.customerName}</td>
                <td>{order.itemNames}</td>
                <td>Rs.{order.itemPrice}</td>
                <td>{formatDate(order.weddingDate)}</td>
                <td>{formatDate(order.courierDate)}</td>
                <td>{formatDate(order.returnDate)}</td>
                <td>
                  <span style={{ color: "green" }}>Transaction Completed</span>
                </td>
                <td>
                  <span style={{ color: "green" }}>All Returned</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CompletedOrders;