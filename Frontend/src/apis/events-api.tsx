import { IFlashSaleResponse } from "../interfaces/event.interface";
import { eventApi } from "./axios";

export const GetFlashSaleEvent = async (): Promise<IFlashSaleResponse> => {
  const response = await eventApi.get("/flash-sales");
  return response.data.data;
};
