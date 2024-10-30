"use client";

import React, { PropsWithChildren } from "react";
import { useIframeOpen } from "@/services";
import { cn } from "@/lib/utils";
import { useSidebarOpen } from "@/components/ui/sidebar";

// Its needed to wrap layout in client component to use iframeOpen and track card size
const PipelineWrapper = ({ children }: PropsWithChildren) => {
  const [iframeOpen] = useIframeOpen();
  const [sidebarOpen] = useSidebarOpen();
  return (
    <div
      className={cn(
        "h-[calc(100vh-5rem)] w-full max-w-[calc(100vw-290px)] overflow-hidden rounded-lg bg-white shadow transition-all duration-300 dark:bg-neutral-900",
        iframeOpen && "max-w-[calc(100vw-460px)]",
        !sidebarOpen && "max-w-[calc(100vw)]",
      )}
    >
      {children}
    </div>
  );
};

export default PipelineWrapper;
