import { api } from "@/trpc/server";
import PipelineStages from "./_components/pipeline-stages";
import PipelineWrapper from "./_components/pipeline-wrapper";

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
        <div className="flex h-full flex-nowrap overflow-x-auto">
          <PipelineStages workspaceId={params.workspaceId} />
        </div>
      </PipelineWrapper>
    </div>
  );
}
