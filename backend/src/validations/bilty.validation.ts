import { z } from 'zod';

export const biltySchema = z.object({
  biltyNo: z.string().min(1, "Bilty number is required"),
  date: z.string().min(1, "Date is required"),
  truckNo: z.string().min(1, "Vehicle number is required"),
  driverNo: z.string().min(1, "Driver number is required"),
  cnic: z.any().optional(), // Can be JSON
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  sender: z.string().min(1, "Sender is required"),
  receiver: z.string().min(1, "Receiver is required"),
  quantity: z.string().min(1, "Quantity is required"),
  description: z.string().min(1, "Description is required"),
  totalFare: z.string().min(1, "Total fare is required"),
  advance: z.string().min(1, "Advance is required"),
  balance: z.string().min(1, "Balance is required"),
  containerNo: z.any().optional(),
  shippingLine: z.string().optional(),
});

export type BiltyInput = z.infer<typeof biltySchema>;
