import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles/payrollDashboard.css";
import VerticalNav from './VerticalNav';

function EmployeeReport() {
  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState(null);
  const [updateMessage, setUpdateMessage] = useState('');

  useEffect(() => {
    // Fetch branches when component mounts
    fetchBranches();
  }, []);

  useEffect(() => {
    // Fetch employees when selected branch changes
    if (selectedBranch) {
      fetchEmployees(selectedBranch);
    }
  }, [selectedBranch]);

  useEffect(() => {
    // Fetch employee details when selected employee changes
    if (selectedEmployee) {
      fetchEmployeeDetails(selectedEmployee);
    }
  }, [selectedEmployee]);

  const fetchBranches = async () => {
    try {
      const response = await axios.get('http://localhost:4000/payroll/branches');
      setBranches(response.data);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchEmployees = async (branch) => {
    try {
      const response = await axios.get(`http://localhost:4000/payroll/employees/${branch}`);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchEmployeeDetails = async (employeeId) => {
    try {
      const response = await axios.get(`http://localhost:4000/payroll/employee/${employeeId}`);
      setEmployeeDetails(response.data);
    } catch (error) {
      console.error('Error fetching employee details:', error);
    }
  };

  const handleBranchChange = (e) => {
    setSelectedBranch(e.target.value);
    setSelectedEmployee('');
    setEmployeeDetails(null);
  };

  const handleEmployeeChange = (e) => {
    setSelectedEmployee(e.target.value);
  };

  const handleDeleteClick = () => {
    if (!selectedEmployee) {
      setDeleteMessage('Please select an employee to delete.');
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:4000/payroll/employee/${selectedEmployee}`, {
        data: { employeeName: employeeDetails.name }
      });
      setDeleteMessage('Employee deleted successfully.');
      setSelectedEmployee('');
      setEmployeeDetails(null);
      if (selectedBranch) {
        fetchEmployees(selectedBranch);
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      setDeleteMessage('Error deleting employee. Please try again.');
    } finally {
      setShowConfirmDialog(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedEmployee({ ...employeeDetails });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedEmployee(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedEmployee({ ...editedEmployee, [name]: value });
  };

  const handleUpdateEmployee = async () => {
    try {
      await axios.put(`http://localhost:4000/payroll/employee/${selectedEmployee}`, editedEmployee);
      setUpdateMessage('Employee updated successfully.');
      setEmployeeDetails(editedEmployee);
      setIsEditing(false);
      if (selectedBranch) {
        fetchEmployees(selectedBranch);
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      setUpdateMessage('Error updating employee. Please try again.');
    }
  };


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
            <h2 className="payroll-title">Employee Report</h2>
            <form>
              <div className="mb_3">
                <label className='input_field_names'><strong>Select Branch:</strong></label>
                <select value={selectedBranch} onChange={handleBranchChange}>
                  <option value="">Select a branch</option>
                  {branches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>
              <div className="mb_3">
                <label className='input_field_names'><strong>Select Employee:</strong></label>
                <select value={selectedEmployee} onChange={handleEmployeeChange} disabled={!selectedBranch}>
                  <option value="">Select an employee</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>{employee.name}</option>
                  ))}
                </select>
              </div>
              {employeeDetails && !isEditing && (
                <>
                  <div className="mb_3">
                    <label className='input_field_names'><strong>Employee Name:</strong></label>
                    <span>{employeeDetails.name}</span>
                  </div>
                  <div className="mb_3">
                    <label className='input_field_names'><strong>Address:</strong></label>
                    <span>{employeeDetails.address}</span>
                  </div>
                  <div className="mb_3">
                    <label className='input_field_names'><strong>Contact number:</strong></label>
                    <span>{employeeDetails.contact}</span>
                  </div>
                  <div className="mb_3">
                    <label className='input_field_names'><strong>National ID Number:</strong></label>
                    <span>{employeeDetails.nic}</span>
                  </div>
                  <div className="mb_3">
                    <label className='input_field_names'><strong>Branch:</strong></label>
                    <span>{employeeDetails.branch}</span>
                  </div>
                  <div className="mb_3">
                    <label className='input_field_names'><strong>Basic Payment:</strong></label>
                    <span>{employeeDetails.basicPay}</span>
                  </div>
                  <div className="mb_3">
                    <label className='input_field_names'><strong>Salary:</strong></label>
                    <span>{employeeDetails.salary}</span>
                  </div>
                  <div className="mb_3">
                    <label className='input_field_names'><strong>Bank Account Number:</strong></label>
                    <span>{employeeDetails.bankAccountNum}</span>
                  </div>
                  <div className="mb_3">
                    <label className='input_field_names'><strong>Joined Date:</strong></label>
                    <span>{employeeDetails.joinedDate}</span>
                  </div>
                  <div className="mb_3">
                    <label className='input_field_names'><strong>Status:</strong></label>
                    <span>{employeeDetails.status}</span>
                  </div>
                  <div className="mb_3">
                  <button type="button" onClick={handleEditClick} className="edit-btn">
                      Edit Employee
                    </button>
                    <button type="button" onClick={handleDeleteClick} className="delete-btn">
                      Delete Employee
                    </button>
                  </div>
                </>
              )}
              {isEditing && editedEmployee && (
                <>
                  <div className="mb_3">
                    <label className='input_field_names'><strong>Employee Name:</strong></label>
                    <input 
                      type="text" 
                      name="name" 
                      value={editedEmployee.name} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb_3">
                    <label className='input_field_names'><strong>Address:</strong></label>
                    <input 
                      type="text" 
                      name="address" 
                      value={editedEmployee.address} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb_3">
                    <label className='input_field_names'><strong>Contact Number:</strong></label>
                    <input 
                      type="text" 
                      name="contactNumber" 
                      value={editedEmployee.contact} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb_3">
                    <label className='input_field_names'><strong>National IC:</strong></label>
                    <input 
                      type="text" 
                      name="nic" 
                      value={editedEmployee.nic} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb_3">
                    <label className='input_field_names'><strong>Branch:</strong></label>
                    <input 
                      type="text" 
                      name="branch" 
                      value={editedEmployee.branch} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb_3">
                    <label className='input_field_names'><strong>Basic Payment:</strong></label>
                    <input 
                      type="text" 
                      name="basicPay" 
                      value={editedEmployee.basicPay} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb_3">
                    <label className='input_field_names'><strong>Salary:</strong></label>
                    <input 
                      type="text" 
                      name="salary" 
                      value={editedEmployee.salary} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb_3">
                    <label className='input_field_names'><strong>Bank Account Number:</strong></label>
                    <input 
                      type="text" 
                      name="bankAccountNum" 
                      value={editedEmployee.bankAccountNum} 
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb_3">
                    <label className='input_field_names'><strong>Joined Date:</strong></label>
                    <input 
                      type="text" 
                      name="joinedDate" 
                      value={editedEmployee.joinedDate} 
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  {/* Add similar input fields for other employee details */}
                  <div className="mb_3">
                    <button type="button" onClick={handleUpdateEmployee} className="update-btn">
                      Update Employee
                    </button>
                    <button type="button" onClick={handleCancelEdit} className="cancel-btn">
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {updateMessage && <p className="update-message">{updateMessage}</p>}
              {deleteMessage && <p className="delete-message">{deleteMessage}</p>}
            </form>
          </div>
        </div>
      </div>
      {showConfirmDialog && (
        <div className="confirm-dialog">
          <p>Are you sure you want to delete {employeeDetails.name}?</p>
          <button onClick={handleConfirmDelete}>Yes, Delete</button>
          <button onClick={handleCancelDelete}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default EmployeeReport;