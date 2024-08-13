import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./styles/payrollDashboard.css";
import VerticalNav from './VerticalNav';

function GenerateSalary() {
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [branch, setBranch] = useState('');
  const [employee, setEmployee] = useState('');
  const [basicPayment, setBasicPayment] = useState(0);
  const [salary, setSalary] = useState(0);
  const [totalLeave, setTotalLeave] = useState(0);
  const [leaveDeduction, setLeaveDeduction] = useState(0);
  const [netSalary, setNetSalary] = useState(0);
  const [showNetSalary, setShowNetSalary] = useState(false);
  const [showPinPopup, setShowPinPopup] = useState(false);
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const hardcodedPin = '1234';

  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [years, setYears] = useState([]);

  const clearErrorMessage = () => {
    setErrorMessage('');
  };

  useEffect(() => {
    // Fetch branches
    axios.get('http://localhost:4000/payroll/branches')
      .then(response => setBranches(response.data))
      .catch(error => console.error('Error fetching branches:', error));

    // Generate years (current year and 5 years back)
    const currentYear = new Date().getFullYear();
    setYears(Array.from({length: 6}, (_, i) => currentYear - i));
  }, []);

  useEffect(() => {
    clearErrorMessage();
    if (branch) {
      // Fetch employees for the selected branch
      axios.get(`http://localhost:4000/payroll/employees/${branch}`)
        .then(response => setEmployees(response.data))
        .catch(error => console.error('Error fetching employees:', error));
    }
  }, [branch]);

  useEffect(() => {
    clearErrorMessage();
    if (employee) {
      // Fetch employee details
      axios.get(`http://localhost:4000/payroll/employee/${employee}`)
        .then(response => {
          setBasicPayment(response.data.basicPay);
          setSalary(response.data.salary);
        })
        .catch(error => console.error('Error fetching employee details:', error));
    }
  }, [employee]);

  useEffect(() => {
    // Calculate net salary
    const calculatedNetSalary = salary - leaveDeduction;
    setNetSalary(calculatedNetSalary);
  }, [salary, leaveDeduction]);

  useEffect(() => {
    clearErrorMessage();
  }, [month, year]);

  const handleGenerateSalary = (e) => {
    e.preventDefault();
    clearErrorMessage();
    const calculatedNetSalary = salary - leaveDeduction;
    setNetSalary(calculatedNetSalary);
  
    // First, check if salary has already been generated
    axios.get('http://localhost:4000/payroll/checkSalaryGenerated', {
      params: { month, year, employeeId: employee }
    })
    .then(response => {
      if (response.data.isGenerated) {
        setErrorMessage(response.data.message);
      } else {
        // If salary hasn't been generated, proceed with generation
        axios.post('http://localhost:4000/payroll/generateSalary', {
          month,
          year,
          employeeId: employee,
          basicPayment,
          salary,
          totalLeave,
          leaveDeduction,
          netSalary: calculatedNetSalary
        })
        .then(response => {
          console.log('Salary saved successfully:', response.data);
          alert('Salary saved successfully!');
          setShowNetSalary(true);
        })
        .catch(error => {
          console.error('Error saving salary:', error);
          setErrorMessage(error.response?.data?.message || 'Error saving salary. Please try again.');
        });
      }
    })
    .catch(error => {
      console.error('Error checking salary generation:', error);
      setErrorMessage('Error checking salary generation. Please try again.');
    });
  };

  const handlePaySalary = () => {
    axios.get(`http://localhost:4000/payroll/checkSalaryPaid`, { params: { month, year, employeeId: employee } })
      .then(response => {
        if (response.data.isPaid) {
          setErrorMessage(`Salary is already paid for ${month}.`);
        } else {
          setShowPinPopup(true);
        }
      })
      .catch(error => {
        console.error('Error checking payment status:', error);
        setErrorMessage('Error checking payment status.');
      });
  };

  const handlePinSubmit = () => {
    if (pin === hardcodedPin) {
      axios.post('http://localhost:4000/payroll/paySalary', {
        month,
        year,
        employeeId: employee,
        netSalary
      })
      .then(response => {
        alert(`Payment for ${month} is done.`);
        setShowPinPopup(false);
      })
      .catch(error => {
        console.error('Error updating payment status:', error);
        setErrorMessage('Error updating payment status.');
      });
    } else {
      setErrorMessage('Incorrect PIN. Please try again.');
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
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
            <h2 className="payroll-title">GENERATE SALARY</h2>
            <form onSubmit={handleGenerateSalary}>
              <div className="mb_3">
                <label className='input_field_names'><strong>Month:</strong></label>
                <select value={month} onChange={(e) => { setMonth(e.target.value); clearErrorMessage(); }} required>
                  <option value="">Select Month</option>
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="mb_3">
                <label className='input_field_names'><strong>Current Year:</strong></label>
                <select value={year} onChange={(e) => { setYear(e.target.value); clearErrorMessage(); }} required>
                  <option value="">Select Year</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="mb_3">
                <label className='input_field_names'><strong>Branch:</strong></label>
                <select value={branch} onChange={(e) => { setBranch(e.target.value); clearErrorMessage(); }} required>
                  <option value="">Select Branch</option>
                  {branches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="mb_3">
                <label className='input_field_names'><strong>Select Employee:</strong></label>
                <select value={employee} onChange={(e) => { setEmployee(e.target.value); clearErrorMessage(); }} required>
                  <option value="">Select Employee</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div className="mb_3">
                <label className='input_field_names'><strong>Basic Payment:</strong></label>
                <input type="number" value={basicPayment} readOnly />
              </div>
              <div className="mb_3">
                <label className='input_field_names'><strong>Salary:</strong></label>
                <input type="number" value={salary} readOnly />
              </div>
              <div className="mb_3">
                <label className='input_field_names'><strong>Total Leave:</strong></label>
                <input type="number" value={totalLeave} onChange={(e) => setTotalLeave(Number(e.target.value))} />
              </div>
              <div className="mb_3">
                <label className='input_field_names'><strong>Leave Deduction:</strong></label>
                <input type="number" value={leaveDeduction} onChange={(e) => setLeaveDeduction(Number(e.target.value))} />
              </div>
              
              <div className="form_footer">
                <button type="submit" className="btn-success">
                  Generate Net Salary
                </button>
              </div>
            </form>
            {showNetSalary && (
              <div className="net-salary-display">
                <h3>Net Salary: {netSalary}</h3>
                <button onClick={handlePaySalary} className="btn-primary">
                  Paid
                </button>
              </div>
            )}
            {showPinPopup && (
              <div className="pin-popup">
                <h3>Enter PIN to Confirm Payment</h3>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                />
                <button onClick={handlePinSubmit} className="btn-success">
                  Submit
                </button>
                <button onClick={() => setShowPinPopup(false)} className="btn-danger">
                  Cancel
                </button>
              </div>
            )}
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GenerateSalary;