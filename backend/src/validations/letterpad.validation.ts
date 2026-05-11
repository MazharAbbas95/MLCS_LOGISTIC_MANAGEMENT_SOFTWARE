import { z } from 'zod';

export const letterpadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

export type LetterpadInput = z.infer<typeof letterpadSchema>;
