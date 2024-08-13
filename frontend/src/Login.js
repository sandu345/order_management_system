import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import validation from "./LoginValidation";
import axios from "axios";
import './styles.css';
import logo from './images/logo.jpg';

const api = axios.create({
  baseURL: 'http://localhost:4000/',
});

function Login() {
  const [values, setValues] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const handleInput = (event) => {
    setValues((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validation(values);
    setErrors(validationErrors);
    setServerError("");
    if (!validationErrors.email && !validationErrors.password) {
      api.post("/login", values)
        .then((res) => {
          console.log('Response:', res.data);
          if (res.data === "Success") {
            navigate("/home");
          } else {
            setServerError("Invalid email or password.");
          }
        })
        .catch((err) => {
          console.log('Error:', err.response ? err.response.data : err.message);
          setServerError("An error occurred. Please try again.");
        });
    }
  };

  return (
    <div className="full-height-center">
      <div className="form-container">
        <img src={logo} alt="Logo" className="logo" onClick={() => navigate('/home')} />
        <form className="signup-form">
          <h2 className="signup-title">Sign In</h2>
        </form>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="input-field-names">
              <strong>Email</strong>
            </label>
            <input
              type="email"
              placeholder="Enter your Email"
              name="email"
              onChange={handleInput}
              className="form-control"
            />
            {errors.email && <span className="text-danger">{errors.email}</span>}
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="input-field-names">
              <strong>Password</strong>
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your Password"
              onChange={handleInput}
              className="form-control"
            />
            {errors.password && <span className="text-danger">{errors.password}</span>}
          </div>
          {serverError && (
            <div className="mb-3">
              <span className="text-danger">{serverError}</span>
            </div>
          )}
          <button type="submit" className="btn-success">
            Login
          </button>
          <p className="input-field-names">You agree to our terms and policies.</p>
          <Link to="/signup" className="btn-default">
            Create Account
          </Link>
        </form>
      </div>
    </div>
  );
}

export default Login;