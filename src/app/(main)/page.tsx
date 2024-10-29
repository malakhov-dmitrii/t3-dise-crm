import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  return (
    <div className="w-full">
      <div className="h-[calc(100vh-5rem)] w-full rounded-lg bg-white py-4 shadow">
        <p className="text-center text-sm text-muted-foreground">
          Pipelines will be here
        </p>
      </div>
    </div>
  );
}
