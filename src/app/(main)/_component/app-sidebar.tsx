"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { toast } from "@/hooks/use-toast";
import {
  useIframeOpen,
  useTelegram,
  useTgConnected,
  useTgUserId,
} from "@/services";
import {
  Bell,
  Calendar,
  LogIn,
  LogOut,
  Search,
  Send,
  Settings,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Inbox } from "lucide-react";
import { Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "#",
    icon: Home,
  },
  {
    title: "Tasks",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Notifications",
    url: "#",
    icon: Bell,
  },
  {
    title: "Batch send",
    url: "#",
    icon: Send,
    soon: true,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

export function AppSidebar() {
  const [iframeOpen, setIframeOpen] = useIframeOpen();
  const [tgConnected, setTgConnected] = useTgConnected();
  const [tgUserId, setTgUserId] = useTgUserId();
  const tg = useTelegram();
  const router = useRouter();

  const onLogout = async () => {
    if (!tg) {
      toast({
        title: "Telegram is not connected",
        description: "Please connect Telegram to continue",
      });
      return;
    }
    await tg.actions.proxy.signOut({
      forceInitApi: true,
    });
    setTgConnected(false);
    setTgUserId(undefined);
    void router.push("/login");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} aria-disabled={item.soon}>
                      <item.icon />
                      <span>{item.title}</span>
                      {item.soon && (
                        <span className="ml-auto rounded-full bg-muted-foreground/20 px-2 py-0.5 text-xs">
                          soon
                        </span>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setIframeOpen(!iframeOpen)}>
                  {iframeOpen ? <ToggleRight /> : <ToggleLeft />}
                  <span>Toggle Telegram</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/auth">
              <LogIn />
              <span>Login</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={onLogout}>
            <LogOut />
            <span>Logout</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
}
