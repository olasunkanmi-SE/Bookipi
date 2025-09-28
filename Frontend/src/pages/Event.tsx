/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Alert, Button, Card } from "react-bootstrap";
import { useMutation, useQueryClient } from "react-query";
import styled from "styled-components";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { ICreateOrderResponse } from "../interfaces/event.interface";
import { useQuery } from "react-query";
import { getOrder } from "../apis/order-api";

interface FlashSaleProductProps {
  product: {
    id: string;
    name: string;
    originalPrice: number;
    salePrice: number;
    imageUrl: string;
    description: string;
    stockQuantity: number;
    startDate: string;
    endDate: string;
  };
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

const Event: React.FC<FlashSaleProductProps> = ({ product }) => {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [saleStatus, setSaleStatus] = useState<"upcoming" | "active" | "ended">(
    "upcoming"
  );
  const [hasAlreadyPurchased, setHasAlreadyPurchased] = useState(false);

  const [error, setError] = useState<any>();

  const [purchaseResponse, setpurchaseResponse] = useState<any>();

  const queryClient = useQueryClient();

  const axiosPrivate = useAxiosPrivate();

  const userOrders = async () => {
    const response = await axiosPrivate.get("orders/user");
    return response;
  };

  const { data: orders } = useQuery("userOrders", userOrders, {
    retry: false, // Don't retry on failure
    onError: (error: any) => {
      console.error("Query error:", error);
      setError(error?.response?.data?.message || "Failed to fetch orders");
    },
  });

  const makeOrder = async (
    productId: string
  ): Promise<ICreateOrderResponse> => {
    const response = (await axiosPrivate.post("orders/create", {
      productId,
    })) as any;
    return response;
  };

  const createOrderMutation = useMutation(makeOrder, {
    onSuccess: () => {
      queryClient.invalidateQueries("events");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const createOrder = async (productId: string) => {
    try {
      setError(null);
      const response = await createOrderMutation.mutateAsync(productId);
      setpurchaseResponse(response.data.data.message);
    } catch (err: any) {
      console.log(err);
      const errorMessage =
        err.response?.data?.details || "Error while making order";
      setError(errorMessage);
      if (errorMessage === "You have already made a purchase") {
        setHasAlreadyPurchased(true);
      }

      throw err;
    }
  };

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const startDate = new Date(product.startDate);
      const endDate = new Date(product.endDate);
      endDate.setHours(23, 59, 59, 999);

      if (now < startDate) {
        setSaleStatus("upcoming");
        const difference = startDate.getTime() - now.getTime();
        return formatTimeLeft(difference, "Sale starts in");
      } else if (now > endDate) {
        setSaleStatus("ended");
        return "Sale has ended";
      } else {
        setSaleStatus("active");
        const difference = endDate.getTime() - now.getTime();
        return formatTimeLeft(difference, "Sale ends in");
      }
    };

    const formatTimeLeft = (difference: number, prefix: string) => {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (days > 0) {
        return `${prefix}: ${days}d ${hours}h`;
      }
      return `${prefix}: ${hours}h ${minutes}m ${seconds}s`;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [product.startDate, product.endDate]);

  const handlePurchase = async () => {
    await createOrder(product.id);
  };

  return (
    <>
      {orders ? (
        <Alert variant="success" className="mt-3">
          <Alert.Heading>Order Successful!</Alert.Heading>
        </Alert>
      ) : (
        <></>
      )}

      <StyledCard>
        <TimerBadge
          style={{
            backgroundColor:
              saleStatus === "upcoming"
                ? "#232f3e"
                : saleStatus === "active"
                ? "#067D62"
                : "#B12704",
          }}
        >
          {timeLeft}
        </TimerBadge>

        <Card.Img
          variant="top"
          src={product.imageUrl}
          style={{
            height: "200px",
            objectFit: "cover",
            opacity: saleStatus === "ended" ? 0.7 : 1,
          }}
        />

        <Card.Body>
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
            variant={saleStatus === "active" ? "warning" : "secondary"}
            className="w-100"
            onClick={handlePurchase}
            disabled={
              saleStatus !== "active" ||
              product.stockQuantity === 0 ||
              hasAlreadyPurchased ||
              createOrderMutation.isLoading
            }
          >
            {saleStatus === "upcoming"
              ? "Coming Soon"
              : saleStatus === "ended"
              ? "Sale Ended"
              : product.stockQuantity === 0
              ? "Sold Out"
              : createOrderMutation.isLoading
              ? "Processing..."
              : "Buy Now"}
          </Button>
          {error && <div className="text-danger mt-2 text-center">{error}</div>}
          {purchaseResponse && (
            <div className="text-success mt-2 text-center">
              {purchaseResponse}
            </div>
          )}
        </Card.Body>
      </StyledCard>
    </>
  );
};

export default Event;
