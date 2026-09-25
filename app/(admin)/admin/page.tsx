import { auth } from "@/auth";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ShieldAlert, Sliders, Database } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-muted/10">
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold tracking-tight text-primary">
              ਪੰਖ ਐਡਮਿਨ / Admin Console
            </span>
            <Badge variant="destructive">{session?.user?.role || "ADMIN"}</Badge>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Logged in as {session?.user?.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-bold">Admin Management Console</h1>
          <p className="text-muted-foreground mt-1">
            Protected area for platform administrators and super administrators to manage AlertRules,
            audit logs, knowledge base sources, and user verifications.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Farmers & Vets</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">System Users</div>
              <p className="text-xs text-muted-foreground mt-1">Directory management</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Sentinel Thresholds</CardTitle>
              <Sliders className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">AlertRules</div>
              <p className="text-xs text-muted-foreground mt-1">Mortality & Feed thresholds</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Audit Logs</CardTitle>
              <ShieldAlert className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Audit Trail</div>
              <p className="text-xs text-muted-foreground mt-1">Compliance & action logs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Knowledge Base</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">RAG Chunks</div>
              <p className="text-xs text-muted-foreground mt-1">Approved veterinary sources</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
