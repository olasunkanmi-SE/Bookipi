// Example usage
import Event from "./Event";
import { Container, Row } from "react-bootstrap";

export const Product = () => {
  const sampleProduct = {
    id: "1",
    name: "Wireless Noise-Cancelling Headphones",
    originalPrice: 299.99,
    salePrice: 199.99,
    imageUrl:
      "https://cdn.thewirecutter.com/wp-content/media/2023/09/noise-cancelling-headphone-2048px-0876.jpg?auto=webp&quality=75&width=1024&dpr=2",
    description: "Premium wireless headphones with active noise cancellation",
    stockQuantity: 15,
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
  };

  const handleBuy = () => {
    console.log("Purchase initiated");
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Event product={sampleProduct} onBuy={handleBuy} />
      </Row>
    </Container>
  );
};
