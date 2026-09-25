import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <ShieldX className="h-16 w-16 text-destructive mb-4" />
      <h1 className="text-3xl font-bold tracking-tight">Access Denied / ਪਹੁੰਚ ਤੋਂ ਇਨਕਾਰ</h1>
      <p className="text-muted-foreground mt-2 max-w-md">
        You do not have the required permissions or role to view this page.
      </p>
      <div className="flex gap-4 mt-6">
        <Link href="/">
          <Button variant="outline">ਮੁੱਖ ਪੰਨਾ / Home</Button>
        </Link>
        <Link href="/login">
          <Button>ਲਾਗਇਨ / Login</Button>
        </Link>
      </div>
    </div>
  );
}
