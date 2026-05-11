import { z } from 'zod';

export const vehicleRecordSchema = z.object({
  srNo: z.string().optional(),
  biltyNo: z.string().min(1, "Bilty number is required"),
  truckNo: z.string().min(1, "Vehicle number is required"),
  driverNo: z.string().optional(),
  partyKariya: z.coerce.number().min(0, "Amount cannot be negative").default(0),
  mlcsKariya: z.coerce.number().min(0, "Amount cannot be negative").default(0),
  vehicleKariya: z.coerce.number().min(0, "Amount cannot be negative").default(0),
  commission: z.coerce.number().min(0, "Amount cannot be negative").default(0),
  commissionStatus: z.string().default("Pending"),
  description: z.string().optional(),
  loadingStation: z.string().optional(),
  unloadingStation: z.string().optional(),
  partyMillName: z.string().optional(),
  broker: z.string().optional(),
  tafseelAkhrajat: z.string().optional(),
});

export type VehicleRecordInput = z.infer<typeof vehicleRecordSchema>;
