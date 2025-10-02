"use client";
import { trpc } from "@/utils/trpc";

export default function Home() {

  const {data , isLoading} = trpc.hello.useQuery({name : "World"});

  if(isLoading) return <div>Loading...</div>

  return (
    <div>
      <h1>Hello {data?.greeting}</h1>
    </div>
  );
}
