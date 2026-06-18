import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
// import { posts } from "@/server/db/schema";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx: _ctx, input: _input }) => {
      // await ctx.db.insert(posts).values({
      //   name: input.name,
      // });
    }),

  getLatest: publicProcedure.query(async ({ ctx: _ctx }) => {
    // const post = await ctx.db.query.posts.findFirst({
    //   orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    // });

    // return post ?? null;
    return null as { id: number; name: string; createdAt: Date } | null;
  }),
});
