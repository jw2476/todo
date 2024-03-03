import { z } from "zod";

export const schema = z.object({
    username: z.string().min(2).max(50),
    password: z.string().min(5).max(50),
});

export type Schema = typeof schema;