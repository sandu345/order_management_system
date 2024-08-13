// File: src/Home.js
import React, { useState, useEffect, useCallback } from "react";
import VerticalNav from "./VerticalNav";
import "./styles/Home.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import debounce from "lodash/debounce";

function Home() {
  const [dateTime, setDateTime] = useState(new Date());
  const [ordersToDispatch, setOrdersToDispatch] = useState([]);
  const [itemsToCollect, setItemsToCollect] = useState([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchOrdersToDispatch = async () => {
      try {
        const response = await axios.get("http://localhost:4000/ordersToDispatchToday");
        const orders = response.data.filter(order => 
          order.items.some(item => !item.isDispatched)
        );
        setOrdersToDispatch(orders);
      } catch (error) {
        console.error("Error fetching orders to dispatch today:", error);
      }
    };

    const fetchTotalOrders = async () => {
      try {
        const response = await axios.get("http://localhost:4000/totalOrders");
        setTotalOrders(response.data.totalOrders);
      } catch (error) {
        console.error("Error fetching total orders:", error);
      }
    };

    const fetchMonthlyEarnings = async () => {
      try {
        const response = await axios.get("http://localhost:4000/allOrders");
        const orders = response.data;
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const earnings = orders
          .filter((order) => {
            const orderDate = new Date(order.orderedDate);
            return (
              orderDate.getMonth() + 1 === currentMonth &&
              orderDate.getFullYear() === currentYear &&
              parseFloat(order.itemPrice) + parseFloat(order.courierCharge) ===
                parseFloat(order.paidAmount)
            );
          })
          .reduce((total, order) => total + parseFloat(order.itemPrice), 0);
        setMonthlyEarnings(earnings);
      } catch (error) {
        console.error("Error fetching monthly earnings:", error);
      }
    };

    const fetchItemsToCollect = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/itemsToCollectToday"
        );
        setItemsToCollect(response.data);
      } catch (error) {
        console.error("Error fetching items to collect:", error);
      }
    };

    fetchOrdersToDispatch();
    fetchTotalOrders();
    fetchMonthlyEarnings();
    fetchItemsToCollect();
  }, []);

  const fetchSearchResults = useCallback(
    debounce(async (term) => {
      if (term.trim() !== "") {
        setIsSearchLoading(true);
        try {
          const response = await axios.get(
            "http://localhost:4000/searchCustomer",
            {
              params: { name: term },
            }
          );
          setSearchResults(response.data || []);
          setSearchError(null);
        } catch (error) {
          setSearchResults([]);
          setSearchError(
            error.response?.data || "An error occurred while searching"
          );
        } finally {
          setIsSearchLoading(false);
        }
      } else {
        setSearchResults([]);
        setSearchError(null);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchSearchResults(searchTerm);
  }, [searchTerm, fetchSearchResults]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setSelectedIndex(-1);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchResults.length > 0) {
      navigate(
        `/customerProfile/${
          searchResults[selectedIndex !== -1 ? selectedIndex : 0].customerID
        }`
      );
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((prevIndex) =>
        prevIndex < searchResults.length - 1 ? prevIndex + 1 : prevIndex
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : prevIndex
      );
    } else if (event.key === "Enter" && selectedIndex !== -1) {
      event.preventDefault();
      navigate(`/customerProfile/${searchResults[selectedIndex].customerID}`);
    }
  };

  const formatDateParts = (date) => {
    const options = { weekday: "long", month: "long", year: "numeric" };
    const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
    const month = date.toLocaleDateString("en-US", { month: "long" });
    const year = date.getFullYear();
    const day = date.getDate();
    const ordinalSuffix = getOrdinalSuffix(day);
    const dayWithSuffix = `${day}${ordinalSuffix}`;

    return { weekday, dayWithSuffix, month, year };
  };

  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const handleOrderClick = (orderId) => {
    navigate(`/order-profile/${orderId}`);
  };

  const handleDispatchChange = async (orderId, itemName, isDispatched) => {
    try {
      const response = await axios.put(`http://localhost:4000/updateOrderDispatch/${orderId}`, {
        itemName,
        isDispatched
      });
  
      if (response.data.fullyDispatched) {
        // Remove the order from the list if all items are dispatched
        setOrdersToDispatch(prevOrders => prevOrders.filter(order => order.orderId !== orderId));
      } else {
        // Update the order's dispatch status
        setOrdersToDispatch(prevOrders => 
          prevOrders.map(order => 
            order.orderId === orderId 
              ? { ...order, items: order.items.map(item =>
                  item.itemName === itemName
                    ? { ...item, isDispatched: isDispatched }
                    : item
                )}
              : order
          )
        );
      }
    } catch (error) {
      console.error("Error updating order dispatch status:", error);
    }
  };

  const { weekday, dayWithSuffix, month, year } = formatDateParts(dateTime);

  return (
    <div className="home-page">
      <VerticalNav
        links={[
          { name: "All Orders", path: "/orders" },
          { name: "Add New Customer", path: "/customerRegister" },
          { name: "Payroll System", path:"/payrollDashboard" },
          { name: "LogOut", path: "/" },
        ]}
      />

      <div className="content-wrapper">
        <div className="top-bar">
          <div className="search-container">
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Search Customer by Name"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
              />
              <button type="submit">Search</button>
            </form>
            {isSearchLoading && (
              <div className="search-loading">Loading...</div>
            )}
            {searchResults.length > 0 && !isSearchLoading && (
              <div className="search-results">
                {searchResults.map((result, index) => (
                  <div
                    key={result.customerID}
                    className={`search-result-item ${
                      index === selectedIndex ? "selected" : ""
                    }`}
                  >
                    <Link to={`/customerProfile/${result.customerID}`}>
                      {result.name}
                    </Link>
                  </div>
                ))}
              </div>
            )}
            {searchError && !isSearchLoading && (
              <div className="search-error">
                <p>{searchError}</p>
                <Link to="/customerRegister">Register New Customer</Link>
              </div>
            )}
          </div>
        </div>

        <div className="main-content">
          <div className="date-display">
            <h2>Today is</h2> <br />
            <h1 className="weekday">{weekday}</h1>
            <h1 className="month-day">
              {dayWithSuffix} {month}
            </h1>
            <h1 className="year">{year}</h1>
          </div>
          <div className="earning-total-complete-content">
            <div className="dashboard-stats">
              <div className="earning-content">
                <h1>Rs. {monthlyEarnings}</h1>
                <br />
                <h5>This month earning</h5>
              </div>

              <div className="total_orders">
                <div className="total_orders_sub">
                  <h1>{totalOrders}</h1>
                  <br />
                  <h5>Total Orders</h5>
                </div>
              </div>

              <div className="complete_orders">
                <div className="complete_orders_sub">
                  <h1></h1>
                  <br />
                  <h5>Complete Orders</h5>
                </div>
              </div>
            </div>
          </div>

          <hr className="separator" />
          <h2>Orders to Dispatch Today</h2>

          {ordersToDispatch.length > 0 ? (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Items and Dispatch Status</th>
                </tr>
              </thead>
              <tbody>
                {ordersToDispatch.map((order) => (
                  <tr key={order.orderId}>
                    <td
                      className="clickable"
                      onClick={() => handleOrderClick(order.orderId)}
                      style={{
                        cursor: "pointer",
                        color: "blue",
                        textDecoration: "underline",
                      }}
                    >
                      {order.orderId}
                    </td>
                    <td>{order.customerName}</td>
                    <td>
                      <ul>
                        {order.items.map((item) => (
                          <li key={item.itemName}>
                            {item.itemName} - {item.isDispatched ? 'Dispatched' : 'Not Dispatched'}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No orders to dispatch today</p>
          )}

          <hr className="separator" />
          <h2>Items to Collect</h2>

          {itemsToCollect.length > 0 ? (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Return Date</th>
                  <th>Status</th>
                  <th>Items</th>
                </tr>
              </thead>
              <tbody>
                {itemsToCollect.map((item) => (
                  <tr
                    key={item.orderId}
                    className={item.isOverdue ? "overdue" : ""}
                  >
                    <td
                      className="clickable"
                      onClick={() => handleOrderClick(item.orderId)}
                      style={{
                        cursor: "pointer",
                        color: "blue",
                        textDecoration: "underline",
                      }}
                    >
                      {item.orderId}
                    </td>
                    <td>{item.customerName}</td>
                    <td>{new Date(item.returnDate).toLocaleDateString()}</td>
                    <td>{item.isOverdue ? "Overdue" : "Due Today"}</td>
                    <td>{item.items}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No items to collect</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
