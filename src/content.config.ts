import { defineCollection } from "astro:content";

export const collections = {} as const satisfies Record<string, ReturnType<typeof defineCollection>>;
