"use client";

export default function Page({ params }: { params: { workspaceId: string } }) {
  return (
    <div className="w-full">
      <div className="h-[calc(100vh-5rem)] w-full rounded-lg bg-card py-4 shadow">
        <p className="text-center text-sm text-muted-foreground">
          Pipelines will be here
        </p>
      </div>
    </div>
  );
}
