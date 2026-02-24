import { Loader2 } from "lucide-react";

export default function AuthLoading() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  );
}
