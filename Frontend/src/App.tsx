import { useEffect } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./hooks/useAuth";

import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Product } from "./pages/Product";

function App() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const redirectTimeout = setTimeout(() => {
        navigate("/events");
      }, 500);
      return () => clearTimeout(redirectTimeout);
    }
  }, [navigate, isAuthenticated]);
  return (
    <AuthProvider>
      <div>
        <Container>
          <Row>
            <Col md={3}></Col>
            <Col md={6}>
              <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Product />} />
                <Route path="*" element={<Navigate to=".." />} />
              </Routes>
            </Col>
            <Col md={3}></Col>
          </Row>
        </Container>
      </div>
    </AuthProvider>
  );
}

export default App;
