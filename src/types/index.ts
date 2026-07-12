export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string; // url or placeholder
  isAvailable: boolean;
}

export type VariantType = "Setengah Matang" | "Matang";

export interface ToppingOption {
  id: string;
  name: string;
  price: number;
}

export interface OrderDetails {
  menuItem: MenuItem;
  variant: VariantType;
  selectedToppings: ToppingOption[];
  customerName: string;
  notes: string;
  quantity: number;
  subtotal: number;
}

export interface PaymentDetails {
  method: "QRIS" | "Cash";
  grandTotal: number;
  uploadedReceipt: File | null;
  uploadedReceiptUrl?: string;
}

export type QueueStep = 1 | 2 | 3 | 4;

export interface OrderQueueStatus {
  queueNumber: string;
  currentStep: QueueStep;
  customerName: string;
  orderDetails: OrderDetails;
}
