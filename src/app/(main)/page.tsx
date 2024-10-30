import { getServerAuthSession } from "@/server/auth";
import { redirect, useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/trpc/server";
import { Skeleton } from "@/components/ui/skeleton";

export default async function Home() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/login");
  }

  await api.workspaces.listWorkspaces.prefetch();

  return (
    <div className="w-full">
      <Skeleton className="h-[calc(100vh-5rem)] w-full rounded-lg bg-white py-4 shadow dark:bg-neutral-900"></Skeleton>
    </div>
  );
}
