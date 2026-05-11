import { z } from 'zod';

export const expenseSchema = z.object({
  expenseMonth: z.string().min(1, "Month is required"),
  date: z.string().min(1, "Date is required"),
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().min(0, "Amount must be positive"),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
