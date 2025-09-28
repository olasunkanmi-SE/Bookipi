import {
  ICreateOrderResponse,
  IGetUserOrder,
} from "../interfaces/event.interface";
import { eventApi } from "./axios";

export const makeOrder = async (
  productId: string
): Promise<ICreateOrderResponse> => {
  const response = await eventApi.post("orders/create", productId);
  return response.data.data;
};

export const getOrder = async (): Promise<IGetUserOrder> => {
  const response = await eventApi.get("orders/user");
  return response.data.data;
};
