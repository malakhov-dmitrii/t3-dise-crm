import { getServerAuthSession } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await getServerAuthSession();

  void api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <div className="w-full">
        <div className="h-[calc(100vh-5rem)] w-full rounded-lg bg-white py-4 shadow">
          <p className="text-center text-sm text-muted-foreground">
            Pipelines will be here
          </p>
        </div>
      </div>
    </HydrateClient>
  );
}
