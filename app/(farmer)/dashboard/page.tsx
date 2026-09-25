import { auth } from "@/auth";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Bell, FileText, IndianRupee } from "lucide-react";

export default async function FarmerDashboardPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-muted/10">
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold tracking-tight text-primary">
              ਪੰਖ ਡੈਸ਼ਬੋਰਡ / Farmer Portal
            </span>
            <Badge variant="secondary">Role: {session?.user?.role || "FARMER"}</Badge>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              ਜੀ ਆਇਆਂ ਨੂੰ, {session?.user?.name || session?.user?.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-bold">ਸਵਾਗਤ ਹੈ / Welcome to Pankh</h1>
          <p className="text-muted-foreground mt-1">
            This is your poultry farm dashboard placeholder. In Phase 1 to 4, you will record daily
            flock logs, receive Sentinel early disease alerts, escalate cases to Punjab vets, and track
            batch economics.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Daily Health Log</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 Active Logs</div>
              <p className="text-xs text-muted-foreground mt-1">Ready for check-ins</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Sentinel Risk</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">NORMAL</div>
              <p className="text-xs text-muted-foreground mt-1">No alerts triggered</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 Pending</div>
              <p className="text-xs text-muted-foreground mt-1">Vet escalation ready</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Batch Economics</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹0.00</div>
              <p className="text-xs text-muted-foreground mt-1">Batch profit & FCR</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
