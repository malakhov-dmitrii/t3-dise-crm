import { api } from "@/trpc/server";
import PipelineStages from "./_components/pipeline-stages";
import PipelineWrapper from "./_components/pipeline-wrapper";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default async function Page({
  params,
}: {
  params: { workspaceId: string };
}) {
  await api.workspaces.getWorkspace.prefetch({
    workspaceId: params.workspaceId,
  });

  return (
    <div className="">
      <PipelineWrapper>
        <ScrollArea className="h-full">
          <div className="flex h-full flex-nowrap">
            <PipelineStages workspaceId={params.workspaceId} />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </PipelineWrapper>
    </div>
  );
}
