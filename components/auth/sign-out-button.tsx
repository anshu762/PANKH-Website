"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function SignOutButton() {
  const { t } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 text-xs"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      <LogOut className="h-3.5 w-3.5" />
      {t.common.signOut}
    </Button>
  );
}
