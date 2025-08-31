import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  InputGroup,
} from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import api from "../../utils/api";
import Loader from "../Loader";
import Message from "../Message";

const AuthSignin = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });

  const [formErrors, setFormErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "username":
        if (!value.trim()) error = "Username is required";
        break;
      case "email":
        if (!value) error = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(value)) error = "Invalid email format";
        break;
      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 6) error = "Min 6 characters required";
        break;
      case "confirmPassword":
        if (value !== formValues.password) error = "Passwords do not match";
        break;
      case "termsAccepted":
        if (!value) error = "You must accept terms and conditions";
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedValue = type === "checkbox" ? checked : value;

    setFormValues((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));

    setFormErrors((prev) => ({
      ...prev,
      [name]: validateField(name, updatedValue),
    }));
  };

  const isFormValid = () => {
    const requiredFields = [
      "username",
      "email",
      "password",
      "confirmPassword",
      "termsAccepted",
    ];
    return requiredFields.every(
      (field) => !validateField(field, formValues[field])
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      setMessage("Please correct the errors in the form.");
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const { data } = await api.post(
        "/api/auth/signup",
        {
          username: formValues.username,
          email: formValues.email,
          password: formValues.password,
        }
      );

      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate("/login");
    } catch (error) {
      setMessage(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row>
        <Col md={{ span: 6, offset: 3 }}>
          <Form
            onSubmit={handleSubmit}
            className="border p-4 rounded shadow-sm"
          >
            <h3 className="text-center mb-4 bg-light p-2">Signup Here</h3>

            {message && (
              <div className="alert alert-danger text-center">{message}</div>
            )}

            <Form.Group controlId="username" className="mb-3">
              <Form.Label>UserName</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Username"
                name="username"
                value={formValues.username}
                onChange={handleChange}
                isInvalid={!!formErrors.username}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.username}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="email" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your Email"
                name="email"
                value={formValues.email}
                onChange={handleChange}
                isInvalid={!!formErrors.email}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="password" className="mb-3">
              <Form.Label>
                <i
                  className={`fa ${
                    showPassword ? "fa-eye-slash" : "fa-eye"
                  } me-2`}
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ cursor: "pointer" }}
                ></i>
                Password
              </Form.Label>
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Enter your Password"
                name="password"
                value={formValues.password}
                onChange={handleChange}
                isInvalid={!!formErrors.password}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.password}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="confirmPassword" className="mb-3">
              <Form.Label>
                <i
                  className={`fa ${
                    showPassword ? "fa-eye-slash" : "fa-eye"
                  } me-2`}
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ cursor: "pointer" }}
                ></i>
                Confirm Password
              </Form.Label>
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                name="confirmPassword"
                value={formValues.confirmPassword}
                onChange={handleChange}
                isInvalid={!!formErrors.confirmPassword}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.confirmPassword}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="terms" className="mb-3">
              <Form.Check
                type="checkbox"
                name="termsAccepted"
                label="Agree to terms and conditions"
                checked={formValues.termsAccepted}
                onChange={handleChange}
                isInvalid={!!formErrors.termsAccepted}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.termsAccepted}
              </Form.Control.Feedback>
            </Form.Group>

            <Button
              type="submit"
              variant="success"
              className="w-100"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Signup"}
            </Button>

            <div className="text-center mt-3">
              Already User?{" "}
              <Link to="/login" className="fw-bold text-success">
                Login In
              </Link>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default AuthSignin;
