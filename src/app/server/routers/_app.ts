import z from "zod";
import {router , publicProcedure} from "../trpc";

export const appRouter = router({
    hello  : publicProcedure
        .input(
            z.object({
                name : z.string().min(1 , "Name is required")
            })
        )
        .query(({input}) => {
            return {
                greeting : `Hello ${input.name}`
            }
        })
})

export type AppRouter = typeof appRouter;