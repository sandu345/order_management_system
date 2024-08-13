import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles/payrollDashboard.css";
import VerticalNav from './VerticalNav';
import CurrencyInput from "react-currency-input-field";

function PayrollDashboard() {
  const [formData, setFormData] = useState({
    employeeName: "",
    employeeAddress: "",
    contactNumber: "",
    nic: "",
    branch: "",
    basicPayment: "",
    salary: "",
    bankAccountNo: "",
    joinedDate: "",
  });

  const [showPinModal, setShowPinModal] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [error, setError] = useState("");

  const hardcodedPin = "1234"; // Hardcoded PIN for now

  useEffect(() => {
    console.log('showPinModal changed:', showPinModal);
    if (showPinModal) {
      console.log('Modal should be visible now');
    }
  }, [showPinModal]);

  

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCurrencyChange = (value, name) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted');
    setShowPinModal(prevState => {
      console.log('Setting showPinModal to:', !prevState);
      return true;
    });
  };

  const handlePinSubmit = () => {
    console.log('PIN submitted:', enteredPin);
    if (enteredPin === hardcodedPin) {
      console.log('PIN is correct');
      saveEmployeeData();
    } else {
      console.log('PIN is incorrect');
      setError("Invalid PIN. Please try again.");
    }
  };

  const saveEmployeeData = async () => {
    try {
      const response = await axios.post("http://localhost:4000/payrollAddEmployee", formData);
      if (response.status === 200) {
        alert("Employee added successfully!");
        setFormData({
          employeeName: "",
          employeeAddress: "",
          contactNumber: "",
          nic: "",
          branch: "",
          basicPayment: "",
          salary: "",
          bankAccountNo: "",
          joinedDate: "",
        });
        setShowPinModal(false);
        setEnteredPin("");
      } else {
        console.error("Unexpected response status:", response.status);
        setError("Failed to save employee data. Please try again.");
      }
    } catch (error) {
      console.error("Error saving employee data:", error.response ? error.response.data : error.message);
      setError("Failed to save employee data. Please try again.");
    }
  };
  

  console.log('Rendering. showPinModal:', showPinModal);

  return (
    <div className="register_page">
      <VerticalNav links={[
        { name: "All Orders", path: "/orders" },
        { name: "Add Employee", path: "/payrollDashboard" },
        { name: "Employee Report", path:"/employeeReport" },
        { name: "Generate Salary", path:"/generateSalary" },
        { name: "Salary Report", path:"/salaryReport" },
        { name: "LogOut", path: "/" },
      ]} />
      <div className="register_content">
        <div className="form_container">
          <div className="form_content">
            <h2 className="payroll-title">ADD NEW EMPLOYEE</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb_3">
                <label className='input_field_names'><strong>Employee Name:</strong></label>
                <input
                  type="text"
                  name="employeeName"
                  value={formData.employeeName}
                  onChange={handleInputChange}
                  className='form_control'
                  required
                />
              </div>
              <div className="mb_3">
                <label className='input_field_names'><strong>Address:</strong></label>
                <input
                  type="text"
                  name="employeeAddress"
                  value={formData.employeeAddress}
                  onChange={handleInputChange}
                  className='form_control'
                  required
                />
              </div>
              <div className="mb_3">
                <label className='input_field_names'><strong>Contact Number:</strong></label>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  className='form_control'
                  required
                />
              </div>
              <div className="mb_3">
                <label className='input_field_names'><strong>National ID Number:</strong></label>
                <input
                  type="text"
                  name="nic"
                  value={formData.nic}
                  onChange={handleInputChange}
                  className='form_control'
                  required
                />
              </div>
              <div className="mb_3">
                <label className='input_field_names'><strong>Branch:</strong></label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  className='form_control'
                  required
                >
                  <option value="">Select Branch</option>
                  <option value="Kiribathgoda">Kiribathgoda</option>
                  <option value="Pilimathalawa">Pilimathalawa</option>
                </select>
              </div>
              <div className="mb_3">
                <label className='input_field_names'><strong>Basic Payment:</strong></label>
                <CurrencyInput
                  name="basicPayment"
                  placeholder="Enter Basic Payment Amount"
                  prefix="Rs."
                  className="form_control"
                  decimalScale={2}
                  value={formData.basicPayment}
                  onValueChange={(value) => handleCurrencyChange(value, "basicPayment")}
                  required
                />
              </div>
              <div className="mb_3">
                <label className='input_field_names'><strong>Salary:</strong></label>
                <CurrencyInput
                  name="salary"
                  placeholder="Enter the Salary"
                  prefix="Rs."
                  className="form_control"
                  decimalScale={2}
                  value={formData.salary}
                  onValueChange={(value) => handleCurrencyChange(value, "salary")}
                  required
                />
              </div>
              <div className="mb_3">
                <label className='input_field_names'><strong>Bank Account No:</strong></label>
                <input
                  type="text"
                  name="bankAccountNo"
                  value={formData.bankAccountNo}
                  onChange={handleInputChange}
                  className='form_control'
                  required
                />
              </div>
              <div className="mb_3">
                <label className='input_field_names'><strong>Joined Date:</strong></label>
                <input
                  type="Date"
                  name="joinedDate"
                  value={formData.joinedDate}
                  onChange={handleInputChange}
                  className='form_control'
                  required
                />
              </div>
              <div className="form_footer">
                <button type="submit" className="btn-success">
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showPinModal && (
        <div className="modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          {console.log('Rendering modal')}
          <div className="modal_content" style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '5px',
            width: '300px',
          }}>
            <h2>Enter PIN</h2>
            <input
              type="password"
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value)}
              className="form_control"
              required
            />
            {error && <p className="error">{error}</p>}
            <button onClick={handlePinSubmit} className="btn-success">
              Confirm
            </button>
            <button onClick={() => setShowPinModal(false)} className="btn-cancel">
              Cancel
            </button>
          </div>
        </div>
      )}

      <button onClick={() => setShowPinModal(prev => !prev)}>
        {/* Toggle Modal (Test) */}
      </button>
    </div>
  );
}

export default PayrollDashboard;