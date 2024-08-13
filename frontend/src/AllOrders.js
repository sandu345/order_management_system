import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VerticalNav from "./VerticalNav";
import "./styles/allOrdersStyling.css";
import axios from "axios";

function AllOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortCriteria, setSortCriteria] = useState("weddingDate");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:4000/allOrders");
        console.log("Fetched orders:", response.data);
        if (Array.isArray(response.data)) {
          // Filter out the completed orders
          const remainingOrders = response.data.filter(
            (order) =>
              order.paidAmount < order.itemPrice ||
              !order.allItemsReturned ||
              !order.allItemsDispatched
          );
          sortOrders(remainingOrders);
        } else {
          setError("Unexpected data format");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Error fetching orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const sortOrders = (orders) => {
    const sortedOrders = [...orders].sort((a, b) => {
      return new Date(a[sortCriteria]) - new Date(b[sortCriteria]);
    });
    setOrders(sortedOrders);
  };

  const handleSortChange = (event) => {
    const newCriteria = event.target.value;
    setSortCriteria(newCriteria);
    sortOrders(orders);
  };

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
    <div className="orders-page">
      <VerticalNav
        links={[
          { name: "Completed Orders", path: "/completedOrders" },
          { name: "Add New Customer", path: "/customerRegister" },
          { name: "LogOut", path: "/" },
        ]}
      />
      <div className="orders-content">
        <h2 className="orders-title">All Orders</h2>
        <label htmlFor="sortCriteria">Sort by: </label>
        <select
          id="sortCriteria"
          value={sortCriteria}
          onChange={handleSortChange}
        >
          <option value="weddingDate">Wedding Date</option>
          <option value="courierDate">Courier Date</option>
          <option value="returnDate">Return Date</option>
        </select>
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
            {orders.map((order) => (
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
                  {order.paidAmount >= order.itemPrice ? (
                    <span style={{ color: "green" }}>Transaction Completed</span>
                  ) : (
                    <span>Not Completed</span>
                  )}
                </td>
                <td>
                  {order.allItemsReturned ? (
                    <span style={{ color: "green" }}>All Returned</span>
                  ) : (
                    <span style={{ color: "red" }}>Not All Returned</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AllOrders;