import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from '@/app/server/routers/_app'
import { NextRequest, NextResponse } from "next/server";

const handler = (req: NextRequest) => {
    return fetchRequestHandler({
        endpoint: "/api/trpc",
        req,
        router: appRouter,
        createContext: () => ({}),
    })
}

export { handler as GET, handler as POST };