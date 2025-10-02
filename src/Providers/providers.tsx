"use client"

import { QueryClientProvider , QueryClient } from "@tanstack/react-query"
import { trpc } from "@/utils/trpc";
import { ReactNode, use, useState } from "react";
import { httpBatchLink } from "@trpc/react-query";

export function Providers({ children }: { children: ReactNode }): ReactNode {
    const [queryClient] = useState(() => new QueryClient());
    const [trpcClient] = useState(
        () => trpc.createClient({
            links: [
                httpBatchLink({
                    url: "/api/trpc"
                })
            ]
        })
    );

    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </trpc.Provider>
    )
}