import { redirect } from "next/navigation";
import MainLayout from "./_component/main-layout";
import { getServerAuthSession } from "@/server/auth";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/login");
  }

  return <MainLayout>{children}</MainLayout>;
}
