import { Separator } from "@/components/ui/separator";

export function ItemDrawerSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 animate-pulse">
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-7 w-16 rounded-md bg-muted" />
        ))}
        <div className="ml-auto h-7 w-16 rounded-md bg-muted" />
      </div>
      <Separator />
      <div className="space-y-2">
        <div className="h-3 w-20 rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-16 rounded bg-muted" />
        <div className="h-28 rounded-md bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-10 rounded bg-muted" />
        <div className="flex gap-1.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-5 w-12 rounded-full bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}
