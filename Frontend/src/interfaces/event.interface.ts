interface IAuditFields {
  auditCreatedDateTime: string;
  auditCreatedBy: string;
  auditModifiedDateTime: string | null;
  auditModifiedBy: string | null;
  auditDeletedDateTime: string | null;
  auditDeletedBy: string | null;
}

interface IProduct extends IAuditFields {
  id: string;
  stock: number;
  name: string;
  price: string;
}

interface IFlashSale extends IAuditFields {
  id: string;
  startDate: string;
  endDate: string;
  productId: string;
  product: IProduct;
}

interface IFlashSaleResponse {
  data: IFlashSale[];
  isSuccess: boolean;
}

export interface ICreateOrderResponse {
  data: {
    data: {
      message: string;
    };
  };
}

type OrderStatus = "success" | "pending" | "failed";

export interface IGetUserOrder {
  id: string;
  userId: string;
  productId: string;
  idempotencyKey: string;
  status: OrderStatus;
}

export type { IFlashSaleResponse, IFlashSale, IProduct, IAuditFields };
