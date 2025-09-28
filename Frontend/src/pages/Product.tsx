// Example usage
import { Container, Row } from "react-bootstrap";
import { useQuery } from "react-query";
import { Navigate } from "react-router-dom";
import { GetFlashSaleEvent } from "../apis/events-api";
import { NavBar } from "../components/NavBar";
import { useAuth } from "../hooks/useAuth";
import Event from "./Event";

export const Product = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const {
    isLoading,
    isError,
    error,
    data: flashSaleResponse,
  } = useQuery<any, Error>("flashSales", GetFlashSaleEvent);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (isLoading) {
    <div className="loading-skeleton">
      <div className="rectangular-div"></div>
    </div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  const currentFlashSale = flashSaleResponse ? flashSaleResponse[0] : undefined;

  if (!currentFlashSale) {
    return <div>No flash sales available</div>;
  }

  const product = {
    id: String(currentFlashSale.product.id),
    name: String(currentFlashSale.product.name),
    originalPrice: parseFloat(currentFlashSale.product.price),
    salePrice: parseFloat(currentFlashSale.product.price) * 0.7,
    imageUrl:
      "https://cdn.thewirecutter.com/wp-content/media/2023/09/noise-cancelling-headphone-2048px-0876.jpg?auto=webp&quality=75&width=1024&dpr=2",
    description: String(currentFlashSale.product.name),
    stockQuantity: Number(currentFlashSale.product.stock),
    startDate: String(currentFlashSale.startDate),
    endDate: String(currentFlashSale.endDate),
  };

  return (
    <Container>
      <NavBar />
      <Row className="justify-content-center">
        <Event product={product} />
      </Row>
    </Container>
  );
};
