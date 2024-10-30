import { redirect } from "next/navigation";
import MainLayout from "./_component/main-layout";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/login");
  }

  await api.workspaces.listWorkspaces.prefetch();

  return <MainLayout>{children}</MainLayout>;
}
