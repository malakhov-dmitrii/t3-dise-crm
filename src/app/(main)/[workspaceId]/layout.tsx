"use client";

import { useEffect } from "react";
import { useLastWorkspaceId } from "../_component/main-layout";

export default function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { workspaceId: string };
}) {
  const [lastWorkspaceId, setLastWorkspaceId] = useLastWorkspaceId();

  // This part is needed here to save workspaceId for all nested pages and avoid unexpected workspaces changes
  useEffect(() => {
    if (lastWorkspaceId !== params.workspaceId && params.workspaceId) {
      setLastWorkspaceId(params.workspaceId);
    }
  }, [lastWorkspaceId, params.workspaceId, setLastWorkspaceId]);

  return <section>{children}</section>;
}
