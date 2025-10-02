# tRPC Setup Flow Cheat Sheet

This guide provides a quick reference for setting up a tRPC project, particularly within a Next.js environment.

---

## Server

### 📄 `trpc.ts`

**tRPC Instance Creation and Exports**

This is the foundational file where you initialize tRPC. It's a good place to add global configurations like error formatters.

```typescript
import { initTRPC } from '@trpc/server';
import { ZodError } from 'zod';

// If you need a context, define it here
// export type Context = { /* ... */ };

export const t = initTRPC.create({
  // If using a context:
  // export const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Export reusable tRPC components.
 */
export const router = t.router;
export const publicProcedure = t.procedure;
// Add protectedProcedure, middlewares, etc. here
```

---

### 📄 `_app.ts` (or your main router file)

**Application Router Definition**

This file aggregates all your modular routers into a single main `appRouter`.

```typescript
import { z } from 'zod';
import { router, publicProcedure } from './trpc';

export const appRouter = router({
  // Example procedure
  data: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      // Your logic here
      return { result: `Item ID: ${input.id}` };
    }),
  // ... add more procedures and routers here
});

// Export the router's type signature to be used on the client
export type AppRouter = typeof appRouter;
```

---

## API Route (Next.js App Router)

### 📄 `app/api/trpc/[trpc]/route.ts`

**Next.js API Handler**

This dynamic route acts as the entry point for all tRPC requests from the client.

```typescript
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/_app'; // Adjust path as needed

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({}), // Define your context creation function here
  });

export { handler as GET, handler as POST };
```

---

## Client

### 📄 `trpcClient.ts`

**Client-Side tRPC Configuration**

This file sets up the tRPC client and the link to your API endpoint.

```typescript
import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@/server/_app'; // Adjust path as needed

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc', // Use the absolute URL if needed
    }),
  ],
});
```

---

### 📄 `providers.tsx`

**Context Providers**

Wraps your application with the necessary providers for tRPC and React Query to function.

```typescript
'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClient } from './trpcClient';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

---

### 📄 `page.tsx`

**Client-Side Hook Usage**

An example of how to use the auto-generated, type-safe hooks in your components.

```typescript
'use client';

import { trpc } from '@/utils/trpcClient'; // Adjust path as needed

function DataComponent() {
  const { data, isLoading } = trpc.data.useQuery({ id: "42" });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <h1>{data?.result}</h1>;
}
```

---

## tRPC Setup Flow (Simplified)

### 🔹 Server Side

- **initTRPC**: Creates your core tRPC instance
  - *Analogy*: Like creating an `express()` app, but it's type-safe from the start

- **Routers**: Group your related procedures (endpoints)
  - *Analogy*: Like grouping routes in Express with `app.use('/users', userRouter)`

- **Procedures**: Define what each endpoint does. It takes a validated input (using Zod) and returns a response

- **API Handler**: The connection between your server framework (like Next.js) and tRPC
  - It tells Next.js: "Send all requests hitting `/api/trpc` to my main tRPC `appRouter`"

### 🔹 Client Side

- **Create tRPC Client**: Defines the configuration for the client to talk to the server (e.g., endpoint URL, headers)
  - *Output*: Generates type-safe React Hooks (e.g., `trpc.data.useQuery()`)

- **Provider**: Wraps your React application with the necessary context
  - Requires both `trpc.Provider` and `QueryClientProvider` (from TanStack Query) so the generated hooks can function anywhere in your component tree

- **Usage**: Call the generated hooks in your components to fetch or mutate data with full type safety
