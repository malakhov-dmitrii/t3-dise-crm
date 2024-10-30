"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useIframeOpen } from "@/services";
import {
  Bell,
  ChevronDown,
  FolderSync,
  Kanban,
  LogOut,
  Send,
  Settings,
  ToggleLeft,
  ToggleRight,
  Users,
} from "lucide-react";
import { Inbox } from "lucide-react";
import { Home } from "lucide-react";
import Link from "next/link";
import useLogout from "@/hooks/use-logout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/trpc/react";
import { useLastWorkspaceId } from "./main-layout";
import { useCreateWorkspaceDialogOpen } from "@/components/dialogs/create-workspace-dialog";
import { PlusIcon } from "@radix-ui/react-icons";
import { ThemeToggle } from "@/components/utils/theme-toggle";
import { useTranslations } from "next-intl";
import { LocaleToggle } from "@/components/utils/locale-toggle";
import { useSyncFoldersDialogOpen } from "@/components/dialogs/sync-folders-dialog/sync-folders-dialog";

// Menu items.
const items = (t: ReturnType<typeof useTranslations>) => [
  {
    title: t("Dashboard"),
    url: "#",
    icon: Home,
  },
  {
    title: t("Tasks"),
    url: "#",
    icon: Inbox,
  },
  {
    title: t("Notifications"),
    url: "#",
    icon: Bell,
  },
  {
    title: t("Batch send"),
    url: "#",
    icon: Send,
    soon: true,
  },
];

export function AppSidebar() {
  const t = useTranslations("AppSidebar");
  const [isOpen, setIsOpen] = useCreateWorkspaceDialogOpen();
  const [syncFoldersDialogOpen, setSyncFoldersDialogOpen] =
    useSyncFoldersDialogOpen();
  const [iframeOpen, setIframeOpen] = useIframeOpen();
  const logout = useLogout();
  const [lastWorkspaceId] = useLastWorkspaceId();
  const { data: workspaces, isLoading } =
    api.workspaces.listWorkspaces.useQuery();

  const currentWorkspace = workspaces?.find(
    (workspace) => workspace.id === lastWorkspaceId,
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <DropdownMenu>
            <DropdownMenuTrigger disabled={isLoading}>
              <SidebarGroupLabel>
                {t("Workspace")}: {currentWorkspace?.name ?? "..."}{" "}
                <ChevronDown />
              </SidebarGroupLabel>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel className="text-xs">
                {t("Workspaces list")}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {workspaces?.map((workspace) => (
                <DropdownMenuItem
                  key={workspace.id}
                  className="text-xs"
                  disabled={workspace.id === lastWorkspaceId}
                  asChild
                >
                  <Link href={`/${workspace.id}`} className="flex items-center">
                    <div className="h-3 w-3 rounded-sm bg-slate-500"></div>
                    <p>{workspace.name}</p>
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-1 text-xs"
                onClick={() => setIsOpen(true)}
              >
                <PlusIcon className="h-1 w-1" />
                <p>{t("Create new")}</p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <SidebarGroupContent>
            <SidebarMenu>
              {items(t).map((item) => (
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
          <SidebarGroupLabel>{t("Actions")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setIframeOpen(!iframeOpen)}>
                  {iframeOpen ? <ToggleRight /> : <ToggleLeft />}
                  <span>{t("Toggle Telegram")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setSyncFoldersDialogOpen(true)}
                >
                  <FolderSync />
                  <span>{t("Sync Chats")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>{t("Settings")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Users />
                  <span>{t("Team")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Kanban />
                  <span>{t("Pipeline")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings />
                  <span>{t("General")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem className="ml-1 flex flex-wrap items-center gap-2">
                <ThemeToggle />

                <LocaleToggle />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenuItem></SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={logout}>
            <LogOut />
            <span>{t("Logout")}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
}
