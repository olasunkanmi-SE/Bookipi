import React, { useState, useEffect } from "react";
import { Card, Button, Badge } from "react-bootstrap";
import styled from "styled-components";

interface FlashSaleProductProps {
  product: {
    id: string;
    name: string;
    originalPrice: number;
    salePrice: number;
    imageUrl: string;
    description: string;
    stockQuantity: number;
    endTime: Date;
  };
  onBuy: () => void;
}

const StyledCard = styled(Card)`
  max-width: 300px;
  transition: transform 0.2s;
  margin: 16px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const TimerBadge = styled.div`
  background-color: #232f3e;
  color: white;
  padding: 8px;
  text-align: center;
  font-size: 0.9rem;
  margin: 12px;
  border-radius: 4px;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 8px 0;
`;

const SalePrice = styled.span`
  font-size: 1.5rem;
  color: #b12704;
  font-weight: bold;
`;

const OriginalPrice = styled.span`
  color: #565959;
  text-decoration: line-through;
  font-size: 1rem;
`;

const Event: React.FC<FlashSaleProductProps> = ({ product, onBuy }) => {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [soldOutPercentage, setSoldOutPercentage] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = product.endTime.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft("Deal ended");
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [product.endTime]);

  useEffect(() => {
    const totalItems = product.stockQuantity;
    const percentageSold =
      ((totalItems - product.stockQuantity) / totalItems) * 100;
    setSoldOutPercentage(percentageSold);
  }, [product.stockQuantity]);

  const calculateDiscount = () => {
    const discount =
      ((product.originalPrice - product.salePrice) / product.originalPrice) *
      100;
    return Math.round(discount);
  };

  return (
    <StyledCard>
      <TimerBadge>Deal ends in: {timeLeft}</TimerBadge>

      <Card.Img
        variant="top"
        src={product.imageUrl}
        style={{ height: "200px", objectFit: "cover" }}
      />

      <Card.Body>
        <Badge bg="danger" className="mb-2">
          Save {calculateDiscount()}%
        </Badge>

        <Card.Title>{product.name}</Card.Title>

        <PriceContainer>
          <SalePrice>${product.salePrice.toFixed(2)}</SalePrice>
          <OriginalPrice>${product.originalPrice.toFixed(2)}</OriginalPrice>
        </PriceContainer>

        <Card.Text
          className={`text-${
            product.stockQuantity < 10 ? "danger" : "success"
          }`}
        >
          {product.stockQuantity > 0
            ? `${product.stockQuantity} left in stock`
            : "Out of stock"}
        </Card.Text>

        <Button
          variant="warning"
          className="w-100"
          onClick={onBuy}
          disabled={product.stockQuantity === 0 || timeLeft === "Deal ended"}
        >
          {product.stockQuantity === 0 ? "Sold Out" : "Buy Now"}
        </Button>
      </Card.Body>
    </StyledCard>
  );
};

export default Event;
